import { z } from "zod";

const MAX_IMAGE_LENGTH = 2 * 1024 * 1024; // ~2MB base64

const ALLOWED_IMAGE_PREFIXES = [
  "data:image/jpeg",
  "data:image/png",
  "data:image/webp",
  "data:image/gif",
];

function isAllowedImageDataUrl(val: string): boolean {
  return val === "" || ALLOWED_IMAGE_PREFIXES.some((p) => val.startsWith(p));
}

const imageField = z
  .string()
  .max(MAX_IMAGE_LENGTH, "Image is too large (max ~2MB)")
  .refine(isAllowedImageDataUrl, "Image must be a JPEG, PNG, WebP, or GIF data URL")
  .optional()
  .default("");

export const createPostSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Post content is required")
    .max(2000, "Post content must be 2000 characters or less"),
  image: imageField,
});

const optionalImageField = z
  .string()
  .max(MAX_IMAGE_LENGTH, "Image is too large (max ~2MB)")
  .refine(isAllowedImageDataUrl, "Image must be a JPEG, PNG, WebP, or GIF data URL")
  .optional();

export const updatePostSchema = z
  .object({
    content: z
      .string()
      .trim()
      .min(1, "Post content is required")
      .max(2000, "Post content must be 2000 characters or less")
      .optional(),
    image: optionalImageField,
  })
  .refine(
    (data) => data.content !== undefined || data.image !== undefined,
    "At least one field must be provided"
  );
