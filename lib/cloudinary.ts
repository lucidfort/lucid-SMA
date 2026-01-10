"use server";

import { v2 as cloudinary } from "cloudinary";
import { AppError } from "@/server/graphql/errors";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function deleteImage(publicId: string) {
  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    if (error instanceof Error) {
      throw new AppError(
        error.message ?? "Failed to delete image",
        "CLOUDINARY_ERROR",
      );
    }

    throw new AppError("Failed to delete image", "CLOUDINARY_ERROR");
  }
}
