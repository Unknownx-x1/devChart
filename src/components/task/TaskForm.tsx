"use client";

import React, { useState } from "react";
import Avatar from "@/components/shared/Avatar";
import { useMembers } from "@/hooks/useMembers";
import { Task } from "@/hooks/useTasks";

interface TaskFormProps {
  initialStatus?: "Todo" | "InProgress" | "Done";
  onSubmit: (taskData: Partial<Task>) => Promise<void>;
  onCancel: () => void;
}

export default function TaskForm({
  initialStatus = "Todo",
  onSubmit,
  onCancel,
}: TaskFormProps) {
  const { members } = useMembers();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"Todo" | "InProgress" | "Done">(initialStatus);
  const [priority, setPriority] = useState<"Low" | "Medium" | "High" | "Critical">("Medium");
  const [dueDate, setDueDate] = useState("");
  const [selectedAssignees, setSelectedAssignees] = useState<Array<{ name: string; avatar: string; userId: string }>>([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const toggleAssignee = (member: { _id: string; name: string; avatar: string }) => {
    setSelectedAssignees((prev) => {
      const isAssigned = prev.some((a) => a.name === member.name);
      if (isAssigned) {
        return prev.filter((a) => a.name !== member.name);
      } else {
        return [...prev, { name: member.name, avatar: member.avatar, userId: member._id }];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Task title is required");
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        assignees: selectedAssignees,
      });
    } catch (err: any) {
      setError(err.message || "Failed to create task");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-black">
      {error && (
        <div className="bg-red-100 border-2 border-red-500 rounded-lg p-2.5 text-xs text-red-800 font-bold animate-pulse">
          {error}
        </div>
      )}

      {/* Title */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold uppercase tracking-wide">Task Title *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Implement user login"
          className="w-full p-2.5 bg-white border-2 border-black rounded-lg text-xs font-bold focus:outline-none"
        />
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold uppercase tracking-wide">Description</label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what needs to be done..."
          className="w-full p-2.5 bg-white border-2 border-black rounded-lg text-xs font-bold focus:outline-none"
        />
      </div>

      {/* Status & Priority Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold uppercase tracking-wide">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="w-full p-2.5 bg-white border-2 border-black rounded-lg text-xs font-bold focus:outline-none"
          >
            <option value="Todo">To Do</option>
            <option value="InProgress">In Progress</option>
            <option value="Done">Done</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold uppercase tracking-wide">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as any)}
            className="w-full p-2.5 bg-white border-2 border-black rounded-lg text-xs font-bold focus:outline-none"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Due Date */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold uppercase tracking-wide">Due Date</label>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full p-2.5 bg-white border-2 border-black rounded-lg text-xs font-bold focus:outline-none"
        />
      </div>

      {/* Assignee selection */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold uppercase tracking-wide">Assign Members</label>
        <div className="flex flex-wrap gap-2 p-2 bg-white/50 border-2 border-black rounded-xl max-h-[120px] overflow-y-auto">
          {members.length === 0 ? (
            <p className="text-[10px] text-zinc-500 italic">No club members created yet.</p>
          ) : (
            members.map((member) => {
              const isAssigned = selectedAssignees.some((a) => a.name === member.name);
              return (
                <button
                  type="button"
                  key={member._id}
                  onClick={() => toggleAssignee(member)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border-2 text-[10px] font-bold transition-all cursor-pointer ${
                    isAssigned
                      ? "bg-teal-200 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black"
                      : "bg-white border-zinc-300 opacity-60 hover:opacity-100 hover:border-black text-zinc-700"
                  }`}
                >
                  <Avatar name={member.name} size="sm" className="w-4 h-4 border-none" />
                  <span>{member.name}</span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 mt-2">
        <button
          type="button"
          onClick={onCancel}
          className="py-2 px-4 bg-white text-black font-bold border-2 border-black rounded-xl shadow-[2.5px_2.5px_0px_0px_rgba(0,0,0,1)] hover:bg-zinc-100 transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] cursor-pointer text-xs"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="py-2 px-4 bg-teal-500 text-white font-bold border-2 border-black rounded-xl shadow-[2.5px_2.5px_0px_0px_rgba(0,0,0,1)] hover:bg-teal-600 transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] cursor-pointer text-xs"
        >
          {submitting ? "Creating..." : "Create Task"}
        </button>
      </div>
    </form>
  );
}
