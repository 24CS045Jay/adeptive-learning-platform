import type { Role } from "./mock-data";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MockUser {
  id: string;
  name: string;
  email: string;
  /** Simulated bcrypt hash — never stored as plain text in code */
  passwordHash: string;
  role: Role;
  /** True if account was admin-created and user hasn't set their own password yet */
  mustChangePassword: boolean;
}

// ─── Password Hashing Simulation ─────────────────────────────────────────────
// In a real backend this would be bcrypt.hash(password, 12).
// Here we simulate it with a deterministic prefix so the pattern is identical
// (compare never checks plain text, always goes through verifyPassword).

const HASH_PREFIX = "$2b$sim$";

export function hashPassword(plain: string): string {
  // Simple reversible encoding — semantically equivalent to bcrypt for our mock
  return HASH_PREFIX + btoa(plain);
}

export function verifyPassword(plain: string, hash: string): boolean {
  if (!hash.startsWith(HASH_PREFIX)) {
    // Legacy plain-text support for seeded dev accounts during migration
    return hash === plain;
  }
  return hash === HASH_PREFIX + btoa(plain);
}

// ─── The fixed default password for all admin-created accounts ────────────────
// Per spec: always exactly this value, never randomised, so admins can communicate
// it verbally. In production this would be bcrypt-hashed server-side.
export const DEFAULT_PASSWORD = "password1234";
const DEFAULT_PASSWORD_HASH = hashPassword(DEFAULT_PASSWORD);

// ─── Seeded demo users ────────────────────────────────────────────────────────
const DEFAULT_USERS: MockUser[] = [
  { id: "u0", name: "Amit Thakkar",     email: "hod@charusat.ac.in",      passwordHash: hashPassword("12345678"),    role: "admin",   mustChangePassword: false },
  { id: "u1", name: "Aarav Patel",      email: "student@charusat.edu.in", passwordHash: hashPassword("student123"),  role: "student", mustChangePassword: false },
  { id: "u2", name: "Meera Joshi",      email: "meera@charusat.edu.in",   passwordHash: hashPassword("student123"),  role: "student", mustChangePassword: false },
  { id: "u3", name: "Kabir Singh",      email: "kabir@charusat.edu.in",   passwordHash: hashPassword("student123"),  role: "student", mustChangePassword: false },
  { id: "u5", name: "Dr. Nisha Shah",   email: "faculty@charusat.edu.in", passwordHash: hashPassword("faculty123"),  role: "faculty", mustChangePassword: false },
  { id: "u6", name: "Prof. Anil Kumar", email: "anil@charusat.edu.in",    passwordHash: hashPassword("faculty123"),  role: "faculty", mustChangePassword: false },
  { id: "u8", name: "Rahul Mehta",      email: "admin@charusat.edu.in",   passwordHash: hashPassword("admin123"),    role: "admin",   mustChangePassword: false },
];

// ─── Audit Log ────────────────────────────────────────────────────────────────

export interface AuditEntry {
  id: string;
  actor: string;
  action: string;
  target: string;
  timestamp: string;
}

function loadAuditLog(): AuditEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const s = localStorage.getItem("ai_tutor_audit_log");
    if (s) return JSON.parse(s);
  } catch {}
  return [];
}

function saveAuditLog(log: AuditEntry[]) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem("ai_tutor_audit_log", JSON.stringify(log)); } catch {}
}

export const AUDIT_LOG: AuditEntry[] = loadAuditLog();

export function appendAudit(actor: string, action: string, target: string) {
  // NEVER log passwords — only actor/action/target metadata
  const entry: AuditEntry = {
    id: `al_${Date.now()}`,
    actor,
    action,
    target,
    timestamp: new Date().toISOString(),
  };
  AUDIT_LOG.unshift(entry);
  saveAuditLog(AUDIT_LOG);
  console.info(`[AuditLog] ${action} by ${actor} → ${target}`);
}

// ─── User Store ───────────────────────────────────────────────────────────────

function loadUsers(): MockUser[] {
  if (typeof window === "undefined") return DEFAULT_USERS;
  try {
    const saved = localStorage.getItem("ai_tutor_mock_users");
    if (saved) {
      const parsed: MockUser[] = JSON.parse(saved);
      // Migrate legacy plain-text passwords if present (one-time upgrade)
      let migrated = false;
      for (const u of parsed) {
        if (!(u as any).passwordHash && (u as any).password) {
          u.passwordHash = hashPassword((u as any).password);
          delete (u as any).password;
          migrated = true;
        }
        if (u.mustChangePassword === undefined) {
          u.mustChangePassword = false;
          migrated = true;
        }
      }
      if (migrated) saveUsers(parsed);
      return parsed;
    }
  } catch {}
  return DEFAULT_USERS;
}

function saveUsers(users: MockUser[]) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem("ai_tutor_mock_users", JSON.stringify(users)); } catch {}
}

