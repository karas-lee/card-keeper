import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "ap-northeast-2",
  credentials: process.env.AWS_ACCESS_KEY_ID ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  } : undefined,
});

const BUCKET = process.env.AWS_S3_BUCKET || "cardkeeper-uploads";

export async function generateUploadUrl(key: string, contentType: string, expiresIn = 600): Promise<string> {
  return getSignedUrl(s3Client, new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  }), { expiresIn });
}

export async function generateDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
  return getSignedUrl(s3Client, new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  }), { expiresIn });
}
