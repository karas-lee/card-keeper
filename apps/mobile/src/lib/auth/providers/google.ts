import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "../firebase";

export async function googleSignIn(idToken: string) {
  const credential = GoogleAuthProvider.credential(idToken);
  return signInWithCredential(auth, credential);
}
