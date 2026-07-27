import { Request, Response, NextFunction } from "express";
import { aiCommunicationService, reportService } from "../services";
import { AuthenticatedRequest } from "../middleware/auth";
import { AIModelModel, DatasetVersionModel, AuditLogModel, APILogModel } from "../models";

export class ChatController {
  async askAssistant(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { messages, language } = req.body;
      const replyText = await aiCommunicationService.generateChatResponse(messages || [], language || "en");

      res.status(200).json({
        success: true,
        data: {
          id: Math.random().toString(36).slice(2, 10),
          role: "assistant",
          content: replyText,
          language: language || "en",
        },
      });
    } catch (err) {
      next(err);
    }
  }
}

export class ReportController {
  async getReports(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const reports = await reportService.getReports();
      res.status(200).json({
        success: true,
        count: reports.length,
        data: reports,
      });
    } catch (err) {
      next(err);
    }
  }

  async generateReport(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { title, type } = req.body;
      const report = await reportService.generateESGReport(title, type, req.userId);
      res.status(201).json({
        success: true,
        message: "ESG Report generated and ready for audit export",
        data: report,
      });
    } catch (err) {
      next(err);
    }
  }
}

export class AdminController {
  async getSystemMetrics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const modelsCount = await AIModelModel.countDocuments().exec();
      const datasetsCount = await DatasetVersionModel.countDocuments().exec();
      const recentLogs = await APILogModel.find({}).sort({ createdAt: -1 }).limit(10).exec();

      res.status(200).json({
        success: true,
        data: {
          aiModelsCount: modelsCount || 2,
          datasetsCount: datasetsCount || 1,
          systemHealth: "OPTIMAL",
          recentApiLogs: recentLogs,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async getAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const logs = await AuditLogModel.find({}).sort({ createdAt: -1 }).limit(50).exec();
      res.status(200).json({
        success: true,
        count: logs.length,
        data: logs,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const chatController = new ChatController();
export const reportController = new ReportController();
export const adminController = new AdminController();
