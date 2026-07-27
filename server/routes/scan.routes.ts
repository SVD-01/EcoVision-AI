import { Router } from "express";
import { scanController, analyticsController } from "../controllers";
import { optionalAuthenticate, uploadImage, auditLogger } from "../middleware";

export const scanRouter = Router();

scanRouter.post(
  "/upload",
  optionalAuthenticate,
  uploadImage.single("image"),
  auditLogger("Scanner", "UPLOAD_SCAN"),
  scanController.uploadScan
);

scanRouter.post(
  "/live",
  optionalAuthenticate,
  auditLogger("Scanner", "LIVE_CAMERA_FRAME"),
  scanController.liveCameraFrame
);

scanRouter.get("/history", optionalAuthenticate, scanController.getHistory);
scanRouter.get("/:id", scanController.getScanById);
scanRouter.get("/:id/report", scanController.downloadReport);

export const analyticsRouter = Router();

analyticsRouter.get("/summary", analyticsController.getDashboardSummary);
