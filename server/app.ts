import express, { Express } from "express";
import path from "path";
import fs from "fs";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env";
import { swaggerSpec } from "./config/swagger";
import {
  securityHeaders,
  corsMiddleware,
  apiRateLimiter,
  sanitizeInput,
  apiRequestLogger,
  errorHandler,
  notFoundHandler,
} from "./middleware";
import { apiRouter } from "./routes";

export const createApp = (): Express => {
  const app = express();

  // 1. Security & Parsing Middleware
  app.use(securityHeaders);
  app.use(corsMiddleware);
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));
  app.use(sanitizeInput);

  // 2. Logging & Rate Limiting
  app.use(apiRequestLogger);
  app.use(env.API_PREFIX, apiRateLimiter);

  // 3. Swagger OpenAPI Documentation
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, { customSiteTitle: "EcoVision AI API Docs" }));
  app.get("/api/docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  // 4. Mount Enterprise RESTful API Routes
  app.use(env.API_PREFIX, apiRouter);

  // 5. Serve Built Frontend in Production / Docker / Standalone Mode
  const distPath = path.resolve(process.cwd(), "dist");
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get("*", (req, res, next) => {
      if (req.originalUrl.startsWith(env.API_PREFIX)) {
        return next();
      }
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // 6. Error Handling Pipeline
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
