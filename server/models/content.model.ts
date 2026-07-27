import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  userId?: mongoose.Types.ObjectId; // null for broadcast
  title: string;
  message: string;
  type: "alert" | "reward" | "challenge" | "system";
  isRead: boolean;
  actionUrl?: string;
}

const NotificationSchema = new Schema<INotification>({
  userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ["alert", "reward", "challenge", "system"], default: "system" },
  isRead: { type: Boolean, default: false },
  actionUrl: { type: String },
}, { timestamps: true });

export const NotificationModel = mongoose.model<INotification>("Notification", NotificationSchema);

export interface IArticle extends Document {
  title: string;
  slug: string;
  content: string;
  category: string;
  author: string;
  published: boolean;
  views: number;
}

const ArticleSchema = new Schema<IArticle>({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  category: { type: String, default: "Circularity" },
  author: { type: String, default: "EcoVision Editorial" },
  published: { type: Boolean, default: true },
  views: { type: Number, default: 0 },
}, { timestamps: true });

export const ArticleModel = mongoose.model<IArticle>("Article", ArticleSchema);

export interface IFAQ extends Document {
  question: string;
  answer: string;
  category: string;
  order: number;
}

const FAQSchema = new Schema<IFAQ>({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  category: { type: String, default: "General" },
  order: { type: Number, default: 1 },
}, { timestamps: true });

export const FAQModel = mongoose.model<IFAQ>("FAQ", FAQSchema);

export interface IFeedback extends Document {
  userId?: mongoose.Types.ObjectId;
  category: string;
  message: string;
  rating: number;
  status: "open" | "reviewed" | "resolved";
}

const FeedbackSchema = new Schema<IFeedback>({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  category: { type: String, default: "UI/UX" },
  message: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, default: 5 },
  status: { type: String, enum: ["open", "reviewed", "resolved"], default: "open" },
}, { timestamps: true });

export const FeedbackModel = mongoose.model<IFeedback>("Feedback", FeedbackSchema);

export interface IChatHistory extends Document {
  userId?: mongoose.Types.ObjectId;
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  language: string;
  metadata?: any;
}

const ChatHistorySchema = new Schema<IChatHistory>({
  userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
  sessionId: { type: String, required: true, index: true },
  role: { type: String, enum: ["user", "assistant"], required: true },
  content: { type: String, required: true },
  language: { type: String, default: "en" },
  metadata: { type: Schema.Types.Mixed },
}, { timestamps: true });

export const ChatHistoryModel = mongoose.model<IChatHistory>("ChatHistory", ChatHistorySchema);
