import { describe, it, expect, vi, beforeEach } from "vitest";
import { ImageService } from "@/lib/services/image.service";

vi.mock("sharp", () => {
  const chain = {
    resize: vi.fn().mockReturnThis(),
    jpeg: vi.fn().mockReturnThis(),
    toBuffer: vi.fn().mockResolvedValue(Buffer.from("processed")),
  };
  return { default: vi.fn(() => chain) };
});

vi.mock("@/lib/storage/s3-client", () => ({
  uploadToS3: vi.fn().mockResolvedValue("https://s3.example.com/image.jpg"),
}));

describe("ImageService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("processAndUpload", () => {
    it("should return imageUrl and thumbnailUrl", async () => {
      const buffer = Buffer.from("fake-image");
      const result = await ImageService.processAndUpload(
        buffer,
        "user-1",
        "photo.jpg",
      );

      expect(result).toHaveProperty("imageUrl");
      expect(result).toHaveProperty("thumbnailUrl");
      expect(result.imageUrl).toBe("https://s3.example.com/image.jpg");
      expect(result.thumbnailUrl).toBe("https://s3.example.com/image.jpg");
    });

    it("should call sharp resize for both original and thumbnail", async () => {
      const sharp = (await import("sharp")).default;
      const buffer = Buffer.from("fake-image");

      await ImageService.processAndUpload(buffer, "user-1", "photo.jpg");

      // sharp is called twice: once for original, once for thumbnail
      expect(sharp).toHaveBeenCalledTimes(2);
      expect(sharp).toHaveBeenCalledWith(buffer);

      const mockChain = vi.mocked(sharp)(buffer);
      expect(mockChain.resize).toHaveBeenCalled();
      expect(mockChain.jpeg).toHaveBeenCalled();
      expect(mockChain.toBuffer).toHaveBeenCalled();
    });

    it("should upload both images to S3", async () => {
      const { uploadToS3 } = await import("@/lib/storage/s3-client");
      const buffer = Buffer.from("fake-image");

      await ImageService.processAndUpload(buffer, "user-1", "photo.jpg");

      // Two uploads: original + thumbnail
      expect(uploadToS3).toHaveBeenCalledTimes(2);
      expect(uploadToS3).toHaveBeenCalledWith(
        expect.stringContaining("original.jpg"),
        expect.any(Buffer),
        "image/jpeg",
      );
      expect(uploadToS3).toHaveBeenCalledWith(
        expect.stringContaining("thumbnail.jpg"),
        expect.any(Buffer),
        "image/jpeg",
      );
    });
  });
});
