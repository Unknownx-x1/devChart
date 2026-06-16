import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { signToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { email, password, workspace } = await request.json();

    if (!email || !password) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const emailLower = email.toLowerCase().trim();
    const workspaceName = (workspace || "Android Club").trim();

    // Find user under specific workspace/club
    const user = await User.findOne({ email: emailLower, workspace: workspaceName });
    if (!user) {
      return Response.json({ error: "Invalid email, password, or club selection" }, { status: 401 });
    }

    // Compare passwords
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return Response.json({ error: "Invalid email, password, or club selection" }, { status: 401 });
    }

    // Sign session JWT
    const payload = {
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role as any,
      avatar: user.avatar,
      workspace: user.workspace,
    };
    const token = signToken(payload);

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("devchart_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    const userObj = user.toObject();
    delete userObj.password;

    return Response.json({ user: userObj });
  } catch (error) {
    console.error("Login error:", error);
    return Response.json({ error: "Failed to authenticate user" }, { status: 500 });
  }
}
