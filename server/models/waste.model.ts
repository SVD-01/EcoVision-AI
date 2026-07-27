import mongoose, { Schema, Document } from "mongoose";
import { WasteTypeEnum } from "../constants";

export interface IWasteCategory extends Document {
  id: WasteTypeEnum;
  label: string;
  tone: string;
  description: string;
  recommendation: string;
  impact: string;
  streamColor: string;
  recyclable: boolean;
  compostable: boolean;
  hazardous: boolean;
}

const WasteCategorySchema = new Schema<IWasteCategory>({
  id: { type: String, enum: Object.values(WasteTypeEnum), required: true, unique: true },
  label: { type: String, required: true },
  tone: { type: String, required: true },
  description: { type: String, required: true },
  recommendation: { type: String, required: true },
  impact: { type: String, required: true },
  streamColor: { type: String, default: "#34d399" },
  recyclable: { type: Boolean, default: true },
  compostable: { type: Boolean, default: false },
  hazardous: { type: Boolean, default: false },
}, { timestamps: true });

export const WasteCategoryModel = mongoose.model<IWasteCategory>("WasteCategory", WasteCategorySchema);

export interface IBoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  confidence: number;
}

export interface IAIPrediction extends Document {
  scanId: mongoose.Types.ObjectId;
  modelName: string;
  modelVersion: string;
  rawResponse: any;
  predictedCategory: WasteTypeEnum;
  confidence: number;
  boundingBoxes: IBoundingBox[];
  processingTimeMs: number;
}

const AIPredictionSchema = new Schema<IAIPrediction>({
  scanId: { type: Schema.Types.ObjectId, ref: "ScanHistory", required: true, index: true },
  modelName: { type: String, default: "ecovision-vision-v2" },
  modelVersion: { type: String, default: "2.4.0" },
  rawResponse: { type: Schema.Types.Mixed },
  predictedCategory: { type: String, enum: Object.values(WasteTypeEnum), required: true, index: true },
  confidence: { type: Number, required: true },
  boundingBoxes: [{
    x: Number,
    y: Number,
    width: Number,
    height: Number,
    label: String,
    confidence: Number,
  }],
  processingTimeMs: { type: Number, default: 0 },
}, { timestamps: true });

export const AIPredictionModel = mongoose.model<IAIPrediction>("AIPrediction", AIPredictionSchema);

export interface IScanHistory extends Document {
  userId?: mongoose.Types.ObjectId;
  fileName: string;
  fileUrl?: string;
  category: {
    id: WasteTypeEnum;
    label: string;
    description: string;
    recommendation: string;
    impact: string;
    tone?: string;
  };
  confidence: number;
  boundingBoxes: IBoundingBox[];
  recommendations: string[];
  impact: {
    carbonKg: number;
    waterLiters: number;
    trees: number;
    points: number;
  };
  source: string; // 'webcam' | 'upload' | 'smart_bin' | 'edge'
  location?: {
    lat: number;
    lng: number;
    building?: string;
  };
}

const ScanHistorySchema = new Schema<IScanHistory>({
  userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
  fileName: { type: String, required: true },
  fileUrl: { type: String },
  category: {
    id: { type: String, enum: Object.values(WasteTypeEnum), required: true },
    label: { type: String, required: true },
    description: { type: String, required: true },
    recommendation: { type: String, required: true },
    impact: { type: String, required: true },
    tone: { type: String },
  },
  confidence: { type: Number, required: true },
  boundingBoxes: [{
    x: Number,
    y: Number,
    width: Number,
    height: Number,
    label: String,
    confidence: Number,
  }],
  recommendations: [{ type: String }],
  impact: {
    carbonKg: { type: Number, default: 0 },
    waterLiters: { type: Number, default: 0 },
    trees: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
  },
  source: { type: String, default: "upload" },
  location: {
    lat: { type: Number },
    lng: { type: Number },
    building: { type: String },
  },
}, { timestamps: true });

ScanHistorySchema.index({ createdAt: -1 });

export const ScanHistoryModel = mongoose.model<IScanHistory>("ScanHistory", ScanHistorySchema);

export interface IAIModel extends Document {
  name: string;
  version: string;
  framework: string;
  accuracy: number;
  status: "active" | "staging" | "archived";
  endpointUrl?: string;
  weightsUrl?: string;
  parametersCount: number;
}

const AIModelSchema = new Schema<IAIModel>({
  name: { type: String, required: true, unique: true },
  version: { type: String, required: true },
  framework: { type: String, default: "PyTorch/ONNX" },
  accuracy: { type: Number, required: true },
  status: { type: String, enum: ["active", "staging", "archived"], default: "staging", index: true },
  endpointUrl: { type: String },
  weightsUrl: { type: String },
  parametersCount: { type: Number, default: 85000000 },
}, { timestamps: true });

export const AIModelModel = mongoose.model<IAIModel>("AIModel", AIModelSchema);

export interface IDatasetVersion extends Document {
  versionCode: string;
  description: string;
  sampleCount: number;
  categoriesCount: Record<string, number>;
  s3BucketPath: string;
  isVerified: boolean;
}

const DatasetVersionSchema = new Schema<IDatasetVersion>({
  versionCode: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  sampleCount: { type: Number, required: true },
  categoriesCount: { type: Schema.Types.Mixed, default: {} },
  s3BucketPath: { type: String, required: true },
  isVerified: { type: Boolean, default: true },
}, { timestamps: true });

export const DatasetVersionModel = mongoose.model<IDatasetVersion>("DatasetVersion", DatasetVersionSchema);
