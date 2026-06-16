import { NextRequest } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("devchart_session");
    return Response.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    return Response.json({ error: "Failed to logout user" }, { status: 500 });
  }
}
