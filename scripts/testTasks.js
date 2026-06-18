const fs = require("fs");
const path = require("path");
const { MongoClient } = require("mongodb");

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

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/devChart";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db("devChart");
    const tasks = await db.collection("tasks").find({}).toArray();
    console.log("\nTasks in database:");
    console.log(JSON.stringify(tasks.map(t => ({
      _id: t._id,
      title: t.title,
      workspace: t.workspace,
      status: t.status,
      dueDate: t.dueDate,
      completed: t.completed
    })), null, 2));
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.close();
  }
}

run();
