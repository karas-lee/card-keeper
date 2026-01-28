"use client";

import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth.store";

export default function OnboardingPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-50">
        <Sparkles className="h-8 w-8 text-primary-600" />
      </div>

      <div>
        <h2 className="text-2xl font-bold">
          환영합니다{user?.name ? `, ${user.name}` : ""}!
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          CardKeeper에 가입해주셔서 감사합니다.
          <br />
          명함을 스캔하고, 정리하고, 관리해보세요.
        </p>
      </div>

      <div className="space-y-3 text-left">
        <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700">
            1
          </span>
          <div>
            <p className="text-sm font-medium text-gray-900">명함 스캔</p>
            <p className="text-xs text-gray-500">
              카메라로 명함을 촬영하면 자동으로 정보를 인식합니다
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700">
            2
          </span>
          <div>
            <p className="text-sm font-medium text-gray-900">폴더로 정리</p>
            <p className="text-xs text-gray-500">
              태그와 폴더를 활용하여 명함을 깔끔하게 분류하세요
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700">
            3
          </span>
          <div>
            <p className="text-sm font-medium text-gray-900">어디서든 관리</p>
            <p className="text-xs text-gray-500">
              웹과 모바일에서 언제든 명함 정보를 확인하세요
            </p>
          </div>
        </div>
      </div>

      <Button className="w-full" onClick={() => router.push("/cards")}>
        시작하기
      </Button>
    </div>
  );
}
