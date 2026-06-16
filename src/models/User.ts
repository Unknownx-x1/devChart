import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    workspace: {
      type: String,
      required: true,
      default: "Android Club",
    },
    role: {
      type: String,
      enum: ["Admin", "Lead", "Member"],
      default: "Member",
    },
    avatar: {
      type: String,
    },
  },
  { timestamps: true }
);

// Define compound unique index for club-specific registration
UserSchema.index({ email: 1, workspace: 1 }, { unique: true });

// Pre-save hook to auto-generate avatar initials if not set
UserSchema.pre("save", function (this: any) {
  if (this.name && !this.avatar) {
    this.avatar = this.name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  }
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
