"use client";

import React, { useState, useEffect, useRef } from "react";
import Avatar from "@/components/shared/Avatar";
import CommentThread from "@/components/task/CommentThread";
import { useTaskDetail } from "@/hooks/useTaskDetail";
import { useMembers } from "@/hooks/useMembers";
import { Task } from "@/hooks/useTasks";
import { useAuth } from "@/context/AuthContext";

interface TaskDetailPanelProps {
  taskId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdated: () => void;
  onTaskDeleted?: (id: string) => void;
}

export default function TaskDetailPanel({
  taskId,
  isOpen,
  onClose,
  onTaskUpdated,
  onTaskDeleted,
}: TaskDetailPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const { task, loading, savingState, updateTask, addComment } = useTaskDetail(taskId);
  const { members } = useMembers();
  const { user } = useAuth();

  // Local state for editable text fields to prevent lagging
  const [localTitle, setLocalTitle] = useState("");
  const [localDesc, setLocalDesc] = useState("");
  const [showActivity, setShowActivity] = useState(false);

  // Sync local state when task changes
  useEffect(() => {
    if (task) {
      setLocalTitle(task.title);
      setLocalDesc(task.description || "");
    }
  }, [task]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent scroll on body when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBlurTitle = async () => {
    if (user?.role === "Visitor") return;
    if (task && localTitle.trim() && localTitle !== task.title) {
      await updateTask({ title: localTitle.trim() });
      onTaskUpdated();
    }
  };

  const handleBlurDesc = async () => {
    if (user?.role === "Visitor") return;
    if (task && localDesc !== task.description) {
      await updateTask({ description: localDesc });
      onTaskUpdated();
    }
  };

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (user?.role === "Visitor") return;
    const newStatus = e.target.value as "Todo" | "InProgress" | "Done";
    if (task && newStatus !== task.status) {
      await updateTask({ status: newStatus, actorName: user?.name || "A member" } as any);
      onTaskUpdated();
    }
  };

  const handlePriorityChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (user?.role === "Visitor") return;
    const newPriority = e.target.value as "Low" | "Medium" | "High" | "Critical";
    if (task && newPriority !== task.priority) {
      await updateTask({ priority: newPriority });
      onTaskUpdated();
    }
  };

  const handleDueDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (user?.role === "Visitor") return;
    const newDate = e.target.value || null;
    if (task && newDate !== task.dueDate) {
      await updateTask({ dueDate: newDate });
      onTaskUpdated();
    }
  };

  const toggleAssignee = async (member: { _id: string; name: string; avatar: string }) => {
    if (!task || user?.role === "Visitor") return;
    
    const isAssigned = task.assignees.some((a) => a.name === member.name);
    let updatedAssignees = [];

    if (isAssigned) {
      updatedAssignees = task.assignees.filter((a) => a.name !== member.name);
    } else {
      updatedAssignees = [
        ...task.assignees,
        { name: member.name, avatar: member.avatar, userId: member._id },
      ];
    }

    await updateTask({ assignees: updatedAssignees });
    onTaskUpdated();
  };

  const handleDelete = async () => {
    if (task && onTaskDeleted && window.confirm("Are you sure you want to delete this task?")) {
      onTaskDeleted(task._id);
      onClose();
    }
  };

  const handleCommentSubmit = async (text: string) => {
    if (user?.role === "Visitor") return;
    await addComment(user?.name || "A member", text);
    onTaskUpdated();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div onClick={onClose} className="absolute inset-0 bg-black/55 backdrop-blur-xs" />

      {/* Slide-over panel */}
      <div
        ref={panelRef}
        className="relative z-10 flex flex-col w-full max-w-lg h-full bg-bisque border-l-4 border-black shadow-[-6px_0px_0px_0px_rgba(0,0,0,1)] overflow-y-auto"
        style={{ backgroundColor: "#ffe4c4" }}
      >
        {/* Panel Header */}
        <div className="flex items-center justify-between p-4 bg-black text-teal-200 border-b-2 border-black sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-black uppercase tracking-wider">Task Details</h2>
            {savingState === "saving" && (
              <span className="text-[10px] bg-amber-400 text-black px-1.5 py-0.5 rounded font-black uppercase animate-pulse">
                Saving...
              </span>
            )}
            {savingState === "saved" && (
              <span className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.5 rounded font-black uppercase">
                Saved!
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {onTaskDeleted && user && user.role === "Admin" && (
              <button
                onClick={handleDelete}
                className="p-1 text-red-400 hover:text-red-500 rounded hover:bg-zinc-900 transition-colors cursor-pointer"
                title="Delete task"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-teal-200 transition-colors focus:outline-none cursor-pointer"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {loading && !task ? (
          <div className="flex flex-col gap-4 p-6 flex-1 justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            <p className="text-xs text-zinc-700 font-bold">Loading details...</p>
          </div>
        ) : task ? (
          <div className="flex-1 p-6 flex flex-col gap-5">
            {/* Title field */}
            <div>
              <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider block mb-1">
                Task Title (click to edit)
              </label>
              <input
                type="text"
                value={localTitle}
                onChange={(e) => setLocalTitle(e.target.value)}
                onBlur={handleBlurTitle}
                disabled={user?.role === "Visitor"}
                className="w-full text-base font-bold bg-transparent border-b-2 border-transparent hover:border-zinc-400 focus:border-black focus:outline-none py-1 transition-colors disabled:opacity-85 disabled:cursor-not-allowed text-black"
                placeholder="Enter task title"
              />
            </div>

            {/* Quick selectors grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Status */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">Status</label>
                <select
                  value={task.status || "Todo"}
                  onChange={handleStatusChange}
                  disabled={user?.role === "Visitor"}
                  className="bg-white border-2 border-black rounded-lg p-2 text-xs font-bold focus:outline-none disabled:opacity-85 disabled:cursor-not-allowed text-black"
                >
                  <option value="Todo">To Do</option>
                  <option value="InProgress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              </div>

              {/* Priority */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">Priority</label>
                <select
                  value={task.priority}
                  onChange={handlePriorityChange}
                  disabled={user?.role === "Visitor"}
                  className="bg-white border-2 border-black rounded-lg p-2 text-xs font-bold focus:outline-none disabled:opacity-85 disabled:cursor-not-allowed text-black"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

            {/* Due date picker */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">Due Date</label>
              <input
                type="date"
                value={task.dueDate ? task.dueDate.substring(0, 10) : ""}
                onChange={handleDueDateChange}
                disabled={user?.role === "Visitor"}
                className="bg-white border-2 border-black rounded-lg p-2 text-xs font-bold focus:outline-none w-full disabled:opacity-85 disabled:cursor-not-allowed text-black"
              />
            </div>

            {/* Assignees selection */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider block">
                Assign Members (click to toggle)
              </label>
              <div className="flex flex-wrap gap-2 p-3 bg-white/50 border-2 border-black rounded-xl max-h-[120px] overflow-y-auto">
                {members.length === 0 ? (
                  <p className="text-[10px] text-zinc-500 italic">No club members created yet.</p>
                ) : (
                  members.map((member) => {
                    const isAssigned = task.assignees.some((a) => a.name === member.name);
                    return (
                      <button
                        key={member._id}
                        onClick={() => toggleAssignee(member)}
                        disabled={user?.role === "Visitor"}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border-2 text-xs font-bold transition-all disabled:opacity-85 disabled:cursor-not-allowed ${
                          isAssigned
                            ? "bg-teal-200 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black"
                            : "bg-white border-zinc-300 opacity-60 hover:opacity-100 hover:border-black text-zinc-700"
                        }`}
                        title={member.name}
                      >
                        <Avatar name={member.name} size="sm" className="w-5 h-5 border-none" />
                        <span>{member.name}</span>
                        {isAssigned && (
                          <svg className="w-3.5 h-3.5 text-black ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">Description</label>
              <textarea
                rows={3}
                value={localDesc}
                onChange={(e) => setLocalDesc(e.target.value)}
                onBlur={handleBlurDesc}
                disabled={user?.role === "Visitor"}
                placeholder="Detail what needs to be done for this task..."
                className="w-full bg-white border-2 border-black rounded-lg p-3 text-xs focus:outline-none disabled:opacity-85 disabled:cursor-not-allowed text-black"
              />
            </div>

            <hr className="border-zinc-300" />

            {/* Comments Thread */}
            <CommentThread
              comments={task.comments || []}
              onAddComment={handleCommentSubmit}
            />

            <hr className="border-zinc-300" />

            {/* Activity log timeline */}
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setShowActivity(!showActivity)}
                className="flex items-center justify-between text-xs font-bold text-black uppercase tracking-wider py-1.5 focus:outline-none cursor-pointer"
              >
                <span>Activity History ({task.activity?.length || 0})</span>
                <span>{showActivity ? "▼ Hide" : "▲ Show"}</span>
              </button>

              {showActivity && (
                <div className="flex flex-col gap-2 max-h-[150px] overflow-y-auto pl-1">
                  {(!task.activity || task.activity.length === 0) ? (
                    <p className="text-[10px] text-zinc-500 italic">No activity logged.</p>
                  ) : (
                    task.activity
                      .slice()
                      .reverse()
                      .map((log) => (
                        <div key={log._id} className="flex gap-2 text-[10px]">
                          <span className="text-zinc-400 font-bold shrink-0">{formatDate(log.timestamp)}</span>
                          <span className="text-black font-black">{log.actorName}:</span>
                          <span className="text-zinc-600">{log.action}</span>
                        </div>
                      ))
                  )}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
