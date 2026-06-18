"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Avatar from "@/components/shared/Avatar";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import Modal from "@/components/shared/Modal";

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

  // Modal states for Admin to create workspace in-app
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newClubName, setNewClubName] = useState("");
  const [newClubDesc, setNewClubDesc] = useState("");

  // Synchronize available clubs list from database and localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const loadClubs = async () => {
        // Fetch workspaces dynamically from database
        try {
          const res = await fetch("/api/workspaces");
          if (res.ok) {
            const list = await res.json();
            
            // Sync with local list
            const savedListStr = localStorage.getItem("devchart_workspaces_list");
            let localList: string[] = list;
            if (savedListStr) {
              try {
                const parsed = JSON.parse(savedListStr);
                if (Array.isArray(parsed)) {
                  // Merge lists to keep all local registrations
                  localList = Array.from(new Set([...list, ...parsed]));
                }
              } catch (e) {}
            }
            
            if (user?.workspace && !localList.includes(user.workspace)) {
              localList.push(user.workspace);
            }
            
            localStorage.setItem("devchart_workspaces_list", JSON.stringify(localList));
            setWorkspaces(localList);
            return;
          }
        } catch (e) {
          console.error("Failed to load workspaces from backend", e);
        }

        // Fallback to localStorage only if API fails
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

    // Admin can switch dynamically in-app!
    if (user && user.role === "Admin") {
      try {
        const res = await fetch("/api/workspaces", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, action: "switch" }),
        });

        if (!res.ok) {
          throw new Error("Failed to switch workspace session on backend");
        }

        // Set local storage current workspace
        localStorage.setItem("devchart_current_workspace", name);

        toast.success(`Switched to: ${name}`);
        setIsDropdownOpen(false);
        window.dispatchEvent(new Event("workspaceChanged"));
        window.location.reload(); // Refresh page context
      } catch (e) {
        console.error(e);
        toast.error("Failed to switch workspace");
      }
      return;
    }

    // Regular users: must logout to switch
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

  const handleCreateWorkspaceClick = () => {
    setNewClubName("");
    setNewClubDesc("");
    setIsCreateModalOpen(true);
    setIsDropdownOpen(false);
  };

  const handleCreateWorkspaceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newClubName.trim();
    if (!trimmed) {
      toast.error("Club name cannot be empty!");
      return;
    }
    if (workspaces.includes(trimmed)) {
      toast.error("A club with this name already exists!");
      return;
    }

    try {
      // Create workspace and switch session on backend
      const res = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed, action: "create" }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to create workspace on backend");
      }

      // Save description to localStorage if provided
      if (newClubDesc.trim()) {
        const descKey = `devchart_workspace_desc_${trimmed}`;
        localStorage.setItem(descKey, newClubDesc.trim());
      }

      const newList = [...workspaces, trimmed];
      localStorage.setItem("devchart_workspaces_list", JSON.stringify(newList));
      localStorage.setItem("devchart_current_workspace", trimmed);
      setWorkspaces(newList);
      setIsCreateModalOpen(false);

      toast.success(`Created and switched to: ${trimmed}`);
      window.dispatchEvent(new Event("workspaceChanged"));
      window.location.reload(); // Refresh session
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to create club workspace");
    }
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center bg-black text-teal-200 border-b-4 border-black p-4 gap-4">
      {/* Brand & Project Selector */}
      <div className="flex items-center gap-3 flex-wrap">
        <Link href="/" className="hover:opacity-85 transition-opacity">
          <h1 className="text-2xl font-black tracking-wider text-teal-200">devChart</h1>
        </Link>
        {user && (
          <>
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
                  {user && user.role === "Admin" && (
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
          </>
        )}
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
        {onNewTaskClick && user && user.role !== "Visitor" && (
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

      {/* Create New Club Modal (Admin Only) */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Club"
      >
        <form onSubmit={handleCreateWorkspaceSubmit} className="flex flex-col gap-4 text-black">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase tracking-wide">Club Name</label>
            <input
              type="text"
              value={newClubName}
              onChange={(e) => setNewClubName(e.target.value)}
              placeholder="e.g. Google Developer Group"
              className="w-full p-2.5 bg-white border-2 border-black rounded-lg text-xs font-bold focus:outline-none"
              maxLength={40}
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase tracking-wide">Description (Optional)</label>
            <textarea
              rows={3}
              value={newClubDesc}
              onChange={(e) => setNewClubDesc(e.target.value)}
              placeholder="e.g. Developing modern open-source projects and organizing local developer meetups."
              className="w-full p-2.5 bg-white border-2 border-black rounded-lg text-xs font-bold focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="py-2 px-4 bg-white text-black font-bold border-2 border-black rounded-xl shadow-[2.5px_2.5px_0px_0px_rgba(0,0,0,1)] hover:bg-zinc-100 transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] cursor-pointer text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2 px-4 bg-teal-500 text-white font-bold border-2 border-black rounded-xl shadow-[2.5px_2.5px_0px_0px_rgba(0,0,0,1)] hover:bg-teal-600 transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] cursor-pointer text-xs"
            >
              Create Club
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}