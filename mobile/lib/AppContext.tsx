import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import * as api from "./api";

interface AppContextType {
  baseUrl: string;
  connected: boolean;
  user: string | null;
  ready: boolean;
  testConnection: (u: string) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AppCtx = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [baseUrl, setBaseUrl] = useState("");
  const [connected, setConnected] = useState(false);
  const [user, setUser] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const u = await api.getBase();
      setBaseUrl(u);
      const t = await api.getToken();
      if (t) {
        const v = await api.verifyToken(t);
        if (v?.valid) setUser(v.email ?? "user");
      }
      if (u) {
        try {
          await api.getStatus();
          setConnected(true);
        } catch {
          setConnected(false);
        }
      }
      setReady(true);
    })();
  }, []);

  const testConnection = useCallback(async (u: string) => {
    await api.setBase(u);
    setBaseUrl(u);
    try {
      await api.getStatus();
      setConnected(true);
      return true;
    } catch {
      setConnected(false);
      return false;
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const d = await api.login(email, password);
      if (d?.email) {
        setUser(d.email);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    try {
      const d = await api.register(email, password);
      if (d?.email) {
        setUser(d.email);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    await api.logout();
    setUser(null);
  }, []);

  return (
    <AppCtx.Provider
      value={{ baseUrl, connected, user, ready, testConnection, login, register, logout }}
    >
      {children}
    </AppCtx.Provider>
  );
}

export function useApp(): AppContextType {
  const c = useContext(AppCtx);
  if (!c) throw new Error("useApp must be used within AppProvider");
  return c;
}
