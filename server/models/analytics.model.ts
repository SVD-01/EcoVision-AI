import mongoose, { Schema, Document } from "mongoose";

export interface IReport extends Document {
  title: string;
  type: "Executive" | "Operations" | "Model QA" | "Contamination" | "Impact Summary";
  date: string;
  generatedBy?: mongoose.Types.ObjectId;
  fileUrl?: string;
  metrics: {
    totalScans: number;
    carbonSavedKg: number;
    waterConservedL: number;
    treesProtected: number;
    ecoScoreAverage: number;
  };
  status: "ready" | "generating" | "failed";
}

const ReportSchema = new Schema<IReport>({
  title: { type: String, required: true },
  type: { type: String, required: true, index: true },
  date: { type: String, required: true },
  generatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  fileUrl: { type: String },
  metrics: {
    totalScans: { type: Number, default: 0 },
    carbonSavedKg: { type: Number, default: 0 },
    waterConservedL: { type: Number, default: 0 },
    treesProtected: { type: Number, default: 0 },
    ecoScoreAverage: { type: Number, default: 0 },
  },
  status: { type: String, enum: ["ready", "generating", "failed"], default: "ready" },
}, { timestamps: true });

export const ReportModel = mongoose.model<IReport>("Report", ReportSchema);

export interface IEnvironmentalStat extends Document {
  periodLabel: string; // e.g. "Mon", "Jan", "2026-W28"
  scans: number;
  carbonKg: number;
  waterLiters: number;
  pointsAwarded: number;
  distribution: Record<string, number>;
  date: Date;
}

const EnvironmentalStatSchema = new Schema<IEnvironmentalStat>({
  periodLabel: { type: String, required: true, index: true },
  scans: { type: Number, default: 0 },
  carbonKg: { type: Number, default: 0 },
  waterLiters: { type: Number, default: 0 },
  pointsAwarded: { type: Number, default: 0 },
  distribution: { type: Schema.Types.Mixed, default: {} },
  date: { type: Date, default: Date.now, index: true },
}, { timestamps: true });

export const EnvironmentalStatModel = mongoose.model<IEnvironmentalStat>("EnvironmentalStat", EnvironmentalStatSchema);

export interface ICarbonRecord extends Document {
  userId?: mongoose.Types.ObjectId;
  scanId?: mongoose.Types.ObjectId;
  materialType: string;
  weightGrams: number;
  carbonAvoidedKg: number;
  calculationMethod: string;
}

const CarbonRecordSchema = new Schema<ICarbonRecord>({
  userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
  scanId: { type: Schema.Types.ObjectId, ref: "ScanHistory" },
  materialType: { type: String, required: true },
  weightGrams: { type: Number, default: 50 },
  carbonAvoidedKg: { type: Number, required: true },
  calculationMethod: { type: String, default: "EPA-WARM-v15" },
}, { timestamps: true });

export const CarbonRecordModel = mongoose.model<ICarbonRecord>("CarbonRecord", CarbonRecordSchema);
