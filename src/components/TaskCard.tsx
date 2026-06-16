import React from "react";
import Badge from "@/components/shared/Badge";
import Avatar from "@/components/shared/Avatar";
import { Task } from "@/hooks/useTasks";

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  dragHandleProps?: any;
}

export default function TaskCard({ task, onClick, dragHandleProps }: TaskCardProps) {
  const isOverdue = task.dueDate ? new Date(task.dueDate) < new Date() && task.status !== "Done" : false;

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const priorityVariant = task.priority.toLowerCase() as "low" | "medium" | "high" | "critical";

  return (
    <div
      onClick={onClick}
      className="group relative flex flex-col h-auto w-full self-start rounded-xl border-2 border-black bg-white overflow-hidden shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all cursor-pointer select-none"
    >
      {/* Drag handle & Header */}
      <div className="flex items-center justify-between bg-black px-3 py-2 text-teal-200 border-b-2 border-black">
        <h3 className="text-sm font-bold truncate max-w-[80%]">{task.title}</h3>
        {/* Subtle drag handle on hover */}
        <div
          {...dragHandleProps}
          className="p-1 hover:bg-zinc-800 rounded cursor-grab active:cursor-grabbing text-zinc-400 group-hover:text-teal-200 transition-colors"
          title="Drag to reorder/move"
          onClick={(e) => e.stopPropagation()} // don't open modal when clicking drag handle
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 8h16M4 16h16" />
          </svg>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-3 flex flex-col gap-3">
        <p className="text-xs text-zinc-600 line-clamp-2 min-h-[2rem]">
          {task.description || "No description provided."}
        </p>

        {/* Labels if any */}
        {task.labels && task.labels.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.labels.map((lbl, idx) => (
              <span key={idx} className="bg-teal-50 text-teal-900 border border-teal-200 rounded px-1.5 py-0.5 text-[10px] font-semibold">
                {lbl}
              </span>
            ))}
          </div>
        )}

        {/* Footer info: priority, date, comments, assignee */}
        <div className="flex items-center justify-between pt-2 border-t border-dashed border-zinc-200">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge label={task.priority} variant={priorityVariant} />
            
            {task.dueDate && (
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${isOverdue ? "text-red-600 animate-pulse" : "text-zinc-500"}`}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatDate(task.dueDate)}
              </span>
            )}

            {task.comments && task.comments.length > 0 && (
              <span className="inline-flex items-center gap-0.5 text-[10px] text-zinc-500 font-bold" title={`${task.comments.length} comments`}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {task.comments.length}
              </span>
            )}
          </div>

          {/* Assignees */}
          <div className="flex -space-x-1.5 overflow-hidden">
            {task.assignees && task.assignees.slice(0, 3).map((assignee, idx) => (
              <Avatar
                key={idx}
                name={assignee.name}
                size="sm"
                className="ring-2 ring-white border border-black"
              />
            ))}
            {task.assignees && task.assignees.length > 3 && (
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-zinc-900 border border-black text-[10px] font-black text-teal-200 shrink-0 ring-2 ring-white z-10">
                +{task.assignees.length - 3}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
