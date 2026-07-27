import mongoose, { Schema, Document } from "mongoose";

export interface IAchievement extends Document {
  id: string;
  name: string;
  description: string;
  icon: string;
  goal: number;
  category: string;
  rewardPoints: number;
}

const AchievementSchema = new Schema<IAchievement>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, default: "Medal" },
  goal: { type: Number, required: true },
  category: { type: String, default: "scans" },
  rewardPoints: { type: Number, default: 100 },
}, { timestamps: true });

export const AchievementModel = mongoose.model<IAchievement>("Achievement", AchievementSchema);

export interface IReward extends Document {
  title: string;
  description: string;
  pointsCost: number;
  category: string;
  stock: number;
  isAvailable: boolean;
  codePrefix?: string;
}

const RewardSchema = new Schema<IReward>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  pointsCost: { type: Number, required: true, index: true },
  category: { type: String, default: "perks" },
  stock: { type: Number, default: 100 },
  isAvailable: { type: Boolean, default: true },
  codePrefix: { type: String, default: "ECO-" },
}, { timestamps: true });

export const RewardModel = mongoose.model<IReward>("Reward", RewardSchema);

export interface IDailyChallenge extends Document {
  id: string;
  title: string;
  reward: number;
  goal: number;
  type: "daily" | "weekly";
  expiresAt: Date;
  active: boolean;
}

const DailyChallengeSchema = new Schema<IDailyChallenge>({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  reward: { type: Number, required: true },
  goal: { type: Number, required: true },
  type: { type: String, enum: ["daily", "weekly"], default: "daily", index: true },
  expiresAt: { type: Date, required: true },
  active: { type: Boolean, default: true },
}, { timestamps: true });

export const DailyChallengeModel = mongoose.model<IDailyChallenge>("DailyChallenge", DailyChallengeSchema);

export interface ILeaderboard extends Document {
  period: "daily" | "weekly" | "monthly" | "all_time";
  rankings: Array<{
    rank: number;
    userId: mongoose.Types.ObjectId;
    name: string;
    city: string;
    points: number;
  }>;
  calculatedAt: Date;
}

const LeaderboardSchema = new Schema<ILeaderboard>({
  period: { type: String, enum: ["daily", "weekly", "monthly", "all_time"], required: true, index: true },
  rankings: [{
    rank: { type: Number, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true },
    city: { type: String, default: "Global" },
    points: { type: Number, required: true },
  }],
  calculatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export const LeaderboardModel = mongoose.model<ILeaderboard>("Leaderboard", LeaderboardSchema);
