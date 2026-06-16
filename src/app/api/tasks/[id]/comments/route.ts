import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import Task from "@/models/Tasks";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = await params;
    const { authorName, text } = await request.json();

    if (!authorName || !text) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const task = await Task.findByIdAndUpdate(
      id,
      {
        $push: {
          comments: { authorName, text, createdAt: new Date() },
          activity: { 
            action: `Commented: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`, 
            actorName: authorName, 
            timestamp: new Date() 
          },
        },
      },
      { new: true }
    );

    if (!task) {
      return Response.json({ message: "Task not found" }, { status: 404 });
    }

    return Response.json(task);
  } catch (error) {
    console.error("Failed to post comment:", error);
    return Response.json({ message: "Failed to post comment" }, { status: 500 });
  }
}
