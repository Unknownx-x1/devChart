import { NextRequest } from "next/server";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const userPayload = getUserFromRequest(request);
    if (!userPayload) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    return Response.json({ user: userPayload });
  } catch (error) {
    console.error("Auth me error:", error);
    return Response.json({ error: "Failed to verify session" }, { status: 500 });
  }
}
