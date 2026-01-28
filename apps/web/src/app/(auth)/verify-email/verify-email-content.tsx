"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("유효하지 않은 인증 링크입니다.");
      return;
    }

    const verifyEmail = async () => {
      try {
        const res = await fetch("/api/v1/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error?.message || "이메일 인증에 실패했습니다");
        }

        setStatus("success");
        setMessage("이메일이 성공적으로 인증되었습니다.");
      } catch (error) {
        setStatus("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "이메일 인증에 실패했습니다."
        );
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <>
      {status === "loading" && (
        <div className="flex flex-col items-center gap-3 py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          <p className="text-sm text-gray-500">이메일을 인증하고 있습니다...</p>
        </div>
      )}

      {status === "success" && (
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <p className="text-sm text-gray-700">{message}</p>
          <Button onClick={() => router.push("/login")}>로그인하기</Button>
        </div>
      )}

      {status === "error" && (
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
            <XCircle className="h-6 w-6 text-red-600" />
          </div>
          <p className="text-sm text-gray-700">{message}</p>
          <Link href="/login">
            <Button variant="outline">로그인으로 돌아가기</Button>
          </Link>
        </div>
      )}
    </>
  );
}
