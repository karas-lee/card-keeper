"use client";

import { useState } from "react";
import { CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth.store";

interface EmailVerifyStatusProps {
  verified: boolean;
}

export function EmailVerifyStatus({ verified }: EmailVerifyStatusProps) {
  const [isResending, setIsResending] = useState(false);
  const accessToken = useAuthStore((s) => s.accessToken);

  const handleResend = async () => {
    setIsResending(true);
    try {
      const res = await fetch("/api/v1/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || "전송에 실패했습니다");
      }
      toast.success("인증 이메일을 재전송했습니다");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "전송에 실패했습니다"
      );
    } finally {
      setIsResending(false);
    }
  };

  if (verified) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-green-50 p-4">
        <CheckCircle className="h-5 w-5 text-green-600" />
        <p className="text-sm font-medium text-green-700">
          이메일이 인증되었습니다
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-lg bg-yellow-50 p-4">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-yellow-600" />
        <p className="text-sm font-medium text-yellow-700">
          이메일 인증이 필요합니다
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleResend}
        disabled={isResending}
      >
        {isResending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            전송 중...
          </>
        ) : (
          "인증 이메일 재전송"
        )}
      </Button>
    </div>
  );
}
