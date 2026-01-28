import Kakao from "next-auth/providers/kakao";

export const kakaoProvider: any = Kakao({
  clientId: process.env.KAKAO_CLIENT_ID!,
  clientSecret: process.env.KAKAO_CLIENT_SECRET!,
});
