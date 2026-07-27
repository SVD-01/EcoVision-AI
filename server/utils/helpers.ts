import nodemailer from "nodemailer";
import { env } from "../config/env";
import { logger } from "../config/logger";

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: env.SMTP_USER ? {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      } : undefined,
    });
  }

  async sendEmail(to: string, subject: string, htmlContent: string): Promise<boolean> {
    try {
      if (env.NODE_ENV === "test" || !env.SMTP_USER || env.SMTP_USER === "test_user") {
        logger.info(`[Mock Email Sent] To: ${to} | Subject: ${subject}`);
        return true;
      }
      await this.transporter.sendMail({
        from: `"${env.EMAIL_FROM}" <${env.EMAIL_FROM}>`,
        to,
        subject,
        html: htmlContent,
      });
      logger.info(`Email dispatched to ${to}`);
      return true;
    } catch (err: any) {
      logger.warn(`Email delivery failed to ${to}: ${err.message}`);
      return false;
    }
  }

  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    const subject = "Welcome to EcoVision AI – Circular Economy Platform";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #030712; color: #f8fafc; padding: 24px; border-radius: 16px;">
        <h1 style="color: #34d399;">Welcome to EcoVision AI, ${name}!</h1>
        <p style="color: #94a3b8; line-height: 1.6;">You are now connected to the AI-powered circular economy command center. Start scanning waste items, routing materials, and earning Eco Points.</p>
      </div>
    `;
    await this.sendEmail(to, subject, html);
  }
}

export const emailService = new EmailService();

export const calculateGeoDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
};
