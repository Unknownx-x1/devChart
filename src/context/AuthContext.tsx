"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export interface UserSession {
  userId: string;
  name: string;
  email: string;
  role: "Admin" | "Lead" | "Member";
  avatar: string;
  workspace: string;
}

interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  login: (email: string, password: string, workspace: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role: string, workspace: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Fetch current user failed:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string, workspace: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, workspace }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to log in");
      }

      setUser(data.user);
      
      // Update local storage current workspace
      localStorage.setItem("devchart_current_workspace", data.user.workspace);
      window.dispatchEvent(new Event("workspaceChanged"));

      toast.success(`Welcome back, ${data.user.name}!`);
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to log in. Please check your credentials.");
      throw error;
    }
  };

  const signup = async (name: string, email: string, password: string, role: string, workspace: string) => {
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role, workspace }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to sign up");
      }

      setUser(data.user);

      // Add workspace to the local list if not already there
      const savedListStr = localStorage.getItem("devchart_workspaces_list");
      let list = ["Android Club"];
      if (savedListStr) {
        try {
          const parsed = JSON.parse(savedListStr);
          if (Array.isArray(parsed)) list = parsed;
        } catch (e) {}
      }
      if (!list.includes(data.user.workspace)) {
        list.push(data.user.workspace);
        localStorage.setItem("devchart_workspaces_list", JSON.stringify(list));
      }
      localStorage.setItem("devchart_current_workspace", data.user.workspace);
      window.dispatchEvent(new Event("workspaceChanged"));

      toast.success(`Account created successfully! Welcome, ${data.user.name}.`);
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to sign up. Please try again.");
      throw error;
    }
  };

  const logout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        setUser(null);
        toast.success("Logged out successfully");
        router.push("/login");
      } else {
        throw new Error("Logout request failed");
      }
    } catch (error) {
      toast.error("Failed to log out. Please try again.");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
