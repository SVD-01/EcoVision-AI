export type WasteType = "plastic" | "paper" | "organic" | "metal" | "glass" | "e-waste";

export type WasteCategory = {
  id: WasteType;
  label: string;
  tone: string;
  description: string;
  recommendation: string;
  impact: string;
};

export type BoundingBox = {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  confidence: number;
};

export type ScanResult = {
  id: string;
  fileName: string;
  category: WasteCategory;
  confidence: number;
  createdAt: string;
  boundingBoxes: BoundingBox[];
  recommendations: string[];
  impact: {
    carbonKg: number;
    waterLiters: number;
    trees: number;
    points: number;
  };
};

export type RecyclingCenter = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  distanceKm: number;
  rating: number;
  openNow: boolean;
  accepted: WasteType[];
};

export type AnalyticsPoint = {
  label: string;
  scans: number;
  carbon: number;
  water: number;
  points: number;
};

export type DistributionPoint = {
  name: string;
  value: number;
  color: string;
};

export type AnalyticsSummary = {
  ecoScore: number;
  sustainabilityScore: number;
  carbonSaved: number;
  waterConserved: number;
  treesProtected: number;
  weekly: AnalyticsPoint[];
  monthly: AnalyticsPoint[];
  distribution: DistributionPoint[];
  timeline: Array<{ id: string; title: string; meta: string; impact: string }>;
};

export type Achievement = {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  progress: number;
};

export type Challenge = {
  id: string;
  title: string;
  reward: number;
  progress: number;
  goal: number;
};

export type LeaderboardEntry = {
  rank: number;
  name: string;
  points: number;
  city: string;
};

export type GamificationSummary = {
  points: number;
  xp: number;
  level: number;
  streak: number;
  nextLevelXp: number;
  achievements: Achievement[];
  daily: Challenge[];
  weekly: Challenge[];
  leaderboard: LeaderboardEntry[];
};

export type AssistantMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  language: string;
};