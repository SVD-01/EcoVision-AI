import { Request, Response, NextFunction } from "express";
import { logger } from "../config/logger";
import { ErrorCode } from "../constants";
import { APILogModel } from "../models";

export class OperationalError extends Error {
  public status: number;
  public code: string;

  constructor(message: string, status = 500, code: string = ErrorCode.INTERNAL_ERROR) {
    super(message);
    this.status = status;
    this.code = code;
    Object.setPrototypeOf(this, OperationalError.prototype);
  }
}

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  const status = err.status || err.statusCode || 500;
  const code = err.code || ErrorCode.INTERNAL_ERROR;
  const message = err.message || "An unexpected internal error occurred";

  // Log error with Winston
  if (status >= 500) {
    logger.error(`[${req.method}] ${req.originalUrl} - Status ${status}: ${message}`, { stack: err.stack });
  } else {
    logger.warn(`[${req.method}] ${req.originalUrl} - Status ${status}: ${message}`);
  }

  // Asynchronously record failed API request in MongoDB APILogs
  APILogModel.create({
    method: req.method,
    path: req.originalUrl,
    statusCode: status,
    responseTimeMs: 0,
    ipAddress: req.ip || req.socket.remoteAddress || "",
    userAgent: req.get("user-agent") || "",
  }).catch(() => {
    // Ignore log write failure
  });

  res.status(status).json({
    success: false,
    code,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  res.status(404).json({
    success: false,
    code: ErrorCode.NOT_FOUND,
    message: `API endpoint [${req.method}] ${req.originalUrl} does not exist`,
  });
};
