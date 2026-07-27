import { Request, Response, NextFunction } from "express";
import { authService, gamificationService } from "../services";
import { AuthenticatedRequest } from "../middleware/auth";
import { userRepo } from "../repositories";
import { emailService } from "../utils/helpers";

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, password, city, role } = req.body;
      const result = await authService.register({ name, email, password, city, role });
      
      // Send welcome email asynchronously
      emailService.sendWelcomeEmail(email, name).catch(() => {});

      res.status(201).json({
        success: true,
        message: "Account created successfully",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.status(200).json({
        success: true,
        message: "Signed in successfully",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, otp } = req.body;
      const result = await authService.verifyOtp(email, otp);
      res.status(200).json({
        success: true,
        message: "OTP verified successfully",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const ip = req.ip || req.socket.remoteAddress || "";
      const result = await authService.refreshToken(refreshToken, ip);
      res.status(200).json({
        success: true,
        message: "Token refreshed successfully",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      await authService.logout(refreshToken);
      res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (err) {
      next(err);
    }
  }
}

export class UserController {
  async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId;
      const user = req.user || await userRepo.findById(userId!);
      const gameSummary = await gamificationService.getSummary(userId!);

      res.status(200).json({
        success: true,
        data: {
          ...user.toObject ? user.toObject() : user,
          gamification: {
            points: gameSummary.points,
            xp: gameSummary.xp,
            level: gameSummary.level,
            streak: gameSummary.streak,
            nextLevelXp: gameSummary.nextLevelXp,
          },
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const { name, city, avatar, preferences } = req.body;
      const update: any = {};
      if (name) update.name = name;
      if (city) update.city = city;
      if (avatar) update.avatar = avatar;
      if (preferences) update.preferences = preferences;

      let user: any;
      if (userId === "660000000000000000000001") {
        user = { ...req.user, ...update };
      } else {
        user = await userRepo.updateById(userId, update);
      }

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: user,
      });
    } catch (err) {
      next(err);
    }
  }

  async getLeaderboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const summary = await gamificationService.getSummary();
      res.status(200).json({
        success: true,
        data: summary.leaderboard,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
export const userController = new UserController();
