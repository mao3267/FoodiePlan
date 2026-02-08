import mongoose, { Schema, type Model } from "mongoose";
import type { IPost } from "@/lib/types";

const postSchema = new Schema<IPost>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, trim: true, maxlength: 2000 },
    image: { type: String, default: "" },
  },
  { timestamps: true }
);

postSchema.index({ userId: 1, createdAt: -1 });

export const Post: Model<IPost> =
  mongoose.models.Post || mongoose.model<IPost>("Post", postSchema);
