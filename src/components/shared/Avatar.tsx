import React from "react";

interface AvatarProps {
  name?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const colors = [
  "bg-rose-500 text-white",
  "bg-emerald-500 text-white",
  "bg-amber-500 text-black",
  "bg-indigo-500 text-white",
  "bg-sky-500 text-white",
  "bg-violet-500 text-white",
  "bg-teal-500 text-white",
  "bg-fuchsia-500 text-white",
];

const getDeterministicColorClass = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

export default function Avatar({ name = "Anonymous", size = "md", className = "" }: AvatarProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  const sizeClasses = {
    sm: "w-7 h-7 text-xs",
    md: "w-9 h-9 text-sm font-semibold",
    lg: "w-12 h-12 text-base font-bold",
  };

  const bgClass = getDeterministicColorClass(name);

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full shrink-0 border border-black shadow-sm ${sizeClasses[size]} ${bgClass} ${className}`}
      title={name}
    >
      {initials}
    </div>
  );
}
