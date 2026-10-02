"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { UserProfile, RoleType } from "@/types/api";
import { api } from "@/lib/api";
import { getAuthToken, setAuthToken } from "@/lib/api/client";

interface DemoPersona {
  role: RoleType;
  title: string;
  email: string;
  name: string;
  department: string;
  thresholdLimit: string;
}

export const DEMO_PERSONAS: Record<string, DemoPersona> = {
  procurement_officer: {
    role: "procurement_officer",
    title: "Procurement Officer",
    email: "procurement@demo.local",
    name: "John Vance",
    department: "Procurement & Sourcing",
    thresholdLimit: "Up to €25,000",
  },
  operations_manager: {
    role: "operations_manager",
    title: "Operations Manager",
    email: "manager@demo.local",
    name: "Marcus Sterling",
    department: "Executive Operations",
    thresholdLimit: "Unrestricted (> €25k)",
  },
  production_planner: {
    role: "production_planner",
    title: "Production Planner",
    email: "planner@demo.local",
    name: "Elena Rostova",
    department: "Manufacturing & Scheduling",
    thresholdLimit: "Batch Scheduling & MPS",
  },
  admin: {
    role: "admin",
    title: "System Admin",
    email: "admin@demo.local",
    name: "Dr. Sarah Chen",
    department: "Platform Administration",
    thresholdLimit: "Full Administrative Access",
  },
};

interface AuthContextType {
  user: UserProfile | null;
  currentRole: RoleType;
  isLoading: boolean;
  loginAs: (roleKey: keyof typeof DEMO_PERSONAS) => Promise<void>;
  loginWithCredentials: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  canApprove: (requiredRole: string, monetaryValue?: number) => {
    authorized: boolean;
    reason?: string;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const initAuth = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (token) {
        try {
          const profile = await api.auth.getMe();
          setUser(profile);
          setIsLoading(false);
          return;
        } catch {
          // Token expired or invalid, auto login as default demo
        }
      }
      // Demo fallback login as Procurement Officer
      const res = await api.auth.login("procurement@demo.local", "demo123");
      setAuthToken(res.access_token);
      setUser({
        id: res.user_id,
        email: res.email,
        full_name: res.full_name,
        department: res.department,
        roles: res.roles,
      });
    } catch (err) {
      console.error("Auth init error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const loginAs = async (roleKey: keyof typeof DEMO_PERSONAS) => {
    setIsLoading(true);
    const persona = DEMO_PERSONAS[roleKey];
    if (!persona) return;
    try {
      const res = await api.auth.login(persona.email, "demo123");
      setAuthToken(res.access_token);
      setUser({
        id: res.user_id,
        email: res.email,
        full_name: res.full_name,
        department: res.department,
        roles: res.roles,
      });
    } catch (err) {
      console.error("Failed to switch demo persona:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithCredentials = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await api.auth.login(email, pass);
      setAuthToken(res.access_token);
      setUser({
        id: res.user_id,
        email: res.email,
        full_name: res.full_name,
        department: res.department,
        roles: res.roles,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
  };

  const currentRole = user?.roles?.[0] || "procurement_officer";

  const canApprove = (requiredRole: string, monetaryValue?: number): {
    authorized: boolean;
    reason?: string;
  } => {
    if (!user) return { authorized: false, reason: "Not authenticated" };
    const roles = user.roles || [];

    // Admin has full authorization
    if (roles.includes("admin")) return { authorized: true };

    // Operations manager has full authorization for purchase requisitions and ops
    if (roles.includes("operations_manager")) return { authorized: true };

    // Procurement officer can approve if required_role is procurement_officer
    if (requiredRole === "procurement_officer") {
      if (roles.includes("procurement_officer")) {
        if (monetaryValue && monetaryValue > 25000) {
          return {
            authorized: false,
            reason: "Authorization Restricted: This action exceeds €25,000 threshold. Requires Operations Manager.",
          };
        }
        return { authorized: true };
      }
      return {
        authorized: false,
        reason: "Requires Procurement Officer role.",
      };
    }

    // Production planner can approve production_planner
    if (requiredRole === "production_planner") {
      if (roles.includes("production_planner")) return { authorized: true };
      return {
        authorized: false,
        reason: "Requires Production Planner role.",
      };
    }

    return {
      authorized: false,
      reason: `Requires '${requiredRole}' authorization.`,
    };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        currentRole,
        isLoading,
        loginAs,
        loginWithCredentials,
        logout,
        canApprove,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
