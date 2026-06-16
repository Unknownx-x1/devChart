import React from "react";

interface EmptyStateProps {
  title: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export default function EmptyState({ title, message, actionText, onAction, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center bg-teal-50/50 border-2 border-dashed border-black rounded-xl m-1">
      {icon ? (
        <div className="mb-3 text-slate-400">{icon}</div>
      ) : (
        <svg
          className="w-10 h-10 mb-3 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      )}
      <h3 className="text-base font-bold text-black mb-1">{title}</h3>
      <p className="text-xs text-slate-600 mb-3 max-w-xs">{message}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="py-1 px-3 bg-teal-200 text-black hover:bg-teal-300 text-xs font-bold border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
