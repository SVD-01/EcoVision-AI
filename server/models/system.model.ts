import mongoose, { Schema, Document } from "mongoose";

export interface IAPILog extends Document {
  method: string;
  path: string;
  statusCode: number;
  responseTimeMs: number;
  ipAddress: string;
  userAgent: string;
  userId?: mongoose.Types.ObjectId;
}

const APILogSchema = new Schema<IAPILog>({
  method: { type: String, required: true },
  path: { type: String, required: true },
  statusCode: { type: Number, required: true },
  responseTimeMs: { type: Number, required: true },
  ipAddress: { type: String, default: "" },
  userAgent: { type: String, default: "" },
  userId: { type: Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

APILogSchema.index({ createdAt: -1 }, { expireAfterSeconds: 2592000 }); // 30 day TTL

export const APILogModel = mongoose.model<IAPILog>("APILog", APILogSchema);

export interface IAuditLog extends Document {
  action: string;
  module: string;
  performedBy?: mongoose.Types.ObjectId;
  targetId?: string;
  details: any;
  ipAddress: string;
}

const AuditLogSchema = new Schema<IAuditLog>({
  action: { type: String, required: true, index: true },
  module: { type: String, required: true, index: true },
  performedBy: { type: Schema.Types.ObjectId, ref: "User" },
  targetId: { type: String },
  details: { type: Schema.Types.Mixed },
  ipAddress: { type: String, default: "" },
}, { timestamps: true });

export const AuditLogModel = mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
