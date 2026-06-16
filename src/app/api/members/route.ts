import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import Member from "@/models/Member";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    const workspace = user?.workspace || "Android Club";

    await connectDB();
    const members = await Member.find({ workspace }).sort({ name: 1 });
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
      role: role || "Member",
      avatar: initials,
      workspace: user.workspace,
    });

    return Response.json(member, { status: 201 });
  } catch (error) {
    console.error("Failed to create member:", error);
    return Response.json({ message: "Failed to create member" }, { status: 500 });
  }
}
