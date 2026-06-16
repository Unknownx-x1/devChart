import mongoose from "mongoose";

const WorkspaceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    default: "",
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const Workspace = mongoose.models.Workspace || mongoose.model("Workspace", WorkspaceSchema);

export default Workspace;
