import mongoose from "mongoose";
import { aiCommunicationService } from "./aiCommunicationService";
import { scanRepo, aiPredictionRepo, userRepo, auditRepo } from "../repositories";
import { CarbonRecordModel, EnvironmentalStatModel } from "../models";
import { WasteTypeEnum, SocketEvent } from "../constants";
import { socketServer } from "../sockets";

export class ScanService {
  async processScan(data: {
    userId?: string;
    fileName: string;
    fileUrl?: string;
    mimeType?: string;
    fileBuffer?: Buffer;
    source?: string;
    lat?: number;
    lng?: number;
  }) {
    // 1. Analyze image using AI Communication Service
    const prediction = await aiCommunicationService.analyzeImage(data.fileName, data.mimeType, data.fileBuffer);

    // 2. Save scan history in MongoDB
    const scan = await scanRepo.create({
      userId: data.userId ? new mongoose.Types.ObjectId(data.userId) : undefined,
      fileName: data.fileName,
      fileUrl: data.fileUrl || `/uploads/${data.fileName}`,
      category: {
        id: prediction.category,
        label: prediction.label,
        description: `Identified as ${prediction.label} with high optical confidence.`,
        recommendation: prediction.recommendations[0] || "Recycle responsibly.",
        impact: `Avoided ${prediction.impact.carbonKg} kg CO2 equivalent.`,
        tone: "from-cyan-300 to-emerald-300",
      },
      confidence: prediction.confidence,
      boundingBoxes: prediction.boundingBoxes,
      recommendations: prediction.recommendations,
      impact: prediction.impact,
      source: data.source || "upload",
      location: data.lat && data.lng ? { lat: data.lat, lng: data.lng } : undefined,
    });

    // 3. Save AI model prediction audit log
    await aiPredictionRepo.create({
      scanId: scan._id as any,
      modelName: "ecovision-vision-v2",
      modelVersion: "2.4.0",
      predictedCategory: prediction.category,
      confidence: prediction.confidence,
      boundingBoxes: prediction.boundingBoxes,
      processingTimeMs: prediction.processingTimeMs,
    });

    // 4. Save Carbon Calculation record
    await CarbonRecordModel.create({
      userId: data.userId ? new mongoose.Types.ObjectId(data.userId) : undefined,
      scanId: scan._id as any,
      materialType: prediction.category,
      weightGrams: 50,
      carbonAvoidedKg: prediction.impact.carbonKg,
      calculationMethod: "EPA-WARM-v15",
    });

    // 5. Update user Eco Points and XP if authenticated
    if (data.userId) {
      const user = await userRepo.findById(data.userId);
      if (user) {
        user.ecoPoints = (user.ecoPoints || 0) + prediction.impact.points;
        user.xp = (user.xp || 0) + prediction.impact.points * 2;
        
        // Level up check
        const nextLevelXp = user.level * 500;
        if (user.xp >= nextLevelXp) {
          user.level += 1;
        }
        await user.save();
      }
    }

    // 6. Update Environmental Statistics aggregation
    await this.updateDailyStats(prediction.category, prediction.impact);

    // 7. Emit Socket.IO live scan event
    socketServer.emitToAll(SocketEvent.SCAN_COMPLETED, {
      scanId: scan._id,
      category: prediction.label,
      confidence: prediction.confidence,
      points: prediction.impact.points,
      timestamp: new Date().toISOString(),
    });

    return scan;
  }

  async getHistory(userId?: string, limit = 20) {
    return scanRepo.getRecentScans(userId, limit);
  }

  async getScanById(id: string) {
    return scanRepo.findById(id);
  }

  private async updateDailyStats(category: WasteTypeEnum, impact: { carbonKg: number; waterLiters: number; points: number }) {
    const today = new Date().toISOString().slice(0, 10);
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const label = dayNames[new Date().getDay()];

    await EnvironmentalStatModel.findOneAndUpdate(
      { periodLabel: label },
      {
        $inc: {
          scans: 1,
          carbonKg: impact.carbonKg,
          waterLiters: impact.waterLiters,
          pointsAwarded: impact.points,
          [`distribution.${category}`]: 1,
        },
        $setOnInsert: { date: new Date() },
      },
      { upsert: true, new: true }
    ).exec();
  }
}

export const scanService = new ScanService();
