"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Avatar from "@/components/shared/Avatar";
import Badge from "@/components/shared/Badge";
import EmptyState from "@/components/shared/EmptyState";
import Modal from "@/components/shared/Modal";
import { useMembers } from "@/hooks/useMembers";
import { useTasks } from "@/hooks/useTasks";
import Skeleton from "@/components/shared/Skeleton";

export default function MembersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const { members, loading: loadingMembers, addMember } = useMembers();
  const { tasks, loading: loadingTasks } = useTasks();

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<"Admin" | "Lead" | "Member">("Member");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Map tasks to members to calculate active tasks count
  const membersWithTaskCount = useMemo(() => {
    return members.map((member) => {
      const activeTasksCount = tasks.filter(
        (t) => t.status !== "Done" && t.assignees.some((a) => a.name === member.name)
      ).length;
      return { ...member, activeTasksCount };
    });
  }, [members, tasks]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!newMemberName.trim()) {
      setError("Member name is required");
      return;
    }

    // Check if name already exists
    if (members.some((m) => m.name.toLowerCase() === newMemberName.trim().toLowerCase())) {
      setError("A member with this name already exists");
      return;
    }

    try {
      setSubmitting(true);
      await addMember(newMemberName.trim(), newMemberRole);
      setNewMemberName("");
      setNewMemberRole("Member");
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err.message || "Failed to add member");
    } finally {
      setSubmitting(false);
    }
  };

  const loading = loadingMembers || loadingTasks;

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

      <div className="max-w-[1200px] mx-auto px-4 mt-8 flex flex-col gap-6">
        {/* Header Section */}
        <div className="flex items-center justify-between border-b-4 border-black pb-4">
          <div>
            <h1 className="text-3xl font-black text-black uppercase tracking-wider">Members Directory</h1>
            <p className="text-sm text-zinc-700 mt-1 font-semibold">
              Manage club members and monitor their active workload.
            </p>
          </div>
          {user && (user.role === "Admin" || user.role === "Lead") && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="py-2 px-4 bg-teal-200 text-black hover:bg-teal-300 text-xs font-black border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
            >
              Add Member +
            </button>
          )}
        </div>

        {/* Members Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex flex-col items-center p-6 border-2 border-black rounded-2xl bg-white/50 gap-4"
              >
                <Skeleton className="w-16 h-16 rounded-full" />
                <Skeleton className="h-5 w-24 rounded animate-pulse" />
                <Skeleton className="h-4 w-16 rounded animate-pulse" />
                <Skeleton className="h-4 w-28 rounded mt-2 animate-pulse" />
              </div>
            ))}
          </div>
        ) : membersWithTaskCount.length === 0 ? (
          <EmptyState
            title="No members yet"
            message="Your club doesn't have any members listed."
            actionText={user && (user.role === "Admin" || user.role === "Lead") ? "Add First Member" : undefined}
            onAction={user && (user.role === "Admin" || user.role === "Lead") ? () => setIsModalOpen(true) : undefined}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {membersWithTaskCount.map((member) => (
              <div
                key={member._id}
                className="flex flex-col items-center text-center p-6 bg-white border-2 border-black rounded-2xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] gap-3"
              >
                <Avatar name={member.name} size="lg" className="border-2 border-black" />
                <div>
                  <h3 className="text-base font-bold text-black">{member.name}</h3>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase mt-0.5">Joined recently</p>
                </div>

                <Badge 
                  label={member.role} 
                  variant={member.role === "Lead" ? "inprogress" : member.role === "Admin" ? "critical" : "default"} 
                />

                <div className="w-full border-t border-dashed border-zinc-200 pt-3 mt-1 flex items-center justify-between text-xs font-semibold px-2 text-zinc-700">
                  <span>Active Tasks:</span>
                  <span className={`px-2 py-0.5 rounded-md font-bold text-black border border-black ${
                    member.activeTasksCount > 3 ? "bg-amber-100" : member.activeTasksCount > 0 ? "bg-teal-100" : "bg-zinc-100"
                  }`}>
                    {member.activeTasksCount} {member.activeTasksCount === 1 ? "task" : "tasks"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Club Member">
        <form onSubmit={handleAddMember} className="flex flex-col gap-4 text-black">
          {error && (
            <div className="bg-red-100 border-2 border-red-500 rounded-lg p-2.5 text-xs text-red-800 font-bold animate-pulse">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase tracking-wide">Member Name</label>
            <input
              type="text"
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              placeholder="e.g. Chinmay Babu"
              className="w-full p-2.5 bg-white border-2 border-black rounded-lg text-xs font-bold focus:outline-none"
              maxLength={40}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase tracking-wide">Club Role</label>
            <select
              value={newMemberRole}
              onChange={(e) => setNewMemberRole(e.target.value as any)}
              className="w-full p-2.5 bg-white border-2 border-black rounded-lg text-xs font-bold focus:outline-none"
            >
              <option value="Member">Member</option>
              <option value="Lead">Project Lead</option>
              <option value="Admin">Club Admin</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="py-2 px-4 bg-white text-black font-bold border-2 border-black rounded-xl shadow-[2.5px_2.5px_0px_0px_rgba(0,0,0,1)] hover:bg-zinc-100 transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] cursor-pointer text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="py-2 px-4 bg-teal-500 text-white font-bold border-2 border-black rounded-xl shadow-[2.5px_2.5px_0px_0px_rgba(0,0,0,1)] hover:bg-teal-600 transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] cursor-pointer text-xs"
            >
              {submitting ? "Adding..." : "Add Member"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
