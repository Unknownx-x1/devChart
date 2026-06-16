import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import connectDB from "@/lib/mongodb";
import Task from "@/models/Tasks";
import User from "@/models/User";
import Member from "@/models/Member";
import { getUserFromRequest, signToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== "Admin") {
      return Response.json(
        { message: "Unauthorized. Only Admins can rename workspaces." },
        { status: 403 }
      );
    }

    await connectDB();
    const { oldWorkspace, newWorkspace } = await request.json();

    if (!oldWorkspace || !newWorkspace) {
      return Response.json(
        { message: "Both oldWorkspace and newWorkspace are required" },
        { status: 400 }
      );
    }

    // Rename tasks, user accounts, and members in database
    const [taskResult] = await Promise.all([
      Task.updateMany({ workspace: oldWorkspace }, { $set: { workspace: newWorkspace } }),
      User.updateMany({ workspace: oldWorkspace }, { $set: { workspace: newWorkspace } }),
      Member.updateMany({ workspace: oldWorkspace }, { $set: { workspace: newWorkspace } }),
    ]);

    // If the active user is in the renamed workspace, update their JWT session token
    if (user.workspace === oldWorkspace) {
      const updatedPayload = {
        ...user,
        workspace: newWorkspace,
      };
      const token = signToken(updatedPayload);
      const cookieStore = await cookies();
      cookieStore.set("devchart_session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: "/",
      });
    }

    return Response.json({
      message: "Workspace details renamed successfully across all records",
      matchedCount: taskResult.matchedCount,
      modifiedCount: taskResult.modifiedCount,
    });
  } catch (error) {
    console.error("Failed to rename workspace:", error);
    return Response.json(
      { message: "Failed to rename workspace" },
      { status: 500 }
    );
  }
}
