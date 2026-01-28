"use client";

import { User } from "lucide-react";
import { ProfileForm } from "@/components/settings/profile-form";

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <User className="h-6 w-6 text-gray-700" />
        <h1 className="text-2xl font-bold text-gray-900">프로필 설정</h1>
      </div>
      <ProfileForm />
    </div>
  );
}
