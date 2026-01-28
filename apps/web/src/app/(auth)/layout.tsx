export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-primary-600">CardKeeper</h1>
          <p className="mt-2 text-sm text-gray-500">비즈니스 명함 관리 서비스</p>
        </div>
        <div className="rounded-xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
          {children}
        </div>
        <p className="mt-6 text-center text-xs text-gray-400">
          &copy; 2026 CardKeeper. All rights reserved.
        </p>
      </div>
    </div>
  );
}
