import http from "http";
import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { connectDB } from "./config/db";
import { socketServer } from "./sockets";
import { cronScheduler } from "./jobs/cron";

export const startServer = async () => {
  const app = createApp();
  const server = http.createServer(app);

  // 1. Initialize Real-Time Socket.IO Engine
  socketServer.init(server);

  // 2. Connect to MongoDB Mongoose Cluster
  await connectDB();

  // 3. Initialize Cron Job Scheduler
  cronScheduler.init();

  // 4. Start Server Listening
  const PORT = env.PORT || 5000;
  server.listen(PORT, () => {
    logger.info(`========================================================`);
    logger.info(`  EcoVision AI Enterprise Backend Running on Port ${PORT}`);
    logger.info(`  REST API Prefix: http://localhost:${PORT}${env.API_PREFIX}`);
    logger.info(`  Swagger Docs:    http://localhost:${PORT}/api/docs`);
    logger.info(`  Environment:     ${env.NODE_ENV}`);
    logger.info(`========================================================`);
  });

  // 5. Graceful Shutdown Handler for Kubernetes / Docker
  const gracefulShutdown = (signal: string) => {
    logger.warn(`Received ${signal}. Starting graceful shutdown...`);
    server.close(() => {
      logger.info("HTTP Server closed.");
      process.exit(0);
    });
    // Force shutdown after 10s if connections hang
    setTimeout(() => {
      logger.error("Could not close connections in time, forcing exit.");
      process.exit(1);
    }, 10000);
  };

  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("unhandledRejection", (reason: any) => {
    logger.error("Unhandled Rejection:", reason?.stack || reason);
  });
  process.on("uncaughtException", (error: Error) => {
    logger.error("Uncaught Exception:", error.stack || error.message);
    process.exit(1);
  });

  return server;
};

if (process.env.NODE_ENV !== "test") {
  startServer();
}
