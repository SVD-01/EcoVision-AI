import { Router, Request, Response } from "express";
import mongoose from "mongoose";
import { authRouter, userRouter } from "./auth.routes";
import { scanRouter, analyticsRouter } from "./scan.routes";
import { gamificationRouter, facilityRouter, chatRouter, reportRouter, adminRouter } from "./facility.routes";

export const apiRouter = Router();

// Health Check & Readiness Endpoints (for Kubernetes / Docker / Cloud Load Balancers)
apiRouter.get("/health", (req: Request, res: Response) => {
  const dbStatus = mongoose.connection.readyState === 1 ? "CONNECTED" : "DISCONNECTED_OR_FALLBACK";
  res.status(200).json({
    status: "UP",
    timestamp: new Date().toISOString(),
    service: "EcoVision AI Backend",
    database: dbStatus,
    memoryUsageMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
  });
});

apiRouter.get("/ready", (req: Request, res: Response) => {
  res.status(200).send("READY");
});

// Feature API Routes
apiRouter.use("/auth", authRouter);
apiRouter.use("/users", userRouter);
apiRouter.use("/scans", scanRouter);
apiRouter.use("/analytics", analyticsRouter);
apiRouter.use("/gamification", gamificationRouter);
apiRouter.use("/facilities", facilityRouter);
apiRouter.use("/chat", chatRouter);
apiRouter.use("/reports", reportRouter);
apiRouter.use("/admin", adminRouter);
