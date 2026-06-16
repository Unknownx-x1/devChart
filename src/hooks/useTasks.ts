import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";

export type Task = {
  _id: string;
  title: string;
  description: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  status: "Todo" | "InProgress" | "Done";
  completed?: boolean;
  dueDate: string | null;
  assignees: Array<{ name: string; userId?: string; avatar?: string }>;
  labels?: string[];
  comments?: Array<{ _id: string; authorName: string; text: string; createdAt: string }>;
  activity?: Array<{ _id: string; action: string; actorName?: string; timestamp: string }>;
  order: number;
  createdAt?: string;
  updatedAt?: string;
};

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentWorkspace, setCurrentWorkspace] = useState<string>("Android Club");

  // Load active workspace and bind state synchronizers
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("devchart_current_workspace") || "Android Club";
      setCurrentWorkspace(saved);
      
      const handleStorageChange = () => {
        const active = localStorage.getItem("devchart_current_workspace") || "Android Club";
        setCurrentWorkspace(active);
      };

      window.addEventListener("storage", handleStorageChange);
      window.addEventListener("workspaceChanged", handleStorageChange);
      
      return () => {
        window.removeEventListener("storage", handleStorageChange);
        window.removeEventListener("workspaceChanged", handleStorageChange);
      };
    }
  }, []);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/tasks?sort=order&workspace=${encodeURIComponent(currentWorkspace)}`);
      if (!res.ok) {
        throw new Error("Failed to fetch tasks");
      }
      const data = await res.json();
      setTasks(data);
      setError(null);
    } catch (e: any) {
      setError(e.message);
      toast.error("Error loading tasks");
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = async (taskData: Partial<Task> & { actorName?: string }) => {
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...taskData, workspace: currentWorkspace }),
      });

      if (!res.ok) {
        throw new Error("Failed to create task");
      }

      const newTask = await res.json();
      setTasks((prev) => [newTask, ...prev]);
      toast.success("Task created successfully!");
      return newTask;
    } catch (error) {
      toast.error("Failed to create task");
      throw error;
    }
  };

  const updateTaskStatus = async (
    taskId: string,
    newStatus: "Todo" | "InProgress" | "Done",
    previousStatus: "Todo" | "InProgress" | "Done",
    actorName: string = "A member"
  ) => {
    // Optimistic Update
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      const res = await fetch(`/api/tasks/${taskId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, actorName }),
      });

      if (!res.ok) {
        throw new Error("Failed to update status");
      }
      
      const updatedTask = await res.json();
      
      // Update local state with exact data (adds activity list, etc.)
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? updatedTask : t))
      );
      toast.success(`Task moved to ${newStatus}`);
    } catch (err) {
      // Revert optimistic update on failure
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, status: previousStatus } : t))
      );
      toast.error("Failed to update status. Reverting...");
    }
  };

  const deleteTask = async (taskId: string) => {
    const previousTasks = [...tasks];
    setTasks((prev) => prev.filter((t) => t._id !== taskId));
    
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete task");
      }
      toast.success("Task deleted successfully");
    } catch (error) {
      setTasks(previousTasks);
      toast.error("Failed to delete task");
    }
  };

  return {
    tasks,
    setTasks,
    loading,
    error,
    refetch: fetchTasks,
    addTask,
    updateTaskStatus,
    deleteTask,
  };
}
