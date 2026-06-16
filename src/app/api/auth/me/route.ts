import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { getUserFromRequest, signToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const userPayload = getUserFromRequest(request);
    if (!userPayload) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const dbUser = await User.findOne({ email: userPayload.email, workspace: userPayload.workspace });
    if (!dbUser) {
      return Response.json({ error: "User not found" }, { status: 401 });
    }

    const updatedPayload = {
      userId: dbUser._id.toString(),
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role as any,
      avatar: dbUser.avatar,
      workspace: dbUser.workspace,
    };

    const response = Response.json({ user: updatedPayload });

    // If the role or other properties changed in database, dynamically refresh cookie
    if (dbUser.role !== userPayload.role || dbUser.name !== userPayload.name || dbUser.avatar !== userPayload.avatar) {
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

    return response;
  } catch (error) {
    console.error("Auth me error:", error);
    return Response.json({ error: "Failed to verify session" }, { status: 500 });
  }
}
