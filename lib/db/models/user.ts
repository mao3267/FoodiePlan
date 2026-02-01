import mongoose, { Schema, type Model } from "mongoose";
import type { IUser } from "@/lib/types";

const userSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true },
  bio: { type: String, default: "" },
  image: { type: String },
  emailVerified: { type: Date, default: null },
});

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);
