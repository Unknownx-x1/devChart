const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

// Simple helper to load .env.local variables
const loadEnv = () => {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    envContent.split("\n").forEach((line) => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || "";
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        }
        process.env[key] = value;
      }
    });
  }
};

loadEnv();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/devChart";

console.log("Connecting to MongoDB at:", MONGODB_URI);

// Schemas & Models
const CommentSchema = new mongoose.Schema({
  authorName: { type: String, required: true },
  text:       { type: String, required: true },
  createdAt:  { type: Date, default: Date.now },
});

const ActivitySchema = new mongoose.Schema({
  action:     { type: String, required: true },
  actorName:  { type: String },
  timestamp:  { type: Date, default: Date.now },
});

const TaskSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  workspace:   { type: String, default: "Android Club" },
  description: { type: String, default: "" },
  priority:    { type: String, enum: ["Low", "Medium", "High", "Critical"], default: "Medium" },
  completed:   { type: Boolean, default: false },
  status:      { type: String, enum: ["Todo", "InProgress", "Done"], default: "Todo" },
  assignees:   [{ name: String, userId: String, avatar: String }],
  dueDate:     { type: Date, default: null },
  labels:      [String],
  comments:    [CommentSchema],
  activity:    [ActivitySchema],
  order:       { type: Number, default: 0 },
});

const MemberSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  workspace: { type: String, default: "Android Club" },
  role:      { type: String, enum: ["Admin", "Lead", "Member"], default: "Member" },
  avatar:    { type: String },
  joinedAt:  { type: Date, default: Date.now },
});

const Task = mongoose.models.Task || mongoose.model("Task", TaskSchema);
const Member = mongoose.models.Member || mongoose.model("Member", MemberSchema);

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Database connected successfully.");

    // Clean up
    await Task.deleteMany({});
    await Member.deleteMany({});
    console.log("Cleared existing tasks and members.");

    // Create Members
    const membersData = [
      { name: "Chinmay Babu", role: "Lead", avatar: "CB" },
      { name: "Shivansh", role: "Admin", avatar: "SH" },
      { name: "Aarav Sharma", role: "Member", avatar: "AS" },
      { name: "Sneha Patel", role: "Member", avatar: "SP" },
      { name: "Kabir Malhotra", role: "Member", avatar: "KM" },
    ];

    const insertedMembers = await Member.insertMany(membersData);
    console.log(`Successfully seeded ${insertedMembers.length} club members.`);

    // Helper to map member name to details
    const getMember = (name) => {
      const found = insertedMembers.find((m) => m.name === name);
      return {
        name: found.name,
        userId: found._id.toString(),
        avatar: found.avatar,
      };
    };

    // Create Tasks
    const tasksData = [
      {
        title: "Setup Android Studio & Emulator",
        description: "Install Android Studio Iguana, configure SDK 34, and set up a Pixel 8 emulator for local testing.",
        priority: "Low",
        status: "Done",
        assignees: [getMember("Sneha Patel")],
        dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        labels: ["setup", "android"],
        comments: [
          { authorName: "Chinmay Babu", text: "Let me know if you run into hardware acceleration issues on AMD CPUs.", createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
          { authorName: "Sneha Patel", text: "Got it working by enabling SVM in BIOS! App runs perfectly.", createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) }
        ],
        activity: [
          { action: "Task created", actorName: "Chinmay Babu", timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
          { action: "Moved to InProgress", actorName: "Sneha Patel", timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
          { action: "Moved to Done", actorName: "Sneha Patel", timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
        ],
        order: 1,
      },
      {
        title: "Design Mobile App Wireframes",
        description: "Create high-fidelity UI mockups in Figma for the home screen, scan screen, and settings page.",
        priority: "High",
        status: "Done",
        assignees: [getMember("Kabir Malhotra")],
        dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        labels: ["figma", "design"],
        comments: [
          { authorName: "Shivansh", text: "Please use the club's standard dark mode palette for the scan screen.", createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) }
        ],
        activity: [
          { action: "Task created", actorName: "Shivansh", timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
          { action: "Moved to InProgress", actorName: "Kabir Malhotra", timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
          { action: "Moved to Done", actorName: "Kabir Malhotra", timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
        ],
        order: 2,
      },
      {
        title: "Implement Firebase Authentication",
        description: "Integrate Firebase Auth SDK to support Google Sign-in and email/password login credentials.",
        priority: "High",
        status: "InProgress",
        assignees: [getMember("Aarav Sharma")],
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // in 2 days
        labels: ["auth", "firebase"],
        comments: [
          { authorName: "Aarav Sharma", text: "Successfully wired up Google OAuth. Working on email verification flow now.", createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000) }
        ],
        activity: [
          { action: "Task created", actorName: "Chinmay Babu", timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
          { action: "Moved to InProgress", actorName: "Aarav Sharma", timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
        ],
        order: 1,
      },
      {
        title: "Create Custom UI Canvas Component",
        description: "Build a custom drawing canvas view that supports multi-touch paths, brush sizing, and color picking.",
        priority: "Critical",
        status: "InProgress",
        assignees: [getMember("Chinmay Babu")],
        dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // in 4 days
        labels: ["frontend", "canvas"],
        comments: [],
        activity: [
          { action: "Task created", actorName: "Chinmay Babu", timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000) },
          { action: "Moved to InProgress", actorName: "Chinmay Babu", timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000) },
        ],
        order: 2,
      },
      {
        title: "Review Pull Requests for Core API",
        description: "Audit incoming PRs for node backend endpoints. Ensure proper query validation and connection caching.",
        priority: "Medium",
        status: "Todo",
        assignees: [getMember("Shivansh")],
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // in 1 day
        labels: ["backend", "review"],
        comments: [],
        activity: [
          { action: "Task created", actorName: "Shivansh", timestamp: new Date() },
        ],
        order: 1,
      },
      {
        title: "Optimize Database Indexes for Search",
        description: "Add compound indexes on task title and description fields to accelerate search filters.",
        priority: "Medium",
        status: "Todo",
        assignees: [getMember("Sneha Patel")],
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // overdue!
        labels: ["database", "performance"],
        comments: [
          { authorName: "Shivansh", text: "This is blocking the production release search testing. Moving priority to high soon.", createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) }
        ],
        activity: [
          { action: "Task created", actorName: "Shivansh", timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
        ],
        order: 2,
      },
      {
        title: "Add Integration Tests for Auth Flow",
        description: "Write integration test cases covering login validation failures and profile token expiry.",
        priority: "Low",
        status: "Todo",
        assignees: [getMember("Aarav Sharma")],
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // in 7 days
        labels: ["testing"],
        comments: [],
        activity: [
          { action: "Task created", actorName: "Chinmay Babu", timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
        ],
        order: 3,
      },
      {
        title: "Release Beta Version to Play Store",
        description: "Generate signed release app bundle, prepare store descriptions, and upload to Google Play Console testing track.",
        priority: "Critical",
        status: "Todo",
        assignees: [getMember("Chinmay Babu"), getMember("Shivansh")],
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // in 5 days
        labels: ["release"],
        comments: [],
        activity: [
          { action: "Task created", actorName: "Chinmay Babu", timestamp: new Date() },
        ],
        order: 4,
      },
    ];

    const insertedTasks = await Task.insertMany(tasksData);
    console.log(`Successfully seeded ${insertedTasks.length} tasks.`);

    console.log("Seeding complete! Closing connection...");
    await mongoose.connection.close();
    console.log("Database connection closed.");
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
}

seed();
