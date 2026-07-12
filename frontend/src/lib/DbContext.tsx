"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { API_BASE } from "./config";

interface SchemaInfo {
  synced: boolean;
  db_version: number;
  expected_version: number;
  reason: string;
  prisma_hash: string;
}

interface DbContextType {
  schema: SchemaInfo | null;
  databaseConnected: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
}

const DbContext = createContext<DbContextType | null>(null);

export function DbProvider({ children }: { children: ReactNode }) {
  const [schema, setSchema] = useState<SchemaInfo | null>(null);
  const [databaseConnected, setDatabaseConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/db/schema`);
      if (res.ok) {
        const data = await res.json();
        setSchema(data.schema);
        setDatabaseConnected(data.database?.connected ?? false);
      }
    } catch {
      setDatabaseConnected(false);
      setSchema(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, [refresh]);

  return (
    <DbContext.Provider value={{ schema, databaseConnected, loading, refresh }}>
      {children}
    </DbContext.Provider>
  );
}

export function useDb(): DbContextType {
  const ctx = useContext(DbContext);
  if (!ctx) throw new Error("useDb must be used within DbProvider");
  return ctx;
}
