import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "5000", 10),
  API_PREFIX: process.env.API_PREFIX || "/api/v1",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
  
  // Database & Cache
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/ecovision_ai",
  REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
  
  // Security & Authentication
  JWT_SECRET: process.env.JWT_SECRET || "ecovision_super_secret_jwt_key_2026_enterprise",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "15m",
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || "ecovision_refresh_token_secret_key_2026",
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
  COOKIE_SECRET: process.env.COOKIE_SECRET || "ecovision_cookie_signer",
  BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS || "12", 10),
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10), // 15 min
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || "500", 10),

  // Storage Readiness (AWS S3 & Cloudinary)
  STORAGE_PROVIDER: process.env.STORAGE_PROVIDER || "local", // 'local' | 's3' | 'cloudinary'
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "",
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET || "ecovision-ai-uploads",
  AWS_REGION: process.env.AWS_REGION || "us-west-2",
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || "",
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || "",

  // Email Notification Readiness
  SMTP_HOST: process.env.SMTP_HOST || "smtp.mailtrap.io",
  SMTP_PORT: parseInt(process.env.SMTP_PORT || "2525", 10),
  SMTP_USER: process.env.SMTP_USER || "test_user",
  SMTP_PASS: process.env.SMTP_PASS || "test_pass",
  EMAIL_FROM: process.env.EMAIL_FROM || "no-reply@ecovision.ai",

  // AI Service Keys
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || "mock-openai-key",
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "mock-gemini-key",
};
