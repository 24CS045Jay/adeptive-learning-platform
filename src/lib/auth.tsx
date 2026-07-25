import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import type { Role } from "./mock-data";
import { MOCK_USERS, requestPasswordReset, changePassword as storeCPw, registerUser as storeRegister } from "./auth-store";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  token?: string; // JWT token simulation
}

interface AuthContextValue {
  user: AuthUser | null;
  login: (role: Role, email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
  sendPasswordReset: (email: string) => { ok: boolean; error?: string };
  changePassword: (currentPw: string, newPw: string) => { ok: boolean; error?: string };
  register: (name: string, email: string, password: string, role: Role, inviteCode?: string) => { ok: boolean; error?: string };
}

const AuthContext = createContext<AuthContextValue | null>(null);

let _onRegisterCallback: ((name: string, email: string, role: Role) => void) | null = null;
export function _setGlobalOnRegister(fn: (name: string, email: string, role: Role) => void) {
  _onRegisterCallback = fn;
}

// ─── Phase 9 Security Utilities ──────────────────────────────────────────────

/**
 * File Upload Security Validation (Allow-list, Max Size, Virus Scan Hook)
 */
export function validateFileUpload(fileName: string, fileSizeMb: number): { valid: boolean; error?: string } {
  const allowedExtensions = ["pdf", "pptx", "docx"];
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";

  if (!allowedExtensions.includes(ext)) {
    return { valid: false, error: `Invalid file format '.${ext}'. Only PDF, PPTX, and DOCX files are allowed.` };
  }

  if (fileSizeMb > 25) {
    return { valid: false, error: `File size (${fileSizeMb.toFixed(1)}MB) exceeds maximum limit of 25MB.` };
  }

  // Virus & Malware Scan Hook Placeholder (Clean)
  return { valid: true };
}

/**
 * API Rate Limiter Simulation (30 requests/minute token bucket)
 */
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

/**
 * Role Access Guard Enforcement (403 Forbidden check)
 */
export function checkRoleAccess(user: AuthUser | null, requiredRole: Role): { allowed: boolean; status: number; error?: string } {
  if (!user) return { allowed: false, status: 401, error: "Unauthorized — Please sign in." };
  if (user.role !== requiredRole) return { allowed: false, status: 403, error: `Forbidden 403 — ${requiredRole.toUpperCase()} permission required.` };
  return { allowed: true, status: 200 };
}

function loadSavedUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem("ai_tutor_active_user");
    if (saved) return JSON.parse(saved);
  } catch {}
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(loadSavedUser);

  const saveActiveUser = (u: AuthUser | null) => {
    setUser(u);
    if (typeof window === "undefined") return;
    if (u) {
      localStorage.setItem("ai_tutor_active_user", JSON.stringify(u));
    } else {
      localStorage.removeItem("ai_tutor_active_user");
    }
  };

  const login = useCallback((role: Role, email: string, password: string): { ok: boolean; error?: string } => {
    const cleanEmail = email.trim().toLowerCase();
    const account = MOCK_USERS.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!account) return { ok: false, error: "No account found with this email." };
    if (account.password !== password) return { ok: false, error: "Incorrect password." };
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
    };
    saveActiveUser(authUser);
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    saveActiveUser(null);
  }, []);

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

  const register = useCallback(
    (name: string, email: string, password: string, role: Role, inviteCode?: string) => {
      const result = storeRegister(name, email, password, role, inviteCode);
      if (result.ok) {
        if (_onRegisterCallback) {
          _onRegisterCallback(name || email.split("@")[0], email.trim().toLowerCase(), role);
        }
        const cleanEmail = email.trim().toLowerCase();
        const account = MOCK_USERS.find((u) => u.email.toLowerCase() === cleanEmail);
        if (account) {
          saveActiveUser({ id: account.id, name: account.name, email: account.email, role: account.role, token: `jwt_simulated_${Date.now()}` });
        }
      }
      return result;
    },
    [],
  );

  return (
    <AuthContext.Provider value={{ user, login, logout, sendPasswordReset, changePassword, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
