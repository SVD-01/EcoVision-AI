import { Router } from "express";
import { authController, userController } from "../controllers";
import { registerValidation, loginValidation, otpValidation } from "../validations";
import { authenticate, authRateLimiter } from "../middleware";

export const authRouter = Router();

authRouter.post("/register", authRateLimiter, registerValidation, authController.register);
authRouter.post("/login", authRateLimiter, loginValidation, authController.login);
authRouter.post("/verify-otp", authRateLimiter, otpValidation, authController.verifyOtp);
authRouter.post("/refresh-token", authController.refreshToken);
authRouter.post("/logout", authController.logout);

export const userRouter = Router();

userRouter.get("/profile", authenticate, userController.getProfile);
userRouter.patch("/profile", authenticate, userController.updateProfile);
userRouter.get("/leaderboard", userController.getLeaderboard);
