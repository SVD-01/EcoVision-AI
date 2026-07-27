import mongoose from "mongoose";
import { env } from "./env";
import { logger } from "./logger";

const MONGO_OPTIONS: mongoose.ConnectOptions = {
  maxPoolSize: 50,
  minPoolSize: 10,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 10000,
  family: 4,
};

export const connectDB = async (retries = 5, delay = 3000): Promise<void> => {
  while (retries > 0) {
    try {
      // Set mongoose strictQuery to prevent query selector injection
      mongoose.set("strictQuery", true);
      
      const connection = await mongoose.connect(env.MONGO_URI, MONGO_OPTIONS);
      logger.info(`MongoDB Connected: ${connection.connection.host}/${connection.connection.name}`);
      return;
    } catch (error: any) {
      retries -= 1;
      logger.warn(`MongoDB Connection Failed (${error.message}). Retries left: ${retries}`);
      if (retries === 0) {
        logger.error("Could not connect to MongoDB after maximum retries. Running in fallback/in-memory mode.");
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

mongoose.connection.on("disconnected", () => {
  logger.warn("MongoDB connection lost");
});

mongoose.connection.on("reconnected", () => {
  logger.info("MongoDB reconnected successfully");
});
