import { Request, Response, NextFunction } from "express";
import { validationResult, body, param, query } from "express-validator";
import { ErrorCode } from "../constants";

export const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      code: ErrorCode.VALIDATION_ERROR,
      message: errors.array().map((err: any) => `${err.path}: ${err.msg}`).join(", "),
      errors: errors.array(),
    });
    return;
  }
  next();
};

export const registerValidation = [
  body("name").trim().isLength({ min: 2, max: 100 }).withMessage("Name must be between 2 and 100 characters"),
  body("email").isEmail().normalizeEmail().withMessage("Provide a valid email address"),
  body("password").optional().isLength({ min: 8 }).withMessage("Password must be at least 8 characters long"),
  validate,
];

export const loginValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Provide a valid email address"),
  body("password").optional().isString(),
  validate,
];

export const otpValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Provide a valid email address"),
  body("otp").isLength({ min: 6, max: 6 }).withMessage("OTP must be exactly 6 digits"),
  validate,
];

export const scanValidation = [
  body("fileName").optional().isString().withMessage("File name must be a string"),
  body("source").optional().isIn(["upload", "webcam", "smart_bin", "edge"]).withMessage("Invalid scan source"),
  body("lat").optional().isFloat({ min: -90, max: 90 }).withMessage("Invalid latitude"),
  body("lng").optional().isFloat({ min: -180, max: 180 }).withMessage("Invalid longitude"),
  validate,
];

export const centerGeoValidation = [
  query("lat").optional().isFloat({ min: -90, max: 90 }).withMessage("Invalid latitude"),
  query("lng").optional().isFloat({ min: -180, max: 180 }).withMessage("Invalid longitude"),
  query("radius").optional().isFloat({ min: 1, max: 100 }).withMessage("Radius must be between 1 and 100 km"),
  validate,
];

export const telemetryValidation = [
  body("binCode").isString().notEmpty().withMessage("Bin code is required"),
  body("fillLevel").isInt({ min: 0, max: 100 }).withMessage("Fill level must be between 0 and 100"),
  body("batteryPercentage").optional().isInt({ min: 0, max: 100 }),
  validate,
];
