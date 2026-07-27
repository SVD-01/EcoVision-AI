import { Router } from "express";
import {
  gamificationController,
  facilityController,
  chatController,
  reportController,
  adminController,
} from "../controllers";
import { optionalAuthenticate, authenticate, authorizeRoles, telemetryValidation } from "../middleware";
import { UserRole } from "../constants";

export const gamificationRouter = Router();
gamificationRouter.get("/summary", optionalAuthenticate, gamificationController.getSummary);
gamificationRouter.post("/complete-challenge", optionalAuthenticate, gamificationController.completeChallenge);

export const facilityRouter = Router();
facilityRouter.get("/centers", facilityController.getCenters);
facilityRouter.get("/smart-bins", facilityController.getSmartBins);
facilityRouter.post("/smart-bins/telemetry", telemetryValidation, facilityController.updateBinTelemetry);

export const chatRouter = Router();
chatRouter.post("/", optionalAuthenticate, chatController.askAssistant);

export const reportRouter = Router();
reportRouter.get("/", reportController.getReports);
reportRouter.post("/generate", optionalAuthenticate, reportController.generateReport);

export const adminRouter = Router();
adminRouter.use(authenticate, authorizeRoles(UserRole.SUPER_ADMIN, UserRole.FACILITY_MANAGER));
adminRouter.get("/metrics", adminController.getSystemMetrics);
adminRouter.get("/audit-logs", adminController.getAuditLogs);
