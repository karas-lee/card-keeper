"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h2 className="text-2xl font-bold text-gray-900">
        문제가 발생했습니다
      </h2>
      <p className="mt-2 text-gray-600">
        {error.message || "예기치 못한 오류가 발생했습니다."}
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded-lg bg-primary-500 px-4 py-2 text-white hover:bg-primary-600"
      >
        다시 시도
      </button>
    </div>
  );
}
