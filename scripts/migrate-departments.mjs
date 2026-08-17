import "dotenv/config";
import mongoose from "mongoose";
import { Department, User, Subject } from "../models/index.js";

const departments = [
  { name: "Computer Engineering", code: "CE", institute: "CSPIT" },
  { name: "Computer Science & Engineering", code: "CSE", institute: "CSPIT" },
  { name: "Information Technology", code: "IT", institute: "CSPIT" },
  { name: "Electronics & Communication", code: "EC", institute: "CSPIT" },
  { name: "Artificial Intelligence & Machine Learning", code: "AIML", institute: "CSPIT" },
];

await mongoose.connect(process.env.MONGO_URI);
try {
  for (const department of departments) {
    await Department.updateOne({ code: department.code }, { $set: department }, { upsert: true });
  }

  // Existing records in this single-department deployment are CSPIT/CSE legacy data.
  // Do not overwrite already assigned departments.
  const userMigration = await User.updateMany(
    { departmentId: { $exists: false } },
    { $set: { departmentId: "CSE" } },
  );
  const subjectMigration = await Subject.updateMany(
    { departmentId: { $exists: false } },
    { $set: { departmentId: "CSE" } },
  );

  console.log(
    JSON.stringify(
      {
        ok: true,
        departmentsUpserted: departments.length,
        usersAssignedToCSE: userMigration.modifiedCount,
        subjectsAssignedToCSE: subjectMigration.modifiedCount,
      },
      null,
      2,
    ),
  );
} finally {
  await mongoose.disconnect();
}
