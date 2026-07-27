import { Request, Response, NextFunction } from "express";
import { gamificationService, facilityService, reportService } from "../services";
import { AuthenticatedRequest } from "../middleware/auth";
import { OperationalError } from "../middleware/errorHandler";
import { ErrorCode } from "../constants";

export class GamificationController {
  async getSummary(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const summary = await gamificationService.getSummary(req.userId);
      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (err) {
      next(err);
    }
  }

  async completeChallenge(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId || "660000000000000000000001";
      const { challengeId } = req.body;
      if (!challengeId) {
        throw new OperationalError("Challenge ID is required", 400, ErrorCode.VALIDATION_ERROR);
      }
      const result = await gamificationService.completeChallenge(userId, challengeId);
      res.status(200).json({
        success: true,
        message: "Challenge completed! Reward points claimed.",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}

export class FacilityController {
  async getCenters(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { lat, lng, radius } = req.query;
      const centers = await facilityService.getRecyclingCenters(
        lat ? parseFloat(lat as string) : undefined,
        lng ? parseFloat(lng as string) : undefined,
        radius ? parseFloat(radius as string) : 15
      );
      res.status(200).json({
        success: true,
        count: centers.length,
        data: centers,
      });
    } catch (err) {
      next(err);
    }
  }

  async getSmartBins(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { building } = req.query;
      const bins = await facilityService.getSmartBins(building as string);
      res.status(200).json({
        success: true,
        count: bins.length,
        data: bins,
      });
    } catch (err) {
      next(err);
    }
  }

  async updateBinTelemetry(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { binCode, fillLevel, batteryPercentage } = req.body;
      const result = await facilityService.updateBinTelemetry(binCode, fillLevel, batteryPercentage);
      res.status(200).json({
        success: true,
        message: "Bin telemetry updated and broadcast via WebSocket",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const gamificationController = new GamificationController();
export const facilityController = new FacilityController();
