import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../models/index.js";

async function syncDatabaseUsers() {
  const uri = process.env.MONGO_URI;
  console.log("[SyncScript] Connecting to MongoDB Atlas...");
  await mongoose.connect(uri);
  console.log("[SyncScript] Connected!");

  const existingUsers = await User.find();
  console.log(`[SyncScript] Current MongoDB User count: ${existingUsers.length}`);
  existingUsers.forEach(u => console.log(`  - ID: ${u._id}, Name: ${u.name}, Email: ${u.email}, Role: ${u.role}`));

  // Upsert target Admin: Amit Thakkar (hod@charusat.ac.in)
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash("12345678", salt);

  const adminEmail = "hod@charusat.ac.in";
  await User.findOneAndUpdate(
    { email: adminEmail },
    {
      name: "Amit Thakkar",
      email: adminEmail,
      passwordHash,
      role: "admin",
    },
    { upsert: true, returnDocument: "after" }
  );
  console.log(`[SyncScript] ✅ Admin Amit Thakkar (${adminEmail}) upserted in MongoDB.`);

  // Delete all users except hod@charusat.ac.in
  const deleteResult = await User.deleteMany({ email: { $ne: adminEmail } });
  console.log(`[SyncScript] ✅ Deleted ${deleteResult.deletedCount} unnecessary users from MongoDB.`);

  const finalUsers = await User.find();
  console.log(`[SyncScript] Final MongoDB User count: ${finalUsers.length}`);
  finalUsers.forEach(u => console.log(`  - ID: ${u._id}, Name: ${u.name}, Email: ${u.email}, Role: ${u.role}`));

  await mongoose.disconnect();
  console.log("[SyncScript] Done.");
}

syncDatabaseUsers().catch((err) => {
  console.error("[SyncScript Error]", err);
  process.exit(1);
});
