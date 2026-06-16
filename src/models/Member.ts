import mongoose from "mongoose";

const MemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: {
    type: String,
    enum: ['Admin', 'Lead', 'Member'],
    default: 'Member',
  },
  workspace: {
    type: String,
    required: true,
    default: "Android Club",
  },
  avatar: { type: String }, // initials string, e.g., "JD"
  joinedAt: { type: Date, default: Date.now },
});

// Ensure member names are unique per club/workspace
MemberSchema.index({ name: 1, workspace: 1 }, { unique: true });

const Member = mongoose.models.Member || mongoose.model("Member", MemberSchema);

export default Member;
