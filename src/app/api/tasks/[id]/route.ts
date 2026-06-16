import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import Task from "@/models/Tasks";
import { getUserFromRequest } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = await params;
    const task = await Task.findById(id);
    if (!task) {
      return Response.json({ message: "Task not found" }, { status: 404 });
    }
    return Response.json(task);
  } catch (error) {
    console.error("Failed to fetch task:", error);
    return Response.json({ message: "Failed to fetch task" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (user.role === "Visitor") {
      return Response.json(
        { message: "Forbidden. Visitors cannot update tasks." },
        { status: 403 }
      );
    }

    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const previous = await Task.findById(id);
    if (!previous) {
      return Response.json({ message: "Task not found" }, { status: 404 });
    }

    const updates = { ...body };
    delete updates._id;

    // Track activity log if status is changed via PUT
    if (body.status && previous.status !== body.status) {
      const activityEntry = {
        action: `Moved to ${body.status}`,
        actorName: body.actorName || "A member",
        timestamp: new Date(),
      };
      
      // If task already has updates list, we push to the database update query
      if (!updates.activity) {
        updates.$push = { activity: activityEntry };
      } else {
        updates.activity.push(activityEntry);
      }
    }

    const updated = await Task.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    return Response.json(updated);
  } catch (error) {
    console.error("Failed to update task:", error);
    return Response.json({ message: "Failed to update task" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== "Admin") {
      return Response.json(
        { message: "Unauthorized. Only Admins can delete tasks." },
        { status: 403 }
      );
    }

    await connectDB();
    const { id } = await params;
    const deleted = await Task.findByIdAndDelete(id);
    if (!deleted) {
      return Response.json({ message: "Task not found" }, { status: 404 });
    }
    return Response.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Failed to delete task:", error);
    return Response.json({ message: "Failed to delete task" }, { status: 500 });
  }
}
