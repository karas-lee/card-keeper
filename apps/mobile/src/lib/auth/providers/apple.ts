import { OAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "../firebase";

export async function appleSignIn(idToken: string, nonce: string) {
  const credential = new OAuthProvider("apple.com").credential({
    idToken,
    rawNonce: nonce,
  });
  return signInWithCredential(auth, credential);
}
