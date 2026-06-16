import React from "react";

interface BadgeProps {
  label: string;
  variant?: "low" | "medium" | "high" | "critical" | "todo" | "inprogress" | "done" | "default";
  className?: string;
}

export default function Badge({ label, variant = "default", className = "" }: BadgeProps) {
  const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border border-black shadow-sm uppercase tracking-wider";
  
  const variantClasses = {
    low: "bg-green-100 text-green-800 border-black",
    medium: "bg-amber-100 text-amber-800 border-black",
    high: "bg-orange-100 text-orange-800 border-black",
    critical: "bg-red-100 text-red-800 border-black animate-pulse",
    todo: "bg-slate-100 text-slate-800 border-black",
    inprogress: "bg-indigo-100 text-indigo-800 border-black",
    done: "bg-emerald-100 text-emerald-800 border-black",
    default: "bg-teal-100 text-teal-800 border-black",
  };

  const getVariant = () => {
    const key = variant.toLowerCase() as keyof typeof variantClasses;
    return variantClasses[key] || variantClasses.default;
  };

  return (
    <span className={`${baseClasses} ${getVariant()} ${className}`}>
      {label}
    </span>
  );
}
