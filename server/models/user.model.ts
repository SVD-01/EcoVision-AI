import mongoose, { Schema, Document } from "mongoose";
import { UserRole, Permission } from "../constants";

export interface IRole extends Document {
  name: UserRole;
  description: string;
  permissions: Permission[];
}

const RoleSchema = new Schema<IRole>({
  name: { type: String, enum: Object.values(UserRole), required: true, unique: true },
  description: { type: String, required: true },
  permissions: [{ type: String, enum: Object.values(Permission) }],
}, { timestamps: true });

export const RoleModel = mongoose.model<IRole>("Role", RoleSchema);

export interface IPermissionDoc extends Document {
  code: Permission;
  module: string;
  description: string;
}

const PermissionSchema = new Schema<IPermissionDoc>({
  code: { type: String, enum: Object.values(Permission), required: true, unique: true },
  module: { type: String, required: true },
  description: { type: String, required: true },
}, { timestamps: true });

export const PermissionModel = mongoose.model<IPermissionDoc>("Permission", PermissionSchema);

export interface ISession extends Document {
  userId: mongoose.Types.ObjectId;
  refreshToken: string;
  ipAddress: string;
  userAgent: string;
  isValid: boolean;
  expiresAt: Date;
}

const SessionSchema = new Schema<ISession>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  refreshToken: { type: String, required: true, unique: true },
  ipAddress: { type: String, default: "" },
  userAgent: { type: String, default: "" },
  isValid: { type: Boolean, default: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
}, { timestamps: true });

export const SessionModel = mongoose.model<ISession>("Session", SessionSchema);

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  city: string;
  avatar?: string;
  ecoPoints: number;
  xp: number;
  level: number;
  streak: number;
  lastActiveDate?: Date;
  isVerified: boolean;
  otpCode?: string;
  otpExpires?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  preferences: {
    scans: boolean;
    challenges: boolean;
    reports: boolean;
    voice: boolean;
  };
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  password: { type: String, select: false },
  role: { type: String, enum: Object.values(UserRole), default: UserRole.CITIZEN, index: true },
  city: { type: String, default: "San Francisco" },
  avatar: { type: String },
  ecoPoints: { type: Number, default: 0, index: true },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  streak: { type: Number, default: 0 },
  lastActiveDate: { type: Date, default: Date.now },
  isVerified: { type: Boolean, default: true },
  otpCode: { type: String, select: false },
  otpExpires: { type: Date, select: false },
  resetPasswordToken: { type: String, select: false },
  resetPasswordExpires: { type: Date, select: false },
  preferences: {
    scans: { type: Boolean, default: true },
    challenges: { type: Boolean, default: true },
    reports: { type: Boolean, default: false },
    voice: { type: Boolean, default: true },
  },
}, { timestamps: true });

UserSchema.index({ ecoPoints: -1 });

export const UserModel = mongoose.model<IUser>("User", UserSchema);
