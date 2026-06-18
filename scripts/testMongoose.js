const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

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
        process.env[key] = value.trim();
      }
    });
  }
};

loadEnv();

const TaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    workspace: { type: String, default: 'Android Club' },
    status: { type: String, default: 'Todo' },
  },
  { timestamps: true }
);

const Task = mongoose.models.Task || mongoose.model("Task", TaskSchema);

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/devChart";

async function run() {
  try {
    await mongoose.connect(uri);
    console.log("Connected successfully!");

    console.log("\nQuerying: {} (all)");
    const all = await Task.find({});
    console.log("Found:", all.length);

    console.log("\nQuerying: { workspace: 'Android Club' }");
    const android = await Task.find({ workspace: "Android Club" });
    console.log("Found:", android.map(t => t.title));

    console.log("\nQuerying: { workspace: 'CodeChef Club' }");
    const codechef = await Task.find({ workspace: "CodeChef Club" });
    console.log("Found:", codechef.map(t => t.title));
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
