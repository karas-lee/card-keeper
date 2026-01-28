import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "비밀번호 찾기",
};

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">비밀번호 찾기</h2>
        <p className="mt-1 text-sm text-gray-500">
          가입한 이메일을 입력하시면 비밀번호 재설정 링크를 보내드립니다
        </p>
      </div>
      <ForgotPasswordForm />
    </div>
  );
}
