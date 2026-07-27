import cron from "node-cron";
import { logger } from "../config/logger";
import { DailyChallengeModel, LeaderboardModel, SessionModel, APILogModel } from "../models";
import { userRepo } from "../repositories";
import { SocketEvent } from "../constants";
import { socketServer } from "../sockets";

export class CronJobScheduler {
  init() {
    // 1. Midnight Daily Challenge Reset (Every day at 00:00)
    cron.schedule("0 0 * * *", async () => {
      logger.info("Executing Cron Job: Daily Challenge Reset");
      try {
        await DailyChallengeModel.updateMany({ type: "daily" }, { $set: { active: true } });
        logger.info("Daily challenges refreshed successfully");
      } catch (err: any) {
        logger.error("Failed to reset daily challenges:", err.message);
      }
    });

    // 2. Leaderboard Recalculation & Archiving (Every hour)
    cron.schedule("0 * * * *", async () => {
      logger.info("Executing Cron Job: Leaderboard Recalculation");
      try {
        const topUsers = await userRepo.getTopScorers(50);
        const rankings = topUsers.map((u, i) => ({
          rank: i + 1,
          userId: u._id,
          name: u.name,
          city: u.city || "Global",
          points: u.ecoPoints,
        }));

        await LeaderboardModel.findOneAndUpdate(
          { period: "all_time" },
          { rankings, calculatedAt: new Date() },
          { upsert: true, new: true }
        ).exec();

        socketServer.emitToAll(SocketEvent.LEADERBOARD_UPDATE, { leaderboard: rankings.slice(0, 10) });
      } catch (err: any) {
        logger.error("Failed to recalculate leaderboard:", err.message);
      }
    });

    // 3. Stale Session & Expired API Log Cleanup (Every Sunday at 03:00 AM)
    cron.schedule("0 3 * * 0", async () => {
      logger.info("Executing Cron Job: Stale Session Cleanup");
      try {
        const now = new Date();
        const sessionRes = await SessionModel.deleteMany({ expiresAt: { $lt: now } }).exec();
        const logRes = await APILogModel.deleteMany({ createdAt: { $lt: new Date(now.getTime() - 30 * 24 * 3600 * 1000) } }).exec();
        logger.info(`Cleanup complete: Removed ${sessionRes.deletedCount} expired sessions and ${logRes.deletedCount} old API logs`);
      } catch (err: any) {
        logger.error("Failed to execute cleanup job:", err.message);
      }
    });

    logger.info("Cron Job Scheduler initialized with background tasks");
  }
}

export const cronScheduler = new CronJobScheduler();
