import Apple from "next-auth/providers/apple";

export const appleProvider: any = Apple({
  clientId: process.env.APPLE_CLIENT_ID!,
  clientSecret: process.env.APPLE_CLIENT_SECRET!,
});
