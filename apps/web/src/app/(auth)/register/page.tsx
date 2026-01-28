import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";
import { SocialLoginButtons } from "@/components/auth/social-login-buttons";

export const metadata: Metadata = {
  title: "회원가입",
};

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">회원가입</h2>
        <p className="mt-1 text-sm text-gray-500">새 계정을 만드세요</p>
      </div>
      <SocialLoginButtons />
      <RegisterForm />
    </div>
  );
}
