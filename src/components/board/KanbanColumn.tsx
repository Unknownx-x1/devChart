import React from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import TaskCard from "@/components/TaskCard";
import EmptyState from "@/components/shared/EmptyState";
import { Task } from "@/hooks/useTasks";

interface KanbanColumnProps {
  id: "Todo" | "InProgress" | "Done";
  title: string;
  tasks: Task[];
  onCardClick: (task: Task) => void;
  onAddTaskClick: (status: "Todo" | "InProgress" | "Done") => void;
}

export default function KanbanColumn({
  id,
  title,
  tasks,
  onCardClick,
  onAddTaskClick,
}: KanbanColumnProps) {
  const columnTheme = {
    Todo: {
      border: "border-slate-400",
      bg: "bg-slate-100/70",
      text: "text-slate-800",
      accent: "bg-slate-200",
    },
    InProgress: {
      border: "border-indigo-400",
      bg: "bg-indigo-50/70",
      text: "text-indigo-800",
      accent: "bg-indigo-100",
    },
    Done: {
      border: "border-emerald-400",
      bg: "bg-emerald-50/70",
      text: "text-emerald-800",
      accent: "bg-emerald-100",
    },
  }[id];

  return (
    <div className={`flex flex-col flex-1 min-w-[280px] md:min-w-[320px] max-w-md h-[calc(100vh-220px)] border-4 border-black rounded-2xl bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden`}>
      {/* Column Header */}
      <div className={`flex items-center justify-between p-3 border-b-4 border-black bg-teal-200`}>
        <div className="flex items-center gap-2">
          <h2 className="text-base font-black text-black uppercase tracking-wider">{title}</h2>
          <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-black bg-black text-white rounded-md border border-black">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => onAddTaskClick(id)}
          className="p-1.5 bg-white hover:bg-black hover:text-white rounded-lg border-2 border-black transition-colors focus:outline-none cursor-pointer"
          title={`Add task to ${title}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Droppable Card List */}
      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 p-3 overflow-y-auto flex flex-col gap-3 transition-colors ${
              snapshot.isDraggingOver ? columnTheme.bg : "bg-zinc-50"
            }`}
          >
            {tasks.length === 0 ? (
              <EmptyState
                title="No tasks here"
                message={`Drop a card here, or click "+" above to create a new task in ${title}.`}
              />
            ) : (
              tasks.map((task, index) => (
                <Draggable key={task._id} draggableId={task._id} index={index}>
                  {(dragProvided, dragSnapshot) => (
                    <div
                      ref={dragProvided.innerRef}
                      {...dragProvided.draggableProps}
                      style={{
                        ...dragProvided.draggableProps.style,
                        opacity: dragSnapshot.isDragging ? 0.9 : 1,
                      }}
                    >
                      <TaskCard
                        task={task}
                        onClick={() => onCardClick(task)}
                        dragHandleProps={dragProvided.dragHandleProps}
                      />
                    </div>
                  )}
                </Draggable>
              ))
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
