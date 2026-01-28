import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { VerifyEmailContent } from "./verify-email-content";

export default function VerifyEmailPage() {
  return (
    <div className="space-y-6 text-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold">이메일 인증</h2>
      </div>
      <Suspense
        fallback={
          <div className="flex flex-col items-center gap-3 py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            <p className="text-sm text-gray-500">로딩 중...</p>
          </div>
        }
      >
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
