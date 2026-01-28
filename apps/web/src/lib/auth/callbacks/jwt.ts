import type { JWT } from "next-auth/jwt";
import type { User } from "next-auth";

export async function jwtCallback({
  token,
  user,
  account,
}: {
  token: JWT;
  user?: User;
  account?: { provider: string } | null;
}) {
  if (user) {
    token.userId = user.id;
    token.email = user.email;
    token.name = user.name;
    token.picture = user.image;
  }

  if (account) {
    token.provider = account.provider;
  }

  return token;
}
