"use client";

import React from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import KanbanColumn from "./KanbanColumn";
import { Task } from "@/hooks/useTasks";

interface KanbanBoardProps {
  tasks: Task[];
  onCardClick: (task: Task) => void;
  onAddTaskClick: (status: "Todo" | "InProgress" | "Done") => void;
  onDragEnd: (result: DropResult) => void;
}

export default function KanbanBoard({
  tasks,
  onCardClick,
  onAddTaskClick,
  onDragEnd,
}: KanbanBoardProps) {
  // Filter tasks for columns based on status
  const todoTasks = tasks.filter((t) => t.status === "Todo" || !t.status);
  const inProgressTasks = tasks.filter((t) => t.status === "InProgress");
  const doneTasks = tasks.filter((t) => t.status === "Done");

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex flex-col lg:flex-row items-stretch justify-center gap-6 p-2 w-full overflow-x-auto min-h-[500px]">
        <KanbanColumn
          id="Todo"
          title="To Do"
          tasks={todoTasks}
          onCardClick={onCardClick}
          onAddTaskClick={onAddTaskClick}
        />
        <KanbanColumn
          id="InProgress"
          title="In Progress"
          tasks={inProgressTasks}
          onCardClick={onCardClick}
          onAddTaskClick={onAddTaskClick}
        />
        <KanbanColumn
          id="Done"
          title="Done"
          tasks={doneTasks}
          onCardClick={onCardClick}
          onAddTaskClick={onAddTaskClick}
        />
      </div>
    </DragDropContext>
  );
}
