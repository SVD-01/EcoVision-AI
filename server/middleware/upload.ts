import multer from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";
import { OperationalError } from "./errorHandler";
import { ErrorCode } from "../constants";

// Ensure local upload directory exists
const uploadDir = path.resolve(process.cwd(), "server/uploads/temp");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// We use memory storage so buffers can be easily processed by AI Vision or uploaded to AWS S3/Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|webp|heic/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new OperationalError("Only image files (JPG, PNG, WEBP, HEIC) are allowed", 400, ErrorCode.VALIDATION_ERROR) as any);
};

export const uploadImage = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit
  },
  fileFilter,
});
