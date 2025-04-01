import mongoose from "mongoose";
import dotenv from "dotenv";
import { log } from "./vite";

// Load environment variables
dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://rkr29581:SJbXwOi9d5CREOS0@cluster0.6c21gtp.mongodb.net/donation_platform?retryWrites=true&w=majority&appName=Cluster0";

// MongoDB connection options 
// Modern MongoDB driver (v4+) no longer needs useNewUrlParser or useUnifiedTopology
const MONGOOSE_OPTIONS: mongoose.ConnectOptions = {
  serverSelectionTimeoutMS: 5000, // Timeout for selecting a MongoDB server
  connectTimeoutMS: 5000, // Timeout for initial connection
  socketTimeoutMS: 5000, // Timeout for operations
};

// Global cache for connection reuse
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

let cached: MongooseCache = (global as any).mongoose || { conn: null, promise: null };
(global as any).mongoose = cached; // Ensure the cache persists

async function connectToDatabase() {
  if (cached.conn) {
    log("🔄 Using existing MongoDB connection");
    return cached.conn;
  }

  if (!cached.promise) {
    log("📡 Connecting to MongoDB...");

    mongoose.set("strictQuery", true);

    try {
      cached.promise = mongoose.connect(MONGODB_URI, MONGOOSE_OPTIONS);
      cached.conn = await cached.promise;
      log("✅ MongoDB connection established successfully");
    } catch (error: any) {
      log(`❌ MongoDB connection failed: ${error.message}`, "error");
      cached.conn = null;
    }
  }

  return cached.conn;
}

export default connectToDatabase;
