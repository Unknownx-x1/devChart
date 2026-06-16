import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import Task from "@/models/Tasks";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const statusParam = searchParams.get("status");
    const sortParam = searchParams.get("sort");
    const workspaceParam = searchParams.get("workspace");

    const query: any = {};
    if (statusParam) {
      query.status = statusParam;
    }
    if (workspaceParam) {
      query.workspace = workspaceParam;
    }

    let queryBuilder = Task.find(query);

    if (sortParam === "order") {
      queryBuilder = queryBuilder.sort({ order: 1, createdAt: -1 });
    } else {
      queryBuilder = queryBuilder.sort({ createdAt: -1 });
    }

    const tasks = await queryBuilder;

    // Normalize tasks to ensure status field exists
    const normalized = tasks.map((t) => {
      const obj = t.toObject();
      return {
        ...obj,
        status: obj.status || "Todo",
      };
    });

    return Response.json(normalized);
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    return Response.json(
      { message: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    
    // Ensure default status
    const status = body.status || "Todo";
    
    // Prepare activity log
    const activity = [
      {
        action: "Task created",
        actorName: body.actorName || "A member",
        timestamp: new Date(),
      }
    ];

    const taskData = {
      ...body,
      status,
      activity: body.activity || activity,
    };

    const task = await Task.create(taskData);

    return Response.json(task, { status: 201 });
  } catch (error) {
    console.error("Failed to create task:", error);
    return Response.json(
      { message: "Failed to create task" },
      { status: 500 }
    );
  }
}