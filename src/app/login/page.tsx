"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [workspace, setWorkspace] = useState("Android Club");
  const [workspacesList, setWorkspacesList] = useState<string[]>(["Android Club"]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Load workspaces and check search params on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedListStr = localStorage.getItem("devchart_workspaces_list");
      let list = ["Android Club"];
      if (savedListStr) {
        try {
          const parsed = JSON.parse(savedListStr);
          if (Array.isArray(parsed) && parsed.length > 0) {
            list = parsed;
          }
        } catch (e) {}
      }
      setWorkspacesList(list);

      const params = new URLSearchParams(window.location.search);
      const ws = params.get("workspace");
      if (ws) {
        setWorkspace(ws);
        // Ensure the workspace from URL is added to local workspacesList
        if (!list.includes(ws)) {
          setWorkspacesList((prev) => [...prev, ws]);
        }
      } else {
        setWorkspace(list[0]);
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

    if (!email.trim() || !password.trim() || !workspace.trim()) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setSubmitting(true);
      await login(email.trim(), password, workspace.trim());
    } catch (err: any) {
      setError(err.message || "Failed to log in");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4" style={{ backgroundColor: "#ffe4c4" }}>
      {/* Container Card */}
      <div className="w-full max-w-md bg-white border-4 border-black rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-black text-teal-200 p-6 text-center border-b-4 border-black">
          <Link href="/" className="hover:opacity-85 transition-opacity">
            <h1 className="text-4xl font-black tracking-wider uppercase">devChart</h1>
          </Link>
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">
            Club Workspace Login
          </p>
        </div>

        {/* Body Form */}
        <div className="p-6 flex flex-col gap-4">
          <h2 className="text-lg font-black text-black uppercase tracking-wider text-center">
            Sign In
          </h2>

          {error && (
            <div className="bg-red-100 border-2 border-red-500 rounded-lg p-2.5 text-xs text-red-800 font-bold animate-pulse">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-black">
            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-black uppercase tracking-wide">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@club.org"
                className="w-full p-2.5 bg-zinc-50 border-2 border-black rounded-lg text-xs font-bold focus:outline-none focus:bg-white"
                required
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-black uppercase tracking-wide">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-2.5 bg-zinc-50 border-2 border-black rounded-lg text-xs font-bold focus:outline-none focus:bg-white"
                required
              />
            </div>

            {/* Workspace / Club selection */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-black uppercase tracking-wide">Log Into Club / Workspace</label>
              <select
                value={workspace}
                onChange={(e) => setWorkspace(e.target.value)}
                className="w-full p-2.5 bg-zinc-50 border-2 border-black rounded-lg text-xs font-bold focus:outline-none focus:bg-white"
                required
              >
                {workspacesList.map((ws) => (
                  <option key={ws} value={ws}>
                    {ws}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-teal-200 text-black font-black border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-teal-300 transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] cursor-pointer text-xs uppercase tracking-wider mt-2"
            >
              {submitting ? "Signing In..." : "Sign In"}
            </button>
          </form>

          {/* Redirect link */}
          <div className="text-center mt-2 border-t border-dashed border-zinc-200 pt-4 text-xs font-bold text-zinc-600">
            <span>Need an account? </span>
            <Link href="/signup" className="text-teal-600 hover:underline">
              Create one here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
