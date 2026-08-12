import mongoose from "mongoose";

/**
 * Connects to MongoDB Atlas using process.env.MONGO_URI.
 *
 * Connection Pooling Check (PART 5.21):
 * Mongoose default maxPoolSize is 100, minPoolSize is 0, which is optimal for small-to-medium deployments.
 * No custom override is required unless thread concurrency scales beyond default pool limits.
 */
export async function connectMongo() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("[MongoDB Error] MONGO_URI environment variable is missing.");
    return null;
  }

  try {
    const conn = await mongoose.connect(uri);
    const envLabel = process.env.NODE_ENV === "production" ? "production" : "development";
    console.log(
      `[MongoDB] Connected to ${envLabel} database on Atlas host: ${conn.connection.host} (${conn.connection.name})`
    );
    return conn;
  } catch (error) {
    console.error("[MongoDB Error] Connection failed:", error.message || error);
    return null;
  }
}
