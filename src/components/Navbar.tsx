"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Avatar from "@/components/shared/Avatar";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";

interface NavbarProps {
  onNewTaskClick?: () => void;
}

export default function Navbar({ onNewTaskClick }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const currentWorkspace = user?.workspace || "Android Club";
  const [workspaces, setWorkspaces] = useState<string[]>(["Android Club"]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Synchronize available clubs list from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const loadClubs = () => {
        const savedListStr = localStorage.getItem("devchart_workspaces_list");
        let list: string[] = ["Android Club"];
        if (savedListStr) {
          try {
            const parsed = JSON.parse(savedListStr);
            if (Array.isArray(parsed) && parsed.length > 0) {
              list = parsed;
            }
          } catch (e) {}
        }
        
        // Ensure user's active club is in the selector list
        if (user?.workspace && !list.includes(user.workspace)) {
          list.push(user.workspace);
          localStorage.setItem("devchart_workspaces_list", JSON.stringify(list));
        }
        setWorkspaces(list);
      };

      loadClubs();

      const handleSync = () => {
        const updatedListStr = localStorage.getItem("devchart_workspaces_list");
        if (updatedListStr) {
          try {
            const parsed = JSON.parse(updatedListStr);
            if (Array.isArray(parsed)) {
              setWorkspaces(parsed);
            }
          } catch (e) {}
        }
      };

      window.addEventListener("storage", handleSync);
      window.addEventListener("workspaceChanged", handleSync);

      return () => {
        window.removeEventListener("storage", handleSync);
        window.removeEventListener("workspaceChanged", handleSync);
      };
    }
  }, [user]);

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const isActive = (path: string) => {
    return pathname === path;
  };

  const handleSwitchWorkspace = async (name: string) => {
    if (name === currentWorkspace) {
      setIsDropdownOpen(false);
      return;
    }

    const confirmSwitch = window.confirm(
      `You must log out of your current session to switch to "${name}". Switch anyway?`
    );
    if (!confirmSwitch) return;

    try {
      await logout();
      router.push(`/login?workspace=${encodeURIComponent(name)}`);
    } catch (e) {
      console.error(e);
      toast.error("Failed to switch workspace");
    }
  };

  const handleCreateWorkspaceClick = async () => {
    const confirmCreate = window.confirm(
      "To register a new club, you must log out and sign up a new account. Proceed?"
    );
    if (!confirmCreate) return;

    try {
      await logout();
      router.push("/signup?register=new");
    } catch (e) {
      console.error(e);
      toast.error("Failed to proceed to signup");
    }
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center bg-black text-teal-200 border-b-4 border-black p-4 gap-4">
      {/* Brand & Project Selector */}
      <div className="flex items-center gap-3 flex-wrap">
        <Link href="/" className="hover:opacity-85 transition-opacity">
          <h1 className="text-2xl font-black tracking-wider text-teal-200">devChart</h1>
        </Link>
        <span className="text-zinc-700 font-bold hidden sm:inline">|</span>
        
        {/* Workspace Dropdown Selector */}
        <div className="relative" ref={dropdownRef}>
          <div
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg text-xs text-white font-semibold cursor-pointer hover:bg-zinc-800 transition-colors select-none"
          >
            <span className="w-2 h-2 rounded-full bg-teal-300"></span>
            <span>Club: {currentWorkspace}</span>
            <svg className={`w-3.5 h-3.5 ml-1 text-zinc-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {isDropdownOpen && (
            <div className="absolute left-0 mt-2 w-56 bg-zinc-950 border-2 border-zinc-800 rounded-lg shadow-2xl z-50 py-1.5 text-xs text-zinc-200">
              <div className="px-3 py-1.5 text-[10px] font-black uppercase text-zinc-500 tracking-wider border-b border-zinc-900">
                Switch Club
              </div>
              <div className="max-h-60 overflow-y-auto py-1">
                {workspaces.map((ws) => (
                  <button
                    key={ws}
                    onClick={() => handleSwitchWorkspace(ws)}
                    className="w-full text-left px-3 py-2 hover:bg-zinc-900 hover:text-teal-300 font-bold transition-colors flex items-center justify-between"
                  >
                    <span>{ws}</span>
                    {ws === currentWorkspace && (
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-300"></span>
                    )}
                  </button>
                ))}
              </div>
              {user && (user.role === "Admin" || user.role === "Lead") && (
                <div className="border-t border-zinc-900 pt-1.5 mt-1">
                  <button
                    onClick={handleCreateWorkspaceClick}
                    className="w-full text-left px-3 py-2 text-teal-300 hover:text-teal-200 hover:bg-zinc-900 font-black transition-colors flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Create New Club...</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
        <Link href="/dashboard">
          <button
            className={`rounded-lg py-1.5 px-3 text-xs font-bold border-2 border-transparent transition-all cursor-pointer ${
              isActive("/dashboard")
                ? "bg-teal-200 text-black border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.95)]"
                : "text-teal-200 hover:bg-zinc-900"
            }`}
          >
            Dashboard
          </button>
        </Link>
        <Link href="/members">
          <button
            className={`rounded-lg py-1.5 px-3 text-xs font-bold border-2 border-transparent transition-all cursor-pointer ${
              isActive("/members")
                ? "bg-teal-200 text-black border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.95)]"
                : "text-teal-200 hover:bg-zinc-900"
            }`}
          >
            Members
          </button>
        </Link>
        <Link href="/settings">
          <button
            className={`rounded-lg py-1.5 px-3 text-xs font-bold border-2 border-transparent transition-all cursor-pointer ${
              isActive("/settings")
                ? "bg-teal-200 text-black border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.95)]"
                : "text-teal-200 hover:bg-zinc-900"
            }`}
          >
            Settings
          </button>
        </Link>
      </div>

      {/* CTAs & User */}
      <div className="flex items-center gap-3">
        {onNewTaskClick && user && (
          <button
            onClick={onNewTaskClick}
            className="py-1.5 px-3.5 bg-teal-200 hover:bg-teal-300 text-black text-xs font-bold border-2 border-black rounded-lg shadow-[2.5px_2.5px_0px_0px_rgba(255,255,255,1)] transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(255,255,255,1)] cursor-pointer"
          >
            New Task +
          </button>
        )}
        
        {user ? (
          <div className="flex items-center gap-2.5 border-l border-zinc-800 pl-3">
            <div className="flex flex-col text-right">
              <span className="text-xs font-bold text-white leading-none">{user.name}</span>
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-1 leading-none">{user.role}</span>
            </div>
            <Avatar name={user.name} size="sm" className="border-teal-200" />
            <button
              onClick={logout}
              className="py-1 px-2.5 bg-red-950/40 hover:bg-red-900 text-red-400 border border-red-800 hover:border-red-600 rounded-lg transition-colors cursor-pointer text-[10px] font-black uppercase"
              title="Logout"
            >
              Logout
            </button>
          </div>
        ) : (
          <Link href="/login">
            <button className="py-1.5 px-3 bg-white text-black text-xs font-bold border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:bg-zinc-100 cursor-pointer">
              Login
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}