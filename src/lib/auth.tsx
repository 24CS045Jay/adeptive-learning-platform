import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import type { Role } from "./mock-data";
import {
  MOCK_USERS,
  requestPasswordReset,
  changePassword as storeCPw,
  registerUser as storeRegister,
  verifyPassword,
  loginOrCreateGoogleUser,
} from "./auth-store";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  token?: string;
  mustChangePassword?: boolean;
}

interface LoginResult {
  ok: boolean;
  error?: string;
  mustChangePassword?: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  login: (role: Role, email: string, password: string) => LoginResult;
  loginWithGoogle: (role: Role, email?: string, name?: string) => LoginResult;
  logout: () => void;
  sendPasswordReset: (email: string) => { ok: boolean; error?: string };
  changePassword: (currentPw: string, newPw: string) => { ok: boolean; error?: string };
  clearMustChangePw: () => void;
  register: (name: string, email: string, password: string, role: Role) => { ok: boolean; error?: string };
}

const AuthContext = createContext<AuthContextValue | null>(null);

let _onRegisterCallback: ((name: string, email: string, role: Role) => void) | null = null;
export function _setGlobalOnRegister(fn: (name: string, email: string, role: Role) => void) {
  _onRegisterCallback = fn;
}

// ─── Phase 9 Security Utilities ──────────────────────────────────────────────

export function validateFileUpload(fileName: string, fileSizeMb: number): { valid: boolean; error?: string } {
  const allowedExtensions = ["pdf", "pptx", "docx"];
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (!allowedExtensions.includes(ext)) {
    return { valid: false, error: `Invalid file format '.${ext}'. Only PDF, PPTX, and DOCX files are allowed.` };
  }
  if (fileSizeMb > 25) {
    return { valid: false, error: `File size (${fileSizeMb.toFixed(1)}MB) exceeds maximum limit of 25MB.` };
  }
  return { valid: true };
}

const rateLimitMap: Record<string, { count: number; resetTime: number }> = {};

export function checkApiRateLimit(endpoint: string, maxReqsPerMin = 30): { allowed: boolean; retryAfterSec?: number } {
  const now = Date.now();
  const entry = rateLimitMap[endpoint] ?? { count: 0, resetTime: now + 60000 };
  if (now > entry.resetTime) {
    entry.count = 1;
    entry.resetTime = now + 60000;
  } else {
    entry.count += 1;
  }
  rateLimitMap[endpoint] = entry;
  if (entry.count > maxReqsPerMin) {
    const retryAfterSec = Math.ceil((entry.resetTime - now) / 1000);
    return { allowed: false, retryAfterSec };
  }
  return { allowed: true };
}

export function checkRoleAccess(user: AuthUser | null, requiredRole: Role): { allowed: boolean; status: number; error?: string } {
  if (!user) return { allowed: false, status: 401, error: "Unauthorized — Please sign in." };
  if (user.role !== requiredRole) {
    const roleLabel = requiredRole.charAt(0).toUpperCase() + requiredRole.slice(1);
    return { allowed: false, status: 403, error: `Forbidden 403 — ${roleLabel.toUpperCase()} permission required.` };
  }
  return { allowed: true, status: 200 };
}

// ─── Persistence ──────────────────────────────────────────────────────────────

function loadSavedUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem("ai_tutor_active_user");
    if (saved) return JSON.parse(saved);
  } catch {}
  return null;
}

function persistUser(u: AuthUser | null) {
  if (typeof window === "undefined") return;
  if (u) {
    localStorage.setItem("ai_tutor_active_user", JSON.stringify(u));
  } else {
    localStorage.removeItem("ai_tutor_active_user");
  }
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(loadSavedUser);

  const saveActiveUser = (u: AuthUser | null) => {
    setUser(u);
    persistUser(u);
  };

  const login = useCallback((role: Role, email: string, password: string): LoginResult => {
    const cleanEmail = email.trim().toLowerCase();
    const account = MOCK_USERS.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!account) return { ok: false, error: "No account found with this email." };
    if (!verifyPassword(password, account.passwordHash)) return { ok: false, error: "Incorrect password." };
    if (account.role !== role) {
      const roleLabel = account.role.charAt(0).toUpperCase() + account.role.slice(1);
      return {
        ok: false,
        error: `This account is registered as a ${roleLabel}. Please select the ${roleLabel} tab to sign in.`,
      };
    }
    const authUser: AuthUser = {
      id: account.id,
      name: account.name,
      email: account.email,
      role: account.role,
      token: `jwt_simulated_${Date.now()}_${account.id}`,
      mustChangePassword: account.mustChangePassword ?? false,
    };
    saveActiveUser(authUser);
    return { ok: true, mustChangePassword: account.mustChangePassword ?? false };
  }, []);

  const loginWithGoogle = useCallback((role: Role, customEmail?: string, customName?: string): LoginResult => {
    const defaultEmail = role === "student" ? "student@charusat.edu.in" : role === "faculty" ? "faculty@charusat.edu.in" : "admin@charusat.edu.in";
    const email = customEmail || defaultEmail;
    const name = customName || (email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1) + " (Google)");
    
    const { user: account } = loginOrCreateGoogleUser(name, email, role);
    const authUser: AuthUser = {
      id: account.id,
      name: account.name,
      email: account.email,
      role: account.role,
      token: `google_oauth_token_${Date.now()}_${account.id}`,
      mustChangePassword: false, // Google account does not need default password change
    };
    saveActiveUser(authUser);
    if (_onRegisterCallback) {
      _onRegisterCallback(account.name, account.email, account.role);
    }
    return { ok: true, mustChangePassword: false };
  }, []);

  const logout = useCallback(() => { saveActiveUser(null); }, []);

  const sendPasswordReset = useCallback((email: string): { ok: boolean; error?: string } => {
    const ok = requestPasswordReset(email);
    return ok ? { ok: true } : { ok: false, error: "No account found with this email." };
  }, []);

  const changePassword = useCallback(
    (currentPw: string, newPw: string): { ok: boolean; error?: string } => {
      if (!user) return { ok: false, error: "Not logged in." };
      return storeCPw(user.email, currentPw, newPw);
    },
    [user],
  );

  /** Clears the mustChangePassword flag in the active session after a successful forced change */
  const clearMustChangePw = useCallback(() => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, mustChangePassword: false };
      persistUser(updated);
      return updated;
    });
  }, []);

  const register = useCallback(
    (name: string, email: string, password: string, role: Role) => {
      const result = storeRegister(name, email, password, role);
      if (result.ok) {
        if (_onRegisterCallback) {
          _onRegisterCallback(name || email.split("@")[0], email.trim().toLowerCase(), role);
        }
        const cleanEmail = email.trim().toLowerCase();
        const account = MOCK_USERS.find((u) => u.email.toLowerCase() === cleanEmail);
        if (account) {
          saveActiveUser({
            id: account.id,
            name: account.name,
            email: account.email,
            role: account.role,
            token: `jwt_simulated_${Date.now()}`,
            mustChangePassword: false,
          });
        }
      }
      return result;
    },
    [],
  );

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, logout, sendPasswordReset, changePassword, clearMustChangePw, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
