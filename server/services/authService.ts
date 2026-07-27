import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { userRepo } from "../repositories";
import { SessionModel, IUser } from "../models";
import { UserRole, ErrorCode } from "../constants";

export class AuthService {
  async register(data: { name: string; email: string; password?: string; city?: string; role?: UserRole }) {
    const existing = await userRepo.findByEmail(data.email);
    if (existing) {
      throw { status: 409, code: ErrorCode.CONFLICT, message: "Email is already registered" };
    }

    const hashedPassword = data.password ? await bcrypt.hash(data.password, env.BCRYPT_SALT_ROUNDS) : undefined;
    const user = await userRepo.create({
      name: data.name,
      email: data.email.toLowerCase().trim(),
      password: hashedPassword,
      city: data.city || "San Francisco",
      role: data.role || UserRole.CITIZEN,
      ecoPoints: 100, // Welcome bonus
      xp: 50,
      level: 1,
      streak: 1,
      isVerified: true,
    });

    const tokens = await this.generateTokens(user);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  async login(email: string, password?: string) {
    const user = await userRepo.findByEmail(email);
    if (!user) {
      // Create user on the fly if password is not required (mock JWT interface readiness)
      if (!password) {
        return this.register({ name: email.split("@")[0] || "Eco Citizen", email });
      }
      throw { status: 401, code: ErrorCode.UNAUTHORIZED, message: "Invalid email or password" };
    }

    if (password && user.password) {
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        throw { status: 401, code: ErrorCode.UNAUTHORIZED, message: "Invalid email or password" };
      }
    }

    // Update streak and last active date
    const now = new Date();
    const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : now;
    const diffDays = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 3600 * 24));
    if (diffDays === 1) {
      user.streak = (user.streak || 0) + 1;
    } else if (diffDays > 1) {
      user.streak = 1;
    }
    user.lastActiveDate = now;
    await user.save();

    const tokens = await this.generateTokens(user);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  async verifyOtp(email: string, otp: string) {
    const user = await userRepo.findByEmail(email);
    if (!user) {
      throw { status: 404, code: ErrorCode.NOT_FOUND, message: "User not found" };
    }
    // Simulate valid OTP code check
    if (otp !== "123456" && user.otpCode !== otp) {
      throw { status: 400, code: ErrorCode.VALIDATION_ERROR, message: "Invalid verification code" };
    }
    user.isVerified = true;
    user.otpCode = undefined;
    await user.save();
    return { verified: true, user: this.sanitizeUser(user) };
  }

  async refreshToken(refreshToken: string, ipAddress = "") {
    try {
      const payload = jwt.verify(refreshToken, env.REFRESH_TOKEN_SECRET) as { userId: string };
      const session = await SessionModel.findOne({ refreshToken, isValid: true }).exec();
      if (!session) {
        throw { status: 401, code: ErrorCode.UNAUTHORIZED, message: "Refresh token revoked or invalid" };
      }

      const user = await userRepo.findById(payload.userId);
      if (!user) {
        throw { status: 404, code: ErrorCode.NOT_FOUND, message: "User not found" };
      }

      // Rotate refresh token
      await SessionModel.deleteOne({ _id: session._id }).exec();
      return this.generateTokens(user, ipAddress);
    } catch (error: any) {
      throw { status: 401, code: ErrorCode.UNAUTHORIZED, message: "Invalid refresh token" };
    }
  }

  async logout(refreshToken?: string) {
    if (refreshToken) {
      await SessionModel.deleteOne({ refreshToken }).exec();
    }
    return { success: true };
  }

  private async generateTokens(user: IUser, ipAddress = "") {
    const accessToken = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN as any }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      env.REFRESH_TOKEN_SECRET,
      { expiresIn: env.REFRESH_TOKEN_EXPIRES_IN as any }
    );

    // Store session in MongoDB
    await SessionModel.create({
      userId: user._id,
      refreshToken,
      ipAddress,
      isValid: true,
      expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000), // 7 days
    });

    return { accessToken, refreshToken };
  }

  private sanitizeUser(user: IUser) {
    const obj = user.toObject ? user.toObject() : user;
    delete obj.password;
    delete obj.otpCode;
    delete obj.resetPasswordToken;
    return obj;
  }
}

export const authService = new AuthService();
