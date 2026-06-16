"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import KanbanBoard from "@/components/board/KanbanBoard";
import TaskDetailPanel from "@/components/board/TaskDetailPanel";
import TaskForm from "@/components/task/TaskForm";
import Modal from "@/components/shared/Modal";
import { useTasks, Task } from "@/hooks/useTasks";
import { TaskCardSkeleton } from "@/components/shared/Skeleton";
import { DropResult } from "@hello-pangea/dnd";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const {
    tasks,
    loading,
    error,
    addTask,
    updateTaskStatus,
    deleteTask,
    refetch,
  } = useTasks();

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Selected task for Slide-over Panel
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Task Creation Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createInitialStatus, setCreateInitialStatus] = useState<"Todo" | "InProgress" | "Done">("Todo");

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("All");

  // Compute stats on the client
  const stats = useMemo(() => {
    const now = new Date();
    let total = tasks.length;
    let inProgress = 0;
    let overdue = 0;
    let completed = 0;

    tasks.forEach((t) => {
      const status = t.status || "Todo";
      if (status === "InProgress") {
        inProgress++;
      } else if (status === "Done") {
        completed++;
      }

      if (t.dueDate && status !== "Done") {
        const due = new Date(t.dueDate);
        if (due < now) {
          overdue++;
        }
      }
    });

    return { total, inProgress, overdue, completed };
  }, [tasks]);

  // Filter tasks based on search & priority selectors
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const titleMatch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
      const descMatch = (task.description || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSearch = titleMatch || descMatch;

      const matchesPriority =
        priorityFilter === "All" || task.priority.toLowerCase() === priorityFilter.toLowerCase();

      return matchesSearch && matchesPriority;
    });
  }, [tasks, searchQuery, priorityFilter]);

  // Drag and drop completion handler
  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    // Dropped in same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const previousStatus = source.droppableId as "Todo" | "InProgress" | "Done";
    const newStatus = destination.droppableId as "Todo" | "InProgress" | "Done";

    updateTaskStatus(draggableId, newStatus, previousStatus, user?.name || "A member");
  };

  // Click card to open slide-over
  const handleCardClick = (task: Task) => {
    setSelectedTaskId(task._id);
    setIsDetailOpen(true);
  };

  // Click "+" on a column to create a task in that status
  const handleAddTaskInColumn = (status: "Todo" | "InProgress" | "Done") => {
    setCreateInitialStatus(status);
    setIsCreateOpen(true);
  };

  // Submit from TaskForm modal
  const handleCreateTaskSubmit = async (taskData: Partial<Task>) => {
    await addTask({ ...taskData, actorName: user?.name || "A member" });
    setIsCreateOpen(false);
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
      <Navbar onNewTaskClick={() => handleAddTaskInColumn("Todo")} />

      {/* Main Container */}
      <div className="max-w-[1400px] mx-auto px-4 mt-6 flex flex-col gap-6">
        
        {/* Header Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
          {[
            { label: "Total Tasks", val: stats.total, color: "bg-teal-200", icon: "📋" },
            { label: "In Progress", val: stats.inProgress, color: "bg-indigo-200", icon: "🔄" },
            { label: "Overdue Tasks", val: stats.overdue, color: stats.overdue > 0 ? "bg-red-300 animate-pulse text-red-950" : "bg-zinc-100", icon: "⚠️" },
            { label: "Completed", val: stats.completed, color: "bg-emerald-200", icon: "✅" },
          ].map((stat, idx) => (
            <div
              key={idx}
              className={`flex items-center justify-between p-4 border-2 border-black rounded-2xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${stat.color} text-black font-black`}
            >
              <div className="flex flex-col">
                <span className="text-xs uppercase tracking-wider text-black/60 font-extrabold">{stat.label}</span>
                <span className="text-2xl mt-0.5">{stat.val}</span>
              </div>
              <span className="text-2xl">{stat.icon}</span>
            </div>
          ))}
        </div>

        {/* Search & Filters Section */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-4 bg-white border-2 border-black rounded-2xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          {/* Search Bar */}
          <div className="relative w-full md:max-w-md">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-zinc-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks by title or content..."
              className="w-full pl-9 pr-4 py-2 bg-zinc-50 border-2 border-black rounded-xl text-xs font-bold focus:outline-none"
            />
          </div>

          {/* Priority filter buttons */}
          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-end">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 mr-1">Priority:</span>
            {["All", "Low", "Medium", "High", "Critical"].map((prio) => (
              <button
                key={prio}
                onClick={() => setPriorityFilter(prio)}
                className={`py-1.5 px-3 border-2 border-black rounded-lg text-xs font-bold shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer ${
                  priorityFilter === prio
                    ? "bg-teal-200 text-black translate-x-[0.5px] translate-y-[0.5px] shadow-[0.5px_0.5px_0px_0px_rgba(0,0,0,1)]"
                    : "bg-white text-zinc-700 hover:bg-zinc-100"
                }`}
              >
                {prio}
              </button>
            ))}
          </div>
        </div>

        {/* Board Container */}
        {error ? (
          <div className="flex flex-col items-center justify-center p-12 border-2 border-black bg-white rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center">
            <span className="text-4xl mb-3">❌</span>
            <h3 className="text-lg font-bold text-red-600 mb-1">Failed to load board tasks</h3>
            <p className="text-xs text-zinc-500 max-w-sm mb-4">{error}</p>
            <button
              onClick={refetch}
              className="py-1.5 px-4 bg-black text-teal-200 border border-black rounded-xl font-bold text-xs"
            >
              Retry Connection
            </button>
          </div>
        ) : loading ? (
          <div className="flex flex-col lg:flex-row gap-6 p-2 w-full min-h-[500px]">
            {[1, 2, 3].map((col) => (
              <div
                key={col}
                className="flex-1 flex flex-col gap-4 p-4 border-4 border-black rounded-2xl bg-white/40 min-w-[280px]"
              >
                <div className="h-6 w-28 bg-gray-400/50 rounded-lg animate-pulse mb-4" />
                <TaskCardSkeleton />
                <TaskCardSkeleton />
              </div>
            ))}
          </div>
        ) : (
          <KanbanBoard
            tasks={filteredTasks}
            onCardClick={handleCardClick}
            onAddTaskClick={handleAddTaskInColumn}
            onDragEnd={handleDragEnd}
          />
        )}
      </div>

      {/* Task Creation Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title={`New Task - ${createInitialStatus === "Todo" ? "To Do" : createInitialStatus === "InProgress" ? "In Progress" : "Done"}`}
      >
        <TaskForm
          initialStatus={createInitialStatus}
          onSubmit={handleCreateTaskSubmit}
          onCancel={() => setIsCreateOpen(false)}
        />
      </Modal>

      {/* Slide-over Detail Panel */}
      <TaskDetailPanel
        taskId={selectedTaskId}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedTaskId(null);
        }}
        onTaskUpdated={refetch}
        onTaskDeleted={deleteTask}
      />
    </div>
  );
}