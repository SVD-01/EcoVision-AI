import mongoose, { Schema, Document } from "mongoose";
import { WasteTypeEnum } from "../constants";

export interface IRecyclingCenter extends Document {
  id: string;
  name: string;
  lat: number;
  lng: number;
  location: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  address: string;
  distanceKm: number;
  rating: number;
  openNow: boolean;
  accepted: WasteTypeEnum[];
  contactPhone?: string;
  contactEmail?: string;
}

const RecyclingCenterSchema = new Schema<IRecyclingCenter>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true, index: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true }, // [lng, lat]
  },
  address: { type: String, required: true },
  distanceKm: { type: Number, default: 0 },
  rating: { type: Number, default: 4.8 },
  openNow: { type: Boolean, default: true },
  accepted: [{ type: String, enum: Object.values(WasteTypeEnum) }],
  contactPhone: { type: String },
  contactEmail: { type: String },
}, { timestamps: true });

RecyclingCenterSchema.index({ location: "2dsphere" });

export const RecyclingCenterModel = mongoose.model<IRecyclingCenter>("RecyclingCenter", RecyclingCenterSchema);

export interface ISmartBin extends Document {
  binCode: string;
  name: string;
  building: string;
  floor: string;
  acceptedStream: WasteTypeEnum;
  fillLevel: number; // 0 to 100
  status: string; // 'healthy' | 'alert' | 'full'
  batteryPercentage: number;
  lastEmptiedAt?: Date;
  location: {
    type: "Point";
    coordinates: [number, number];
  };
}

const SmartBinSchema = new Schema<ISmartBin>({
  binCode: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  building: { type: String, default: "Main Campus" },
  floor: { type: String, default: "1" },
  acceptedStream: { type: String, enum: Object.values(WasteTypeEnum), required: true },
  fillLevel: { type: Number, default: 0, min: 0, max: 100 },
  status: { type: String, default: "healthy" },
  batteryPercentage: { type: Number, default: 100 },
  lastEmptiedAt: { type: Date, default: Date.now },
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], default: [-122.4194, 37.7749] },
  },
}, { timestamps: true });

export const SmartBinModel = mongoose.model<ISmartBin>("SmartBin", SmartBinSchema);

export interface IQRCode extends Document {
  code: string;
  binId: mongoose.Types.ObjectId;
  targetStream: WasteTypeEnum;
  rewardMultiplier: number;
  isActive: boolean;
  scanCount: number;
}

const QRCodeSchema = new Schema<IQRCode>({
  code: { type: String, required: true, unique: true },
  binId: { type: Schema.Types.ObjectId, ref: "SmartBin", required: true, index: true },
  targetStream: { type: String, enum: Object.values(WasteTypeEnum), required: true },
  rewardMultiplier: { type: Number, default: 1.0 },
  isActive: { type: Boolean, default: true },
  scanCount: { type: Number, default: 0 },
}, { timestamps: true });

export const QRCodeModel = mongoose.model<IQRCode>("QRCode", QRCodeSchema);
