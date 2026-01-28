import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { SocialLoginButtons } from "@/components/auth/social-login-buttons";

export const metadata: Metadata = {
  title: "로그인",
};

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">로그인</h2>
        <p className="mt-1 text-sm text-gray-500">계정에 로그인하세요</p>
      </div>
      <SocialLoginButtons />
      <LoginForm />
    </div>
  );
}
