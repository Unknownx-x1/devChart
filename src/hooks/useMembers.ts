import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export type Member = {
  _id: string;
  name: string;
  role: "Admin" | "Lead" | "Member" | "Visitor";
  avatar: string;
  joinedAt?: string;
  activeTasksCount?: number;
};

export function useMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/members");
      if (!res.ok) throw new Error("Failed to fetch members");
      const data = await res.json();
      setMembers(data);
    } catch (error) {
      toast.error("Failed to load club members");
    } finally {
      setLoading(false);
    }
  };

  const addMember = async (name: string, role: string) => {
    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, role }),
      });
      if (!res.ok) throw new Error("Failed to add member");
      const newMember = await res.json();
      setMembers((prev) => [...prev, newMember].sort((a, b) => a.name.localeCompare(b.name)));
      toast.success(`${name} added to the club!`);
      return newMember;
    } catch (error) {
      toast.error("Failed to add member");
      throw error;
    }
  };

  const updateMemberRole = async (memberId: string, role: string) => {
    try {
      const res = await fetch("/api/members", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, role }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to update member role");
      }
      const updatedMember = await res.json();
      setMembers((prev) =>
        prev.map((m) => (m._id === memberId ? updatedMember : m))
      );
      toast.success(`Role updated successfully!`);
      return updatedMember;
    } catch (error: any) {
      toast.error(error.message || "Failed to update role");
      throw error;
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  return { members, loading, refetch: fetchMembers, addMember, updateMemberRole };
}
