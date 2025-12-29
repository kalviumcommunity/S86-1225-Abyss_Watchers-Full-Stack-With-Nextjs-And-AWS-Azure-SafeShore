"use client";
import { createContext, useState, useContext, ReactNode, useEffect } from "react";

interface AuthContextType {
  user: string | null;
  role?: string | null;
  login: (username: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  const login = (username: string) => {
    setUser(username);
    console.log("User logged in:", username);
  };

  const logout = () => {
    setUser(null);
    console.log("User logged out");
  };

  useEffect(() => {
    async function fetchMe() {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        const json = await res.json();
        if (json?.success && json.data) {
          setUser(json.data.email || null);
          setRole(json.data.role || null);
        }
      } catch (e) {
        // ignore
      }
    }

    fetchMe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuthContext must be used within an AuthProvider");
  return context;
}
