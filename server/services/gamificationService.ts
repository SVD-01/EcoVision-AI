import { AchievementModel, DailyChallengeModel, LeaderboardModel, UserModel } from "../models";
import { userRepo } from "../repositories";
import { SocketEvent } from "../constants";
import { socketServer } from "../sockets";

export class GamificationService {
  async getSummary(userId?: string) {
    let user = userId ? await userRepo.findById(userId) : null;
    const points = user ? user.ecoPoints : 12840;
    const xp = user ? user.xp : 7420;
    const level = user ? user.level : 18;
    const streak = user ? user.streak : 21;

    const achievements = await AchievementModel.find({}).exec();
    const daily = await DailyChallengeModel.find({ type: "daily", active: true }).exec();
    const weekly = await DailyChallengeModel.find({ type: "weekly", active: true }).exec();
    const topScorers = await userRepo.getTopScorers(4);

    const leaderboard = topScorers.length > 0
      ? topScorers.map((u, i) => ({
          rank: i + 1,
          name: u.name,
          points: u.ecoPoints,
          city: u.city || "Global",
        }))
      : [
          { rank: 1, name: "Maya Chen", points: 18320, city: "Singapore" },
          { rank: 2, name: "EcoVision Labs", points: 16980, city: "San Francisco" },
          { rank: 3, name: "Ravi Kumar", points: 15870, city: "Bengaluru" },
          { rank: 4, name: "Ava Martin", points: 14240, city: "Paris" },
        ];

    return {
      points,
      xp,
      level,
      streak,
      nextLevelXp: level * 500,
      achievements: achievements.length > 0 ? achievements.map((a) => ({
        id: a.id,
        name: a.name,
        description: a.description,
        unlocked: xp >= a.goal,
        progress: Math.min(100, Math.round((xp / a.goal) * 100)),
      })) : [
        { id: "a-1", name: "Zero Waste Pilot", description: "Complete 100 verified scans.", unlocked: true, progress: 100 },
        { id: "a-2", name: "Carbon Guardian", description: "Save 250 kg CO2 equivalent.", unlocked: true, progress: 100 },
        { id: "a-3", name: "E-Waste Defender", description: "Route 15 electronics safely.", unlocked: false, progress: 72 },
        { id: "a-4", name: "Compost Catalyst", description: "Log organics for 14 days.", unlocked: false, progress: 64 },
      ],
      daily: daily.length > 0 ? daily.map((d) => ({
        id: d.id,
        title: d.title,
        reward: d.reward,
        progress: 1,
        goal: d.goal,
      })) : [
        { id: "d-1", title: "Scan 5 items before lunch", reward: 90, progress: 3, goal: 5 },
        { id: "d-2", title: "Route one item to a nearby center", reward: 120, progress: 0, goal: 1 },
        { id: "d-3", title: "Answer the circularity quiz", reward: 80, progress: 1, goal: 1 },
      ],
      weekly: weekly.length > 0 ? weekly.map((w) => ({
        id: w.id,
        title: w.title,
        reward: w.reward,
        progress: 10,
        goal: w.goal,
      })) : [
        { id: "w-1", title: "Reduce landfill contamination by 18%", reward: 700, progress: 61, goal: 100 },
        { id: "w-2", title: "Team scan sprint", reward: 950, progress: 420, goal: 600 },
      ],
      leaderboard,
    };
  }

  async completeChallenge(userId: string, challengeId: string) {
    const challenge = await DailyChallengeModel.findOne({ id: challengeId }).exec();
    const reward = challenge ? challenge.reward : 100;

    const user = await userRepo.findById(userId);
    if (user) {
      user.ecoPoints += reward;
      user.xp += reward * 2;
      await user.save();
    }

    // Emit live leaderboard update
    const topScorers = await userRepo.getTopScorers(4);
    if (topScorers.length > 0) {
      socketServer.emitToAll(SocketEvent.LEADERBOARD_UPDATE, {
        leaderboard: topScorers.map((u, i) => ({ rank: i + 1, name: u.name, points: u.ecoPoints, city: u.city })),
      });
    }

    return { success: true, reward, ecoPoints: user?.ecoPoints || 12840 };
  }
}

export const gamificationService = new GamificationService();
