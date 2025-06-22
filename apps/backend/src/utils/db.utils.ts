import logger from "@/utils/logger.utils";
import mongoose, { ConnectOptions, Connection } from "mongoose";

interface MongooseCache {
  conn: Connection | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  //? To prevent redeclaration errors in hot-reloading dev environments
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || {
  conn: null,
  promise: null,
};

global.mongooseCache = cached;

async function connectToDatabase(DATABASE_URI: string): Promise<Connection> {
  if (!DATABASE_URI) {
    throw new Error("Please define DATABASE_URI in environment variables");
  }
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const options: ConnectOptions = {
      bufferCommands: true,
      maxPoolSize: 10,
    };

    cached.promise = mongoose.connect(DATABASE_URI, options);
  }

  try {
    const mongooseInstance = await cached.promise;
    cached.conn = mongooseInstance.connection;
    logger.info(`MongoDB connected: ${cached.conn.name}`);
    return cached.conn;
  } catch (err) {
    logger.error(err);
    cached.promise = null;
    throw new Error("Database connection failed");
  }
}

export default connectToDatabase;
