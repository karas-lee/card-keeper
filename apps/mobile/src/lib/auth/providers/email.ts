import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../firebase";

export async function emailSignIn(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function emailSignUp(email: string, password: string) {
  return createUserWithEmailAndPassword(auth, email, password);
}
