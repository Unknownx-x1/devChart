"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function SignupPage() {
  const { user, loading, signup } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"Admin" | "Lead" | "Member" | "">("Member");
  const [workspace, setWorkspace] = useState("Android Club");
  const [isCustomWorkspace, setIsCustomWorkspace] = useState(false);
  const [customWorkspace, setCustomWorkspace] = useState("");
  const [workspacesList, setWorkspacesList] = useState<string[]>(["Android Club"]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Load existing workspaces from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedListStr = localStorage.getItem("devchart_workspaces_list");
      if (savedListStr) {
        try {
          const parsed = JSON.parse(savedListStr);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setWorkspacesList(parsed);
            setWorkspace(parsed[0]);
          }
        } catch (e) {}
      }
    }
  }, []);

  // Redirect to dashboard if session exists
  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center" style={{ backgroundColor: "#ffe4c4" }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const finalWorkspace = (isCustomWorkspace ? customWorkspace : workspace).trim();

    if (!name.trim() || !email.trim() || !password.trim() || !role || !finalWorkspace) {
      setError("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    try {
      setSubmitting(true);
      await signup(name.trim(), email.trim(), password, role, finalWorkspace);
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 py-8" style={{ backgroundColor: "#ffe4c4" }}>
      {/* Container Card */}
      <div className="w-full max-w-md bg-white border-4 border-black rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-black text-teal-200 p-6 text-center border-b-4 border-black">
          <Link href="/" className="hover:opacity-85 transition-opacity">
            <h1 className="text-4xl font-black tracking-wider uppercase">devChart</h1>
          </Link>
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">
            Create Club Account
          </p>
        </div>

        {/* Body Form */}
        <div className="p-6 flex flex-col gap-4">
          <h2 className="text-lg font-black text-black uppercase tracking-wider text-center">
            Sign Up
          </h2>

          {error && (
            <div className="bg-red-100 border-2 border-red-500 rounded-lg p-2.5 text-xs text-red-800 font-bold animate-pulse">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-black">
            {/* Full Name */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-black uppercase tracking-wide">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Chinmay Babu"
                className="w-full p-2.5 bg-zinc-50 border-2 border-black rounded-lg text-xs font-bold focus:outline-none focus:bg-white"
                required
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-black uppercase tracking-wide">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="chinmay@club.org"
                className="w-full p-2.5 bg-zinc-50 border-2 border-black rounded-lg text-xs font-bold focus:outline-none focus:bg-white"
                required
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-black uppercase tracking-wide">Password (min 6 chars)</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-2.5 bg-zinc-50 border-2 border-black rounded-lg text-xs font-bold focus:outline-none focus:bg-white"
                required
              />
            </div>

            {/* Club Workspace Selection */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-black uppercase tracking-wide">Workspace Club / Project</label>
              <select
                value={isCustomWorkspace ? "CUSTOM" : workspace}
                onChange={(e) => {
                  if (e.target.value === "CUSTOM") {
                    setIsCustomWorkspace(true);
                  } else {
                    setIsCustomWorkspace(false);
                    setWorkspace(e.target.value);
                  }
                }}
                className="w-full p-2.5 bg-zinc-50 border-2 border-black rounded-lg text-xs font-bold focus:outline-none focus:bg-white"
                required
              >
                {workspacesList.map((ws) => (
                  <option key={ws} value={ws}>
                    {ws}
                  </option>
                ))}
                <option value="CUSTOM">+ Register a New Club...</option>
              </select>
            </div>

            {/* Custom Workspace input */}
            {isCustomWorkspace && (
              <div className="flex flex-col gap-1 animate-fadeIn">
                <label className="text-[10px] font-black uppercase text-teal-600 tracking-wide">New Club Name</label>
                <input
                  type="text"
                  value={customWorkspace}
                  onChange={(e) => setCustomWorkspace(e.target.value)}
                  placeholder="e.g. WebDev Club"
                  className="w-full p-2.5 bg-teal-50/25 border-2 border-teal-600 rounded-lg text-xs font-bold focus:outline-none focus:bg-white"
                  required
                />
              </div>
            )}

            {/* Club Role */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-black uppercase tracking-wide">Workspace Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full p-2.5 bg-zinc-50 border-2 border-black rounded-lg text-xs font-bold focus:outline-none focus:bg-white"
                required
              >
                <option value="Member">Member (Developer / Designer)</option>
                <option value="Lead">Project Lead</option>
                <option value="Admin">Club Admin</option>
              </select>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-teal-200 text-black font-black border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-teal-300 transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] cursor-pointer text-xs uppercase tracking-wider mt-2"
            >
              {submitting ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          {/* Redirect Link */}
          <div className="text-center mt-2 border-t border-dashed border-zinc-200 pt-4 text-xs font-bold text-zinc-600">
            <span>Already have an account? </span>
            <Link href="/login" className="text-teal-600 hover:underline">
              Sign In here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
