import "dotenv/config";
import mongoose from "mongoose";
import { User } from "../models/index.js";
await mongoose.connect(process.env.MONGO_URI);
try {
  const rows = await User.aggregate([
    { $group: { _id: { role: "$role", departmentId: "$departmentId" }, count: { $sum: 1 } } },
    { $sort: { "_id.role": 1, "_id.departmentId": 1 } },
  ]);
  console.log(JSON.stringify(rows, null, 2));
} finally {
  await mongoose.disconnect();
}
