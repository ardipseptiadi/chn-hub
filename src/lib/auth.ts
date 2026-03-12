/**
 * Authentication Utilities
 *
 * Backend API ready structure - currently uses localStorage for demo purposes.
 * In production, replace localStorage calls with API requests.
 */

import { User } from "@/lib/store";

// Session duration: 7 days
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

// Storage keys
const AUTH_KEYS = {
  USER: "auth_user",
  TOKEN: "auth_token",
  SESSION_EXPIRES: "auth_session_expires",
} as const;

// Simple password hashing for demo (NOT secure for production)
// In production, use bcrypt on the backend
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "salt_demo_only");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Generate a simple JWT-like token for demo
// In production, use real JWT from backend
function generateToken(userId: string): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(JSON.stringify({
    userId,
    iat: Date.now(),
    exp: Date.now() + SESSION_DURATION_MS,
  }));
  const signature = btoa("demo_signature_only");
  return `${header}.${payload}.${signature}`;
}

// Decode token to get user ID
function decodeToken(token: string): { userId: string; exp: number } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return { userId: payload.userId, exp: payload.exp };
  } catch {
    return null;
  }
}

// Store session in localStorage
function setSession(user: User, token: string): void {
  const expiresAt = Date.now() + SESSION_DURATION_MS;
  localStorage.setItem(AUTH_KEYS.USER, JSON.stringify(user));
  localStorage.setItem(AUTH_KEYS.TOKEN, token);
  localStorage.setItem(AUTH_KEYS.SESSION_EXPIRES, expiresAt.toString());
  // Dispatch event for cross-tab sync
  window.dispatchEvent(new Event("auth-changed"));
}

// Clear session from localStorage
function clearSession(): void {
  localStorage.removeItem(AUTH_KEYS.USER);
  localStorage.removeItem(AUTH_KEYS.TOKEN);
  localStorage.removeItem(AUTH_KEYS.SESSION_EXPIRES);
  window.dispatchEvent(new Event("auth-changed"));
}

// Get current user from session
function getCurrentUser(): User | null {
  try {
    const userStr = localStorage.getItem(AUTH_KEYS.USER);
    if (!userStr) return null;
    return JSON.parse(userStr) as User;
  } catch {
    return null;
  }
}

// Get current token
function getCurrentToken(): string | null {
  return localStorage.getItem(AUTH_KEYS.TOKEN);
}

// Check if session is valid
function isSessionValid(): boolean {
  const expiresAt = localStorage.getItem(AUTH_KEYS.SESSION_EXPIRES);
  if (!expiresAt) return false;
  return Date.now() < parseInt(expiresAt, 10);
}

// Initialize session from storage on page load
function initializeSession(): { user: User | null; token: string | null } {
  if (!isSessionValid()) {
    clearSession();
    return { user: null, token: null };
  }
  return {
    user: getCurrentUser(),
    token: getCurrentToken(),
  };
}

// API-ready structure: replace with actual API calls in production
const authAPI = {
  // In production: POST /api/auth/register
  register: async (email: string, password: string, name: string): Promise<{ user: User; token: string }> => {
    // TODO: Replace with API call
    // return await fetch('/api/auth/register', { method: 'POST', body: JSON.stringify({ email, password, name }) })

    throw new Error("Registration should be handled through store.ts - use registerUser from there");
  },

  // In production: POST /api/auth/login
  login: async (email: string, password: string): Promise<{ user: User; token: string } | null> => {
    // TODO: Replace with API call
    // return await fetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })

    throw new Error("Login should be handled through store.ts - use loginUser from there");
  },

  // In production: POST /api/auth/logout
  logout: async (): Promise<void> => {
    // TODO: Replace with API call
    // await fetch('/api/auth/logout', { method: 'POST', headers: { Authorization: `Bearer ${token}` } })

    clearSession();
  },

  // In production: GET /api/auth/me
  getCurrentUser: async (): Promise<User | null> => {
    // TODO: Replace with API call
    // return await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })

    if (!isSessionValid()) return null;
    return getCurrentUser();
  },

  // In production: POST /api/auth/refresh
  refreshToken: async (): Promise<{ token: string } | null> => {
    // TODO: Replace with API call
    // return await fetch('/api/auth/refresh', { method: 'POST' })

    const user = getCurrentUser();
    const currentToken = getCurrentToken();
    if (!user || !currentToken) return null;

    // Generate new token for demo
    const newToken = generateToken(user.id);
    localStorage.setItem(AUTH_KEYS.TOKEN, newToken);
    localStorage.setItem(AUTH_KEYS.SESSION_EXPIRES, (Date.now() + SESSION_DURATION_MS).toString());
    return { token: newToken };
  },
};

export {
  hashPassword,
  generateToken,
  decodeToken,
  setSession,
  clearSession,
  getCurrentUser,
  getCurrentToken,
  isSessionValid,
  initializeSession,
  authAPI,
  SESSION_DURATION_MS,
};
