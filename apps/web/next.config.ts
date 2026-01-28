import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n.ts");

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.60"],
  serverExternalPackages: ["firebase-admin", "tesseract.js", "tesseract.js-core"],
  transpilePackages: [
    "@cardkeeper/shared-types",
    "@cardkeeper/shared-utils",
    "@cardkeeper/shared-constants",
    "@cardkeeper/api-client",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.cloudfront.net",
      },
      {
        protocol: "https",
        hostname: "*.s3.amazonaws.com",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
