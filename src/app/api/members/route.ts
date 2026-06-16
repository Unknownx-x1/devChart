import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import Member from "@/models/Member";
import User from "@/models/User";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    const workspace = user?.workspace || "Android Club";

    await connectDB();
    const members = await Member.find({ workspace, role: { $ne: "Admin" } }).sort({ name: 1 });
    return Response.json(members);
  } catch (error) {
    console.error("Failed to fetch members:", error);
    return Response.json({ message: "Failed to fetch members" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || (user.role !== "Admin" && user.role !== "Lead")) {
      return Response.json(
        { message: "Unauthorized. Only Admins and Leads can add members." },
        { status: 403 }
      );
    }

    await connectDB();
    const { name, role, avatar } = await request.json();

    if (!name) {
      return Response.json({ error: "Name is required" }, { status: 400 });
    }

    // Generate initials for avatar if not provided
    const initials = avatar || name.split(" ").map((n: string) => n[0]).join("").toUpperCase().substring(0, 2);

    const member = await Member.create({
      name,
      role: role || "Visitor",
      avatar: initials,
      workspace: user.workspace,
    });

    return Response.json(member, { status: 201 });
  } catch (error) {
    console.error("Failed to create member:", error);
    return Response.json({ message: "Failed to create member" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { memberId, role } = await request.json();
    const targetRole = role?.trim();

    if (!memberId || !targetRole) {
      return Response.json({ error: "memberId and role are required" }, { status: 400 });
    }

    const validRoles = ["Lead", "Member", "Visitor"];
    if (!validRoles.includes(targetRole)) {
      return Response.json({ error: "Invalid role value" }, { status: 400 });
    }

    await connectDB();

    // Find member to edit
    const member = await Member.findById(memberId);
    if (!member) {
      return Response.json({ message: "Member not found" }, { status: 404 });
    }

    // Verify workspace match
    if (member.workspace !== user.workspace) {
      return Response.json({ message: "Unauthorized. Workspace mismatch." }, { status: 403 });
    }

    // Apply RBAC rules
    // Admin: can set any role (Lead, Member, Visitor).
    // Lead: can change roles of non-Admin and non-Lead members, but target role can only be Member or Visitor.
    if (user.role === "Admin") {
      // Allowed.
    } else if (user.role === "Lead") {
      if (member.role === "Admin" || member.role === "Lead") {
        return Response.json({ message: "Unauthorized. Leads cannot change role of Admins or other Leads." }, { status: 403 });
      }
      if (targetRole === "Lead") {
        return Response.json({ message: "Unauthorized. Leads cannot assign Lead role." }, { status: 403 });
      }
    } else {
      return Response.json({ message: "Unauthorized. Only Admins and Leads can modify member roles." }, { status: 403 });
    }

    // Perform updates in DB
    member.role = targetRole;
    await member.save();

    // Also update corresponding User account
    const dbUser = await User.findOne({ name: member.name, workspace: member.workspace });
    if (dbUser) {
      dbUser.role = targetRole;
      await dbUser.save();
    }

    return Response.json(member);
  } catch (error) {
    console.error("Failed to update member role:", error);
    return Response.json({ message: "Failed to update member role" }, { status: 500 });
  }
}
