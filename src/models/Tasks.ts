import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema({
  authorName: { type: String, required: true },
  authorId:   { type: String },
  text:       { type: String, required: true },
  createdAt:  { type: Date, default: Date.now },
});

const ActivitySchema = new mongoose.Schema({
  action:     { type: String, required: true },
  actorName:  { type: String },
  timestamp:  { type: Date, default: Date.now },
});

const TaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    workspace: {
      type: String,
      default: 'Android Club',
    },
    description: {
      type: String,
      default: '',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    completed: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['Todo', 'InProgress', 'Done'],
      default: 'Todo',
    },
    assignees: [
      {
        name: { type: String },
        userId: { type: String },
        avatar: { type: String },
      },
    ],
    dueDate: { type: Date, default: null },
    labels: [{ type: String }],
    comments: [CommentSchema],
    activity: [ActivitySchema],
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Task = mongoose.models.Task || mongoose.model("Task", TaskSchema);

export default Task;