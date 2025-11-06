import mongoose from 'mongoose';

export async function connectMongoose() {
  const uri = process.env.MONGODB_URI!;
  const dbName = process.env.MONGODB_DB || new URL(uri).pathname.replace(/^\/+/, '') || 'prayer-requests';

  mongoose.set('bufferCommands', false);
  await mongoose.connect(uri, { dbName });
}
