import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { Task } from "./useTasks";

export function useTaskDetail(taskId: string | null) {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [savingState, setSavingState] = useState<"idle" | "saving" | "saved">("idle");

  const fetchTask = useCallback(async () => {
    if (!taskId) {
      setTask(null);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/tasks/${taskId}`);
      if (!res.ok) throw new Error("Failed to fetch task details");
      const data = await res.json();
      setTask(data);
    } catch (error) {
      toast.error("Failed to load task details");
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchTask();
  }, [fetchTask]);

  const updateTask = async (updates: Partial<Task>) => {
    if (!taskId) return;
    setSavingState("saving");

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!res.ok) throw new Error("Failed to save changes");
      
      const updated = await res.json();
      setTask(updated);
      setSavingState("saved");
      setTimeout(() => setSavingState("idle"), 2000);
      return updated;
    } catch (error) {
      setSavingState("idle");
      toast.error("Failed to save changes");
      throw error;
    }
  };

  const addComment = async (authorName: string, text: string) => {
    if (!taskId) return;
    try {
      const res = await fetch(`/api/tasks/${taskId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorName, text }),
      });

      if (!res.ok) throw new Error("Failed to add comment");

      const updated = await res.json();
      setTask(updated);
      toast.success("Comment posted!");
      return updated;
    } catch (error) {
      toast.error("Failed to post comment");
      throw error;
    }
  };

  return {
    task,
    loading,
    savingState,
    updateTask,
    addComment,
    refetch: fetchTask,
  };
}
