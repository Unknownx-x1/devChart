const { MongoClient } = require("mongodb");
const uri = "mongodb://localhost:27017/devChart";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    console.log("Connected to MongoDB successfully!");
    const db = client.db("devChart");
    
    // List databases
    const adminDb = client.db().admin();
    const dbs = await adminDb.listDatabases();
    console.log("\nDatabases in your MongoDB instance:");
    dbs.databases.forEach(d => console.log(` - ${d.name} (${(d.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`));

    // Fetch users
    const users = await db.collection("users").find({}).toArray();
    console.log("\nDocuments in 'users' collection:");
    console.log(JSON.stringify(users, null, 2));

    // Fetch workspaces
    const workspaces = await db.collection("workspaces").find({}).toArray();
    console.log("\nDocuments in 'workspaces' collection:");
    console.log(JSON.stringify(workspaces, null, 2));

    // Fetch members
    const members = await db.collection("members").find({}).toArray();
    console.log("\nDocuments in 'members' collection:");
    console.log(JSON.stringify(members, null, 2));

  } catch (err) {
    console.error("Error connecting or querying:", err);
  } finally {
    await client.close();
  }
}

run();
