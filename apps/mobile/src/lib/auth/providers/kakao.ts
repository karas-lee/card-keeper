import { OAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "../firebase";

export async function kakaoSignIn(accessToken: string) {
  const credential = new OAuthProvider("oidc.kakao").credential({
    idToken: accessToken,
  });
  return signInWithCredential(auth, credential);
}
