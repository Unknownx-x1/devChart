const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");
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
        process.env[key] = value.trim();
      }
    });
  }
};

loadEnv();

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/devChart";
console.log("Connecting to MongoDB at:", uri);
const client = new MongoClient(uri);

async function main() {
  try {
    await client.connect();
    console.log("Connected to MongoDB successfully!");
    const db = client.db("devChart");
    const usersCollection = db.collection("users");
    const membersCollection = db.collection("members");
    const workspacesCollection = db.collection("workspaces");

    const email = "sood.shivansh13@gmail.com";
    const name = "Shivansh Sood";
    const password = "admin123";
    const workspace = "Android Club";

    // Upsert default Workspace record
    const workspaceResult = await workspacesCollection.updateOne(
      { name: workspace },
      { $set: { name: workspace, description: "Default workspace for android development club" } },
      { upsert: true }
    );
    console.log("Upserted Workspace record:", workspaceResult);

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Upsert Admin User
    const userResult = await usersCollection.updateOne(
      { email, workspace },
      {
        $set: {
          name,
          email,
          password: hashedPassword,
          role: "Admin",
          avatar: "SS",
          workspace,
        }
      },
      { upsert: true }
    );

    console.log("Upserted Admin User record:", userResult);

    // Upsert corresponding Member record
    const memberResult = await membersCollection.updateOne(
      { name, workspace },
      {
        $set: {
          name,
          role: "Admin",
          avatar: "SS",
          workspace,
        }
      },
      { upsert: true }
    );

    console.log("Upserted corresponding Member record:", memberResult);
    console.log("\n==================================================");
    console.log("Seeding complete! You can log in using:");
    console.log(`Email: ${email}`);
    console.log(`Workspace: ${workspace}`);
    console.log(`Password: ${password}`);
    console.log("==================================================\n");

  } catch (error) {
    console.error("Error seeding Admin user:", error);
  } finally {
    await client.close();
  }
}

main();
