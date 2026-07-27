import { Request, Response, NextFunction } from "express";
import { scanService, analyticsService } from "../services";
import { AuthenticatedRequest } from "../middleware/auth";
import { OperationalError } from "../middleware/errorHandler";
import { ErrorCode } from "../constants";

export class ScanController {
  async uploadScan(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const file = req.file;
      const fileName = file ? file.originalname : req.body.fileName || "uploaded-waste-item.jpg";
      const mimeType = file ? file.mimetype : "image/jpeg";
      const fileBuffer = file ? file.buffer : undefined;
      const { source, lat, lng } = req.body;

      const result = await scanService.processScan({
        userId: req.userId,
        fileName,
        mimeType,
        fileBuffer,
        source: source || "upload",
        lat: lat ? parseFloat(lat) : undefined,
        lng: lng ? parseFloat(lng) : undefined,
      });

      res.status(201).json({
        success: true,
        message: "AI Scan processed successfully",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async liveCameraFrame(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const fileName = req.body.fileName || "live-camera-frame.jpg";
      const { lat, lng } = req.body;

      const result = await scanService.processScan({
        userId: req.userId,
        fileName,
        source: "webcam",
        lat: lat ? parseFloat(lat) : undefined,
        lng: lng ? parseFloat(lng) : undefined,
      });

      res.status(200).json({
        success: true,
        message: "Live camera frame analyzed",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async getHistory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const history = await scanService.getHistory(req.userId, limit);

      res.status(200).json({
        success: true,
        count: history.length,
        data: history,
      });
    } catch (err) {
      next(err);
    }
  }

  async getScanById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const scan = await scanService.getScanById(req.params.id);
      if (!scan) {
        throw new OperationalError("Scan record not found", 404, ErrorCode.NOT_FOUND);
      }
      res.status(200).json({
        success: true,
        data: scan,
      });
    } catch (err) {
      next(err);
    }
  }

  async downloadReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const scan = await scanService.getScanById(req.params.id);
      if (!scan) {
        throw new OperationalError("Scan record not found", 404, ErrorCode.NOT_FOUND);
      }

      const text = `EcoVision AI Waste Report\n\nScan ID: ${scan._id}\nFile: ${scan.fileName}\nCategory: ${scan.category.label}\nConfidence: ${scan.confidence}%\nCarbon Avoided: ${scan.impact.carbonKg} kg CO2\nWater Conserved: ${scan.impact.waterLiters} L\nPoints Earned: ${scan.impact.points}\n\nRecommendations:\n${scan.recommendations.map((r) => `- ${r}`).join("\n")}\n`;

      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="scan-${scan._id}-report.txt"`);
      res.status(200).send(text);
    } catch (err) {
      next(err);
    }
  }
}

export class AnalyticsController {
  async getDashboardSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const summary = await analyticsService.getDashboardSummary();
      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const scanController = new ScanController();
export const analyticsController = new AnalyticsController();
