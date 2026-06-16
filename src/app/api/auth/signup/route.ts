import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Member from "@/models/Member";
import { signToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { name, email, password, role, workspace } = await request.json();

    if (!name || !email || !password) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (role === "Admin") {
      return Response.json(
        { error: "Unauthorized. You cannot register as a Club Admin." },
        { status: 403 }
      );
    }

    const emailLower = email.toLowerCase().trim();
    const workspaceName = (workspace || "Android Club").trim();

    // Check if user exists under the specified workspace/club
    const existingUser = await User.findOne({ email: emailLower, workspace: workspaceName });
    if (existingUser) {
      return Response.json({ error: "User with this email already registered in this club" }, { status: 409 });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate initials for avatar
    const initials = name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);

    // Create User
    const user = await User.create({
      name,
      email: emailLower,
      password: hashedPassword,
      role: "Visitor",
      avatar: initials,
      workspace: workspaceName,
    });

    // Create corresponding Member record if not exists in this workspace
    const existingMember = await Member.findOne({ name: user.name, workspace: workspaceName });
    if (!existingMember) {
      await Member.create({
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        workspace: workspaceName,
      });
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

    return Response.json({ user: userObj }, { status: 201 });
  } catch (error) {
    console.error("Signup error:", error);
    return Response.json({ error: "Failed to register user" }, { status: 500 });
  }
}
