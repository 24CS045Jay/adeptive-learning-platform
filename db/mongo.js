import mongoose from "mongoose";

/**
 * Connects to MongoDB Atlas using process.env.MONGO_URI.
 * Logs success on connection or logs error and exits process on failure.
 */
export async function connectMongo() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("[MongoDB Error] MONGO_URI environment variable is missing.");
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`[MongoDB] Connected successfully to Atlas host: ${conn.connection.host} (${conn.connection.name})`);
    return conn;
  } catch (error) {
    console.error("[MongoDB Error] Connection failed:", error);
    process.exit(1);
  }
}
