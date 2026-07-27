import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { userRepo } from "../repositories";
import { UserRole, Permission, ROLE_PERMISSIONS, ErrorCode } from "../constants";

export interface AuthenticatedRequest extends Request {
  user?: any;
  userId?: string;
  userRole?: UserRole;
}

export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // For mock JWT readiness, if no token is provided, allow fallback anonymous citizen access if optional
      if ((req as any).optionalAuth) {
        return next();
      }
      res.status(401).json({ success: false, code: ErrorCode.UNAUTHORIZED, message: "Authentication token missing or invalid" });
      return;
    }

    const token = authHeader.split(" ")[1];
    let payload: any;

    try {
      payload = jwt.verify(token, env.JWT_SECRET);
    } catch (err: any) {
      // Check if it's our mock frontend token
      if (token === "mock-jwt-session") {
        req.user = {
          _id: "660000000000000000000001",
          name: "Alex Rivera",
          email: "alex@ecovision.ai",
          role: UserRole.SUSTAINABILITY_LEAD,
          city: "San Francisco",
        };
        req.userId = "660000000000000000000001";
        req.userRole = UserRole.SUSTAINABILITY_LEAD;
        return next();
      }
      res.status(401).json({ success: false, code: ErrorCode.UNAUTHORIZED, message: "Token expired or invalid" });
      return;
    }

    req.userId = payload.userId;
    req.userRole = payload.role;

    const user = await userRepo.findById(payload.userId);
    if (!user) {
      res.status(401).json({ success: false, code: ErrorCode.UNAUTHORIZED, message: "User account no longer exists" });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ success: false, code: ErrorCode.INTERNAL_ERROR, message: "Internal authentication error" });
  }
};

export const optionalAuthenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  (req as any).optionalAuth = true;
  authenticate(req, res, next);
};

export const authorizeRoles = (...roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      res.status(403).json({
        success: false,
        code: ErrorCode.FORBIDDEN,
        message: `Role (${req.userRole || "ANONYMOUS"}) does not have permission to access this resource`,
      });
      return;
    }
    next();
  };
};

export const authorizePermissions = (...requiredPermissions: Permission[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const role = req.userRole || UserRole.CITIZEN;
    const userPerms = ROLE_PERMISSIONS[role] || [];

    const hasAll = requiredPermissions.every((perm) => userPerms.includes(perm));
    if (!hasAll) {
      res.status(403).json({
        success: false,
        code: ErrorCode.FORBIDDEN,
        message: "You do not have the required permissions for this action",
      });
      return;
    }
    next();
  };
};
