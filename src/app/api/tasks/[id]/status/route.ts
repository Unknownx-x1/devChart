import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import Task from "@/models/Tasks";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = await params;
    const { status, actorName } = await request.json();

    const valid = ['Todo', 'InProgress', 'Done'];
    if (!valid.includes(status)) {
      return Response.json({ error: 'Invalid status' }, { status: 400 });
    }

    const task = await Task.findByIdAndUpdate(
      id,
      {
        status,
        $push: {
          activity: {
            action: `Moved to ${status}`,
            actorName: actorName || 'A member',
            timestamp: new Date(),
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
    console.error("Failed to patch status:", error);
    return Response.json({ message: "Failed to update task status" }, { status: 500 });
  }
}
