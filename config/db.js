import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config(); 

const db = async () => {
  const uri = process.env.MONGODB_URI; 

  console.log("🔍 MONGO_URI:", uri); // Debug

  if (!uri || !uri.startsWith("mongodb")) {
    console.error('❌ Invalid MONGO_URI. Make sure it starts with "mongodb://" or "mongodb+srv://".');
    process.exit(1);
  }

  mongoose.connection.on('connected', () =>
    console.log("✅ Connected to MongoDB")
  );

  mongoose.connection.on('error', (err) =>
    console.error("❌ MongoDB connection error:", err)
  );

  try {
    await mongoose.connect(uri);
  } catch (err) {
    console.error("❌ Initial MongoDB connection failed:", err);
    process.exit(1);
  }
};

export default db;
