import type { Role } from "./mock-data";

export interface MockUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
}

const DEFAULT_USERS: MockUser[] = [
  { id: "u1", name: "Aarav Patel",    email: "student@charusat.edu.in", password: "student123", role: "student" },
  { id: "u2", name: "Meera Joshi",    email: "meera@charusat.edu.in",   password: "student123", role: "student" },
  { id: "u3", name: "Kabir Singh",    email: "kabir@charusat.edu.in",   password: "student123", role: "student" },
  { id: "u5", name: "Dr. Nisha Shah", email: "faculty@charusat.edu.in", password: "faculty123", role: "faculty" },
  { id: "u6", name: "Prof. Anil Kumar", email: "anil@charusat.edu.in",  password: "faculty123", role: "faculty" },
  { id: "u8", name: "Rahul Mehta",    email: "admin@charusat.edu.in",   password: "admin123",   role: "admin"   },
];

function loadUsers(): MockUser[] {
  if (typeof window === "undefined") return DEFAULT_USERS;
  try {
    const saved = localStorage.getItem("ai_tutor_mock_users");
    if (saved) return JSON.parse(saved);
  } catch {}
  return DEFAULT_USERS;
}

function saveUsers(users: MockUser[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("ai_tutor_mock_users", JSON.stringify(users));
  } catch {}
}

export const MOCK_USERS: MockUser[] = loadUsers();

/** Valid invite codes for self-registration */
export const INVITE_CODES: Record<"faculty" | "admin", string[]> = {
  faculty: ["FAC-2026-CSPIT", "FAC-DEMO-001"],
  admin:   ["ADM-2026-CSPIT", "ADM-DEMO-001"],
};

const resetTokens = new Map<string, string>();

export function requestPasswordReset(email: string): boolean {
  const user = MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return false;
  resetTokens.set(email, "reset-token-demo");
  return true;
}

export function changePassword(email: string, currentPw: string, newPw: string): { ok: boolean; error?: string } {
  const user = MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return { ok: false, error: "Account not found." };
  if (user.password !== currentPw) return { ok: false, error: "Current password is incorrect." };
  if (newPw.length < 6) return { ok: false, error: "New password must be at least 6 characters." };
  user.password = newPw;
  saveUsers(MOCK_USERS);
  return { ok: true };
}

export function registerUser(
  name: string,
  email: string,
  password: string,
  role: Role,
  inviteCode?: string,
): { ok: boolean; error?: string } {
  const cleanEmail = email.trim().toLowerCase();
  if (MOCK_USERS.find((u) => u.email.toLowerCase() === cleanEmail)) {
    return { ok: false, error: "An account with this email already exists." };
  }
  if (password.length < 6) return { ok: false, error: "Password must be at least 6 characters." };
  const newUser: MockUser = {
    id: `u${Date.now()}`,
    name: name.trim() || cleanEmail.split("@")[0],
    email: cleanEmail,
    password,
    role,
  };
  MOCK_USERS.push(newUser);
  saveUsers(MOCK_USERS);
  return { ok: true };
}
