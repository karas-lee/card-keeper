import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  type User,
} from "firebase/auth";
import { auth } from "./firebase";
import { useAuthStore } from "../../stores/auth.store";
import { apiFetch } from "../api";

async function syncWithBackend(firebaseUser: User) {
  const idToken = await firebaseUser.getIdToken();

  const response = await apiFetch("/auth/me", {
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });

  const user = response.data;
  useAuthStore.getState().setAuth(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
    },
    idToken,
    ""
  );
}

export async function signInWithEmail(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  await syncWithBackend(credential.user);
  return credential.user;
}

export async function signUpWithEmail(
  email: string,
  password: string,
  name: string
) {
  const credential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  await updateProfile(credential.user, { displayName: name });
  await syncWithBackend(credential.user);
  return credential.user;
}

export async function signOut() {
  await firebaseSignOut(auth);
  useAuthStore.getState().logout();
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email);
}

export async function refreshIdToken(): Promise<string | null> {
  const currentUser = auth.currentUser;
  if (!currentUser) return null;
  return currentUser.getIdToken(true);
}
