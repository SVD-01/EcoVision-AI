import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { Request, Response, NextFunction } from "express";
import { env } from "../config/env";
import { ErrorCode } from "../constants";

export const securityHeaders = helmet({
  contentSecurityPolicy: false, // Disabled for local Swagger & Vite static rendering
  crossOriginEmbedderPolicy: false,
});

export const corsMiddleware = cors({
  origin: "*", // Allow all origins for enterprise API flexibility & local dev
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  credentials: true,
});

export const apiRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    code: ErrorCode.RATE_LIMIT_EXCEEDED,
    message: "Too many requests from this IP, please try again after 15 minutes.",
  },
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 30, // 30 attempts per window
  message: {
    success: false,
    code: ErrorCode.RATE_LIMIT_EXCEEDED,
    message: "Too many authentication attempts, please try again later.",
  },
});

// Simple MongoDB injection and XSS sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction): void => {
  const sanitize = (obj: any): any => {
    if (obj instanceof Array) {
      return obj.map(sanitize);
    }
    if (obj !== null && typeof obj === "object") {
      return Object.keys(obj).reduce((acc: any, key) => {
        // Strip keys starting with $ or containing . to prevent NoSQL injection
        if (key.startsWith("$") || key.includes(".")) {
          return acc;
        }
        acc[key] = sanitize(obj[key]);
        return acc;
      }, {});
    }
    if (typeof obj === "string") {
      // Basic XSS tag stripping
      return obj.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
    }
    return obj;
  };

  if (req.body) req.body = sanitize(req.body);
  if (req.query) req.query = sanitize(req.query);
  if (req.params) req.params = sanitize(req.params);

  next();
};
