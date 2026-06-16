"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { useMembers } from "@/hooks/useMembers";
import Avatar from "@/components/shared/Avatar";
import Badge from "@/components/shared/Badge";
import Skeleton from "@/components/shared/Skeleton";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { members, loading } = useMembers();
  
  const [currentWorkspace, setCurrentWorkspace] = useState("Android Club");
  const [workspaceName, setWorkspaceName] = useState("Android Club");
  const [workspaceDesc, setWorkspaceDesc] = useState("Developing modern Android apps and building open-source projects.");
  const [isSaving, setIsSaving] = useState(false);

  // Load settings on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const active = localStorage.getItem("devchart_current_workspace") || "Android Club";
      setCurrentWorkspace(active);
      setWorkspaceName(active);
      
      const descKey = `devchart_workspace_desc_${active}`;
      const savedDesc = localStorage.getItem(descKey) || (active === "Android Club" ? "Developing modern Android apps and building open-source projects." : "");
      setWorkspaceDesc(savedDesc);
    }
  }, []);

  // Listen to changes from Navbar or other places
  useEffect(() => {
    const handleSync = () => {
      const active = localStorage.getItem("devchart_current_workspace") || "Android Club";
      setCurrentWorkspace(active);
      setWorkspaceName(active);
      const descKey = `devchart_workspace_desc_${active}`;
      const savedDesc = localStorage.getItem(descKey) || (active === "Android Club" ? "Developing modern Android apps and building open-source projects." : "");
      setWorkspaceDesc(savedDesc);
    };

    window.addEventListener("workspaceChanged", handleSync);
    return () => {
      window.removeEventListener("workspaceChanged", handleSync);
    };
  }, []);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const handleSaveWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = workspaceName.trim();
    if (!trimmedName) {
      toast.error("Workspace name cannot be empty");
      return;
    }

    setIsSaving(true);
    try {
      const active = localStorage.getItem("devchart_current_workspace") || "Android Club";
      
      // Save description
      const descKey = `devchart_workspace_desc_${trimmedName}`;
      localStorage.setItem(descKey, workspaceDesc);

      // If name changed, rename it in workspaces list and in database tasks
      if (trimmedName !== active) {
        // 1. Get workspaces list
        const savedListStr = localStorage.getItem("devchart_workspaces_list");
        let list: string[] = ["Android Club"];
        if (savedListStr) {
          try {
            const parsed = JSON.parse(savedListStr);
            if (Array.isArray(parsed)) list = parsed;
          } catch (e) {}
        }

        // Avoid duplicate workspace names
        if (list.includes(trimmedName)) {
          toast.error("A club with this name already exists!");
          setIsSaving(false);
          return;
        }

        // Rename old name in list
        const updatedList = list.map(item => item === active ? trimmedName : item);
        localStorage.setItem("devchart_workspaces_list", JSON.stringify(updatedList));

        // 2. Update current workspace name
        localStorage.setItem("devchart_current_workspace", trimmedName);
        setCurrentWorkspace(trimmedName);

        // Remove old description key if it is different
        if (`devchart_workspace_desc_${active}` !== descKey) {
          localStorage.removeItem(`devchart_workspace_desc_${active}`);
        }

        // 3. Rename tasks in the database via the API
        const res = await fetch("/api/tasks/rename", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ oldWorkspace: active, newWorkspace: trimmedName }),
        });

        if (!res.ok) {
          throw new Error("Failed to rename workspace tasks in database");
        }

        const data = await res.json();
        toast.success(`Renamed club and updated ${data.modifiedCount || 0} tasks!`);
      } else {
        toast.success("Workspace settings updated!");
      }

      // Dispatch event to update navbar and other components
      window.dispatchEvent(new Event("workspaceChanged"));
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update workspace settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex justify-center items-center" style={{ backgroundColor: "#ffe4c4" }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12" style={{ backgroundColor: "#ffe4c4" }}>
      <Navbar />

      <div className="max-w-[800px] mx-auto px-4 mt-8 flex flex-col gap-6">
        <div className="border-b-4 border-black pb-4">
          <h1 className="text-3xl font-black text-black uppercase tracking-wider">Workspace Settings</h1>
          <p className="text-sm text-zinc-700 mt-1 font-semibold">
            Manage club profile information and workspace defaults.
          </p>
        </div>

        {/* Profile Edit Card */}
        <form onSubmit={handleSaveWorkspace} className="bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 flex flex-col gap-4">
          <h2 className="text-lg font-black text-black uppercase tracking-wide border-b-2 border-dashed border-zinc-200 pb-2">
            Club Profile
          </h2>

          {user && user.role !== "Admin" && (
            <div className="bg-red-50 border border-red-200 text-red-800 text-xs font-bold px-3 py-2 rounded-lg">
              ⚠️ You are currently logged in as a {user.role}. Only Club Admins can modify the workspace settings.
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase tracking-wide">Workspace Name</label>
            <input
              type="text"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              disabled={user?.role !== "Admin"}
              className="w-full p-2.5 bg-zinc-50 border-2 border-black rounded-lg text-xs font-bold focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase tracking-wide">Description</label>
            <textarea
              rows={3}
              value={workspaceDesc}
              onChange={(e) => setWorkspaceDesc(e.target.value)}
              disabled={user?.role !== "Admin"}
              className="w-full p-2.5 bg-zinc-50 border-2 border-black rounded-lg text-xs font-bold focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>

          {user?.role === "Admin" && (
            <div className="flex justify-end mt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="py-2 px-6 bg-teal-200 text-black hover:bg-teal-300 text-xs font-black border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
              >
                {isSaving ? "Saving..." : "Save Workspace Profile"}
              </button>
            </div>
          )}
        </form>

        {/* Member list section */}
        <div className="bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 flex flex-col gap-4">
          <h2 className="text-lg font-black text-black uppercase tracking-wide border-b-2 border-dashed border-zinc-200 pb-2">
            Member Management
          </h2>
          <p className="text-xs text-zinc-600 -mt-2">
            List of all members belonging to this workspace. To add new members, use the button on the Members Directory page.
          </p>

          <div className="flex flex-col gap-2.5 mt-2">
            {loading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 p-2 bg-zinc-50 rounded-lg">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <Skeleton className="h-4 w-32 rounded animate-pulse" />
                </div>
              ))
            ) : members.length === 0 ? (
              <p className="text-xs text-zinc-500 italic">No members in workspace.</p>
            ) : (
              members.map((member) => (
                <div
                  key={member._id}
                  className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-200 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={member.name} size="sm" />
                    <span className="text-xs font-bold text-black">{member.name}</span>
                  </div>
                  <Badge
                    label={member.role}
                    variant={member.role === "Lead" ? "inprogress" : member.role === "Admin" ? "critical" : "default"}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
