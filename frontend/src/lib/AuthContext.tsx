"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

interface User {
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = "ollama-emu-token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem(TOKEN_KEY);
    if (saved) {
      fetch(`/api/auth/verify?token=${encodeURIComponent(saved)}`)
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data?.valid) {
            setToken(saved);
            setUser({ email: data.email });
          } else {
            sessionStorage.removeItem(TOKEN_KEY);
          }
        })
        .catch(() => sessionStorage.removeItem(TOKEN_KEY));
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      sessionStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      setUser({ email: data.email });
      return true;
    } catch {
      return false;
    }
  }, []);

  const register = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      sessionStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      setUser({ email: data.email });
      return true;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    const t = token;
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    if (t) {
      fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: t }),
      }).catch(() => {});
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user, token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
