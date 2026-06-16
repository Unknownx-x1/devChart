const fs = require("fs");
const path = require("path");
const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");


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
  const email = process.argv[2];
  const newPassword = process.argv[3];
  const workspace = process.argv[4] || "Android Club";

  if (!email || !newPassword) {
    console.log("\nUsage:");
    console.log("  node scripts/resetPassword.js <email> <newPassword> [workspace]\n");
    console.log("Example:");
    console.log("  node scripts/resetPassword.js sood.shivansh13@gmail.com myNewPass123 \"Android Club\"\n");
    process.exit(1);
  }

  try {
    await client.connect();
    console.log("Connected to MongoDB successfully!");
    const db = client.db("devChart");
    const usersCollection = db.collection("users");

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const result = await usersCollection.updateOne(
      { email: email.toLowerCase().trim(), workspace: workspace.trim() },
      { $set: { password: hashedPassword } }
    );

    if (result.matchedCount === 0) {
      console.log(`\n❌ Error: No user found with email "${email}" in workspace "${workspace}".\n`);
    } else {
      console.log(`\n✅ Success: Updated password for "${email}" in workspace "${workspace}"!\n`);
    }
  } catch (error) {
    console.error("Error updating password:", error);
  } finally {
    await client.close();
  }
}

main();
