"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";

export function SocialLoginButtons() {
  const router = useRouter();
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const handleSocialLogin = async (provider: string) => {
    try {
      setLoadingProvider(provider);
      // Auth.js v5 signIn via redirect to the OAuth provider endpoint
      const callbackUrl = "/cards";
      const signInUrl = `/api/auth/signin/${provider}?callbackUrl=${encodeURIComponent(callbackUrl)}`;
      router.push(signInUrl);
    } catch {
      toast.error("소셜 로그인 중 오류가 발생했습니다");
      setLoadingProvider(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={!!loadingProvider}
          onClick={() => handleSocialLogin("google")}
        >
          {loadingProvider === "google" ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          )}
          Google로 계속하기
        </Button>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={!!loadingProvider}
          onClick={() => handleSocialLogin("apple")}
        >
          {loadingProvider === "apple" ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
          )}
          Apple로 계속하기
        </Button>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={!!loadingProvider}
          onClick={() => handleSocialLogin("kakao")}
        >
          {loadingProvider === "kakao" ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="#3C1E1E">
              <path d="M12 3C6.48 3 2 6.36 2 10.5c0 2.67 1.74 5.01 4.36 6.36-.14.5-.9 3.22-.93 3.44 0 0-.02.17.09.24.11.06.24.01.24.01.32-.04 3.7-2.44 4.28-2.86.63.09 1.28.14 1.96.14 5.52 0 10-3.36 10-7.5S17.52 3 12 3z" />
            </svg>
          )}
          Kakao로 계속하기
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">또는</span>
        </div>
      </div>
    </div>
  );
}