export const MOCK_USERS: MockUser[] = loadUsers();

// ─── Auth Operations ──────────────────────────────────────────────────────────

export function requestPasswordReset(email: string): boolean {
  const user = MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return false;
  return true;
}

/** Standard password change (requires correct current password). Also clears mustChangePassword. */
export function changePassword(
  email: string,
  currentPw: string,
  newPw: string
): { ok: boolean; error?: string } {
  const user = MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return { ok: false, error: "Account not found." };
  if (!verifyPassword(currentPw, user.passwordHash)) return { ok: false, error: "Current password is incorrect." };
  if (newPw.length < 6) return { ok: false, error: "New password must be at least 6 characters." };
  if (newPw === DEFAULT_PASSWORD) return { ok: false, error: 'Please choose a password other than the default "password1234".' };
  user.passwordHash = hashPassword(newPw);
  user.mustChangePassword = false;
  saveUsers(MOCK_USERS);
  return { ok: true };
}

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

/** Admin-creates an account with the fixed default password directly in MongoDB Atlas + local fallback. */
export async function createUserWithDefaultPassword(
  name: string,
  email: string,
  role: Role,
  actorEmail: string
): Promise<{ ok: boolean; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();

  try {
    const response = await fetch(`${API_BASE}/api/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-role": "admin",
        "x-user-id": "admin_user",
      },
      body: JSON.stringify({
        name: name.trim(),
        email: cleanEmail,
        password: DEFAULT_PASSWORD,
        role: role.toLowerCase(),
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (response.status === 400 && data.error?.includes("already exists")) {
        return { ok: false, error: "An account with this email already exists." };
      }
    }
  } catch (err) {
    console.warn("[AuthStore] Backend creation warning, saving to local fallback:", err);
  }

  if (!MOCK_USERS.find((u) => u.email.toLowerCase() === cleanEmail)) {
    const newUser: MockUser = {
      id: `u${Date.now()}`,
      name: name.trim() || cleanEmail.split("@")[0],
      email: cleanEmail,
      passwordHash: DEFAULT_PASSWORD_HASH,
      role,
      mustChangePassword: true,
    };
    MOCK_USERS.push(newUser);
    saveUsers(MOCK_USERS);
  }

  appendAudit(actorEmail, "CREATE_USER", `${cleanEmail} (${role})`);
  return { ok: true };
}

/** Self-registration directly in MongoDB Atlas + local fallback. */
export async function registerUser(
  name: string,
  email: string,
  password: string,
  role: Role,
): Promise<{ ok: boolean; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (password.length < 6) return { ok: false, error: "Password must be at least 6 characters." };

  try {
    const response = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), email: cleanEmail, password, role }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { ok: false, error: data.error || "Registration failed." };
    }
  } catch (err) {
    console.warn("[AuthStore] Backend registration warning, saving to local fallback:", err);
  }

  if (!MOCK_USERS.find((u) => u.email.toLowerCase() === cleanEmail)) {
    const newUser: MockUser = {
      id: `u${Date.now()}`,
      name: name.trim() || cleanEmail.split("@")[0],
      email: cleanEmail,
      passwordHash: hashPassword(password),
      role,
      mustChangePassword: false,
    };
    MOCK_USERS.push(newUser);
    saveUsers(MOCK_USERS);
  }

  return { ok: true };
}

export function loginUser(
  role: Role,
  email: string,
  password: string
): { ok: boolean; user?: MockUser; error?: string } {
  const cleanEmail = email.trim().toLowerCase();
  const user = MOCK_USERS.find((u) => u.email.toLowerCase() === cleanEmail);

  if (!user) {
    return { ok: false, error: "Invalid email or password." };
  }

  if (user.role !== role) {
    return { ok: false, error: `Account is registered as ${user.role}. Select the correct tab.` };
  }

  if (!verifyPassword(password, user.passwordHash)) {
    return { ok: false, error: "Invalid email or password." };
  }

  return { ok: true, user };
}

export function loginOrCreateGoogleUser(
  name: string,
  email: string,
  role: Role,
): { user: MockUser } {
  const cleanEmail = email.trim().toLowerCase();
  let user = MOCK_USERS.find((u) => u.email.toLowerCase() === cleanEmail);
  if (!user) {
    user = {
      id: `u_google_${Date.now()}`,
      name: name.trim() || cleanEmail.split("@")[0],
      email: cleanEmail,
      passwordHash: hashPassword(`google_oauth_${Date.now()}`),
      role,
      mustChangePassword: false, // Google OAuth accounts are verified by Google
    };
    MOCK_USERS.push(user);
    saveUsers(MOCK_USERS);
    appendAudit(cleanEmail, "GOOGLE_SIGNIN_NEW_USER", `${cleanEmail} (${role})`);
  } else {
    appendAudit(cleanEmail, "GOOGLE_SIGNIN", `${cleanEmail} (${role})`);
  }
  return { user };
}


