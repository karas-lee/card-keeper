import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fs from "fs/promises";
import path from "path";

const USE_LOCAL_STORAGE = !process.env.AWS_ACCESS_KEY_ID;

const s3Client = USE_LOCAL_STORAGE ? null : new S3Client({
  region: process.env.AWS_REGION || "ap-northeast-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.AWS_S3_BUCKET || "cardkeeper-uploads";
const LOCAL_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

async function uploadLocal(key: string, body: Buffer): Promise<string> {
  const filePath = path.join(LOCAL_UPLOAD_DIR, key);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, body);
  return `/uploads/${key}`;
}

async function deleteLocal(key: string): Promise<void> {
  const filePath = path.join(LOCAL_UPLOAD_DIR, key);
  await fs.unlink(filePath).catch(() => {});
}

export async function uploadToS3(key: string, body: Buffer, contentType: string): Promise<string> {
  if (USE_LOCAL_STORAGE) {
    return uploadLocal(key, body);
  }
  await s3Client!.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: body,
    ContentType: contentType,
  }));
  return `https://${BUCKET}.s3.${process.env.AWS_REGION || "ap-northeast-2"}.amazonaws.com/${key}`;
}

export async function deleteFromS3(key: string): Promise<void> {
  if (USE_LOCAL_STORAGE) {
    return deleteLocal(key);
  }
  await s3Client!.send(new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: key,
  }));
}

export async function getPresignedUrl(key: string, expiresIn = 3600): Promise<string> {
  if (USE_LOCAL_STORAGE) {
    return `/uploads/${key}`;
  }
  return getSignedUrl(s3Client!, new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  }), { expiresIn });
}
