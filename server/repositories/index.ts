import { BaseRepository } from "./baseRepository";
import {
  UserModel, IUser,
  ScanHistoryModel, IScanHistory,
  AIPredictionModel, IAIPrediction,
  RecyclingCenterModel, IRecyclingCenter,
  SmartBinModel, ISmartBin,
  LeaderboardModel, ILeaderboard,
  ReportModel, IReport,
  AuditLogModel, IAuditLog,
  ChatHistoryModel, IChatHistory,
} from "../models";

export class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super(UserModel, "user");
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return this.model.findOne({ email: email.toLowerCase().trim() }).select("+password").exec();
  }

  async getTopScorers(limit = 10): Promise<IUser[]> {
    return this.model.find({}).sort({ ecoPoints: -1 }).limit(limit).exec();
  }
}

export class ScanRepository extends BaseRepository<IScanHistory> {
  constructor() {
    super(ScanHistoryModel, "scan");
  }

  async getRecentScans(userId?: string, limit = 20): Promise<IScanHistory[]> {
    const filter = userId ? { userId } : {};
    return this.model.find(filter).sort({ createdAt: -1 }).limit(limit).exec();
  }
}

export class CenterRepository extends BaseRepository<IRecyclingCenter> {
  constructor() {
    super(RecyclingCenterModel, "center");
  }

  async findNearby(lng: number, lat: number, maxDistanceKm = 10): Promise<IRecyclingCenter[]> {
    return this.model.find({
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [lng, lat] },
          $maxDistance: maxDistanceKm * 1000,
        },
      },
    }).exec();
  }
}

export const userRepo = new UserRepository();
export const scanRepo = new ScanRepository();
export const centerRepo = new CenterRepository();
export const aiPredictionRepo = new BaseRepository<IAIPrediction>(AIPredictionModel, "ai_pred");
export const smartBinRepo = new BaseRepository<ISmartBin>(SmartBinModel, "smart_bin");
export const leaderboardRepo = new BaseRepository<ILeaderboard>(LeaderboardModel, "leaderboard");
export const reportRepo = new BaseRepository<IReport>(ReportModel, "report");
export const auditRepo = new BaseRepository<IAuditLog>(AuditLogModel, "audit");
export const chatRepo = new BaseRepository<IChatHistory>(ChatHistoryModel, "chat");
