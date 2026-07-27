import { Request, Response, NextFunction } from "express";
import { APILogModel, AuditLogModel } from "../models";
import { AuthenticatedRequest } from "./auth";

export const auditLogger = (moduleName: string, actionName: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const originalSend = res.send;

    res.send = function (body) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        AuditLogModel.create({
          action: actionName,
          module: moduleName,
          performedBy: req.userId as any,
          targetId: req.params.id || req.body?.id || "",
          details: {
            method: req.method,
            url: req.originalUrl,
            query: req.query,
            body: req.method !== "GET" ? req.body : undefined,
          },
          ipAddress: req.ip || req.socket.remoteAddress || "",
        }).catch(() => {
          // Ignore audit write failure
        });
      }
      return originalSend.apply(res, arguments as any);
    };

    next();
  };
};

export const apiRequestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    APILogModel.create({
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      responseTimeMs: duration,
      ipAddress: req.ip || req.socket.remoteAddress || "",
      userAgent: req.get("user-agent") || "",
      userId: (req as any).userId,
    }).catch(() => {
      // Ignore API log write failure
    });
  });
  next();
};
