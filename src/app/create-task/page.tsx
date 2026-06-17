"use client";

import Navbar from '@/components/Navbar';
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const CreateTask = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if visitor or not logged in
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (user.role === "Visitor") {
        toast.error("Visitors are not allowed to create tasks.");
        router.push("/dashboard");
      }
    }
  }, [user, loading, router]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a task name.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title,
          description,
          priority,
          workspace: user?.workspace || "Android Club",
          actorName: user?.name || "A member"
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create task.");
      }

      setTitle("");
      setDescription("");
      setPriority("Medium");

      toast.success("Task created successfully!");
    } catch (error: any) {
      console.error("Error creating task:", error);
      toast.error(error.message || "Failed to create task.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Prevent flash of page before redirection
  if (loading || !user || user.role === "Visitor") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-teal-200 font-bold text-xl animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div>
        <Navbar />
        <h1 className="text-6xl font-bold m-3 p-3 text-teal-200 text-outline-black">Want to create a new task?</h1>

        <form onSubmit={handleSubmit} className="flex justify-center flex-col gap-4 m-4 p-3">

            <h3 className="text-2xl">Whats the task name?</h3>
            <input 
              type="text" 
              placeholder="Task name" 
              value={title}  
              onChange={(event)=>{setTitle(event.target.value)}} 
              className="w-full p-3 bg-white text-black rounded-xl focus:outline-none focus:ring-2 focus:ring-white appearance-none" 
            />

            <h3 className="text-2xl">Describe it!!</h3>
            <textarea  
              placeholder="Task description" 
              value={description} 
              onChange={(event)=>{setDescription(event.target.value)}} 
              className="w-full p-3 bg-white text-black rounded-xl  focus:outline-none focus:ring-2 focus:ring-white appearance-none"
            ></textarea>

            <h3 className="text-2xl">How important is it?</h3>
            <select
                value={priority}
                onChange={(event)=>{setPriority(event.target.value)}}
                className="w-full p-3 bg-white text-black rounded-xl  focus:outline-none focus:ring-2 focus:ring-white appearance-none"
            >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
            </select>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full p-3 bg-teal-500 text-white font-bold rounded-xl hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-white appearance-none disabled:opacity-50" 
            >
              {isSubmitting ? "Creating..." : "Create Task"}
            </button>

        </form>
    </div>
  );
}

export default CreateTask;