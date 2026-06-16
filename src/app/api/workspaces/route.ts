import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Workspace from "@/models/Workspace";
import Member from "@/models/Member";
import { getUserFromRequest, signToken } from "@/lib/auth";

// GET: returns list of unique workspace/club names in the database
export async function GET() {
  try {
    await connectDB();
    const workspaces = await Workspace.find().distinct("name");

    if (!workspaces.includes("Android Club")) {
      workspaces.unshift("Android Club");
    }

    return NextResponse.json(workspaces);
  } catch (error) {
    console.error("Failed to fetch workspaces:", error);
    return NextResponse.json(["Android Club"]);
  }
}

// POST: Handles Admin creating a new club or switching clubs dynamically in-app
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== "Admin") {
      return NextResponse.json(
        { error: "Unauthorized. Only Admins can manage workspaces." },
        { status: 403 }
      );
    }

    const { name, action } = await request.json();
    const workspaceName = name?.trim();

    if (!workspaceName) {
      return NextResponse.json({ error: "Workspace name is required" }, { status: 400 });
    }

    await connectDB();

    // 1. Create/upsert the Workspace document in workspaces collection
    await Workspace.findOneAndUpdate(
      { name: workspaceName },
      { name: workspaceName },
      { upsert: true, new: true }
    );

    // 2. Replicate Admin credentials to the target workspace (whether switched or created)
    // so they are guaranteed to exist as a User and Member in the new workspace database.
    const adminUser = await User.findOne({ email: user.email, role: "Admin" });
    if (adminUser) {
      await User.findOneAndUpdate(
        { email: adminUser.email, workspace: workspaceName },
        {
          name: adminUser.name,
          email: adminUser.email,
          password: adminUser.password, // Keep the same hashed password
          role: "Admin",
          avatar: adminUser.avatar,
          workspace: workspaceName,
        },
        { upsert: true }
      );

      await Member.findOneAndUpdate(
        { name: adminUser.name, workspace: workspaceName },
        {
          name: adminUser.name,
          role: "Admin",
          avatar: adminUser.avatar,
          workspace: workspaceName,
        },
        { upsert: true }
      );
    }

    // Re-sign user session JWT to point to the new workspace name
    const updatedPayload = {
      ...user,
      workspace: workspaceName,
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

    return NextResponse.json({
      message: action === "create" ? "Workspace created successfully" : "Switched workspace successfully",
      user: updatedPayload
    });
  } catch (error) {
    console.error("Workspace management error:", error);
    return NextResponse.json({ error: "Failed to perform workspace action" }, { status: 500 });
  }
}
