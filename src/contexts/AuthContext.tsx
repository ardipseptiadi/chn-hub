/**
 * Authentication Context Provider
 *
 * Provides authentication state and methods throughout the app.
 * Backend API ready - swap localStorage calls with API requests in production.
 */

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/lib/store";
import {
  initializeSession,
  clearSession as clearAuthSession,
  isSessionValid,
  authAPI,
} from "@/lib/auth";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider component that will wrap the app
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize session on mount
  useEffect(() => {
    const initAuth = async () => {
      const session = initializeSession();
      setUser(session.user);
      setToken(session.token);
      setIsLoading(false);
    };

    initAuth();

    // Listen for auth changes from other tabs
    const handleAuthChange = () => {
      const session = initializeSession();
      setUser(session.user);
      setToken(session.token);
    };

    window.addEventListener("auth-changed", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      window.removeEventListener("auth-changed", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  // Check session validity periodically
  useEffect(() => {
    if (!user || !token) return;

    const checkSession = () => {
      if (!isSessionValid()) {
        logout();
      }
    };

    const interval = setInterval(checkSession, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [user, token]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Import loginUser from store (avoiding circular dependency)
      const { loginUser } = await import("@/lib/store");
      const result = await loginUser(email, password);

      if (result) {
        setUser(result.user);
        setToken(result.token);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      // Import registerUser from store (avoiding circular dependency)
      const { registerUser } = await import("@/lib/store");
      const result = await registerUser(email, password, name);

      if (result) {
        setUser(result.user);
        setToken(result.token);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Registration error:", error);
      return false;
    }
  };

  const logout = () => {
    clearAuthSession();
    setUser(null);
    setToken(null);
  };

  const refreshUser = async () => {
    if (!token) return;

    try {
      // In production, this would call the API
      // const freshUser = await authAPI.getCurrentUser();
      // For now, just verify session is still valid
      if (isSessionValid()) {
        const session = initializeSession();
        setUser(session.user);
      } else {
        logout();
      }
    } catch (error) {
      console.error("Refresh user error:", error);
      logout();
    }
  };

  const value: AuthContextValue = {
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
