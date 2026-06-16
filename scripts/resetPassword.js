const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");

const uri = "mongodb://localhost:27017/devChart";
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
