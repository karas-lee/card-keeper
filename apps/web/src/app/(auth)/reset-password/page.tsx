import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "비밀번호 재설정",
};

export default function ResetPasswordPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">비밀번호 재설정</h2>
        <p className="mt-1 text-sm text-gray-500">
          새 비밀번호를 입력해주세요
        </p>
      </div>
      <Suspense fallback={<div className="text-center text-gray-400">로딩 중...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
