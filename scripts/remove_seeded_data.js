import 'dotenv/config';
import mongoose from 'mongoose';
import { User, Subject, Document } from '../models/index.js';

const seedEmails = [
  'admin@charusat.edu.in',
  'faculty@charusat.edu.in',
  'anil@charusat.edu.in',
  'priya@charusat.edu.in',
  'student@charusat.edu.in',
  'meera@charusat.edu.in',
  'kabir@charusat.edu.in',
];

const seedSubjectCodes = ['CSE501', 'CSE502', 'CSE503', 'CSE504', 'CSE505', 'CSE506'];
const seedDocumentPrefix = 'seed_';
const seedDocumentFileNames = [
  'Big_Data_Analytics_Unit1_Introduction.pdf',
  'Operating_Systems_Unit1_Concepts_and_Types.pdf',
  'Machine_Learning_Unit1_Introduction.pdf',
  'Cloud_Computing_Unit1_Introduction.pdf',
  'Distributed_Systems_Unit1_Concepts.pdf',
  'Computer_Networks_Unit1_Protocols.pdf',
];

async function main() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI is not defined in .env');
    process.exit(1);
  }

  await mongoose.connect(uri, {
    connectTimeoutMS: 10000,
    serverSelectionTimeoutMS: 10000,
  });

  const seededUsers = await User.find({ email: { $in: seedEmails } }).lean();
  const seededUserIds = seededUsers.map((u) => u._id);

  const removedUsers = await User.deleteMany({ email: { $in: seedEmails } });
  console.log(`Removed ${removedUsers.deletedCount || 0} seeded user(s).`);

  const removedDocuments = await Document.deleteMany({
    $or: [
      { uploaderId: { $in: seededUserIds } },
      { cloudinaryPublicId: { $regex: `^${seedDocumentPrefix}` } },
      { fileName: { $in: seedDocumentFileNames } },
    ],
  });
  console.log(`Removed ${removedDocuments.deletedCount || 0} seeded document(s).`);

  const removedSubjects = await Subject.deleteMany({
    $or: [
      { code: { $in: seedSubjectCodes }, facultyId: { $in: seededUserIds } },
      { code: { $in: seedSubjectCodes }, name: { $in: seedDocumentFileNames.map((file) => file.replace(/_/g, ' ').replace('.pdf', '')) } },
    ],
  });
  console.log(`Removed ${removedSubjects.deletedCount || 0} seeded subject(s).`);

  await mongoose.disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
