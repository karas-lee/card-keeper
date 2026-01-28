import type { Session } from "next-auth";
import type { JWT } from "next-auth/jwt";

export async function sessionCallback({
  session,
  token,
}: {
  session: Session;
  token: JWT;
}) {
  if (session.user) {
    session.user.id = token.userId as string;
    session.user.email = token.email as string;
    session.user.name = token.name as string;
    session.user.image = token.picture as string | undefined;
  }

  return session;
}
