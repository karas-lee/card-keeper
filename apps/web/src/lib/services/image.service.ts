import sharp from "sharp";
import { LIMITS } from "@cardkeeper/shared-constants";
import { uploadToS3 } from "@/lib/storage/s3-client";

export class ImageService {
  static async processAndUpload(
    buffer: Buffer,
    userId: string,
    filename: string
  ): Promise<{ imageUrl: string; thumbnailUrl: string }> {
    const timestamp = Date.now();
    const baseKey = `cards/${userId}/${timestamp}`;

    // Process original - resize if too large, convert HEIC to JPEG
    const processed = await sharp(buffer)
      .resize(LIMITS.ORIGINAL_MAX_DIMENSION, LIMITS.ORIGINAL_MAX_DIMENSION, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: 85 })
      .toBuffer();

    // Generate thumbnail
    const thumbnail = await sharp(buffer)
      .resize(LIMITS.THUMBNAIL_SIZE, LIMITS.THUMBNAIL_SIZE, {
        fit: "cover",
      })
      .jpeg({ quality: 70 })
      .toBuffer();

    // Upload both
    const [imageUrl, thumbnailUrl] = await Promise.all([
      uploadToS3(`${baseKey}/original.jpg`, processed, "image/jpeg"),
      uploadToS3(`${baseKey}/thumbnail.jpg`, thumbnail, "image/jpeg"),
    ]);

    return { imageUrl, thumbnailUrl };
  }
}
