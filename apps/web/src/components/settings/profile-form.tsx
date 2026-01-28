"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2, User, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/stores/auth.store";

interface ProfileFormValues {
  name: string;
  avatarUrl: string;
}

interface PasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function ProfileForm() {
  const { user, accessToken } = useAuthStore();
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);

  const profileForm = useForm<ProfileFormValues>({
    defaultValues: {
      name: user?.name || "",
      avatarUrl: user?.avatarUrl || "",
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onProfileSubmit = async (data: ProfileFormValues) => {
    setIsProfileSaving(true);
    try {
      const res = await fetch("/api/v1/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("프로필 수정에 실패했습니다");
      toast.success("프로필이 수정되었습니다");
    } catch {
      toast.error("프로필 수정에 실패했습니다");
    } finally {
      setIsProfileSaving(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error("새 비밀번호가 일치하지 않습니다");
      return;
    }

    setIsPasswordSaving(true);
    try {
      const res = await fetch("/api/v1/auth/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });
      if (!res.ok) throw new Error("비밀번호 변경에 실패했습니다");
      toast.success("비밀번호가 변경되었습니다");
      passwordForm.reset();
    } catch {
      toast.error("비밀번호 변경에 실패했습니다");
    } finally {
      setIsPasswordSaving(false);
    }
  };

  const initials = user?.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <div className="space-y-8">
      {/* Profile Section */}
      <Card>
        <CardContent className="p-6">
          <div className="mb-6 flex items-center gap-3">
            <User className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">기본 정보</h3>
          </div>

          <form
            onSubmit={profileForm.handleSubmit(onProfileSubmit)}
            className="space-y-6"
          >
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={profileForm.watch("avatarUrl") || undefined}
                  alt={user?.name || "프로필"}
                />
                <AvatarFallback className="bg-primary-100 text-lg font-semibold text-primary-700">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Label htmlFor="avatarUrl">프로필 이미지 URL</Label>
                <Input
                  id="avatarUrl"
                  placeholder="https://example.com/avatar.jpg"
                  {...profileForm.register("avatarUrl")}
                />
              </div>
            </div>

            {/* Name */}
            <div>
              <Label htmlFor="name">이름</Label>
              <Input
                id="name"
                placeholder="이름을 입력하세요"
                {...profileForm.register("name", {
                  required: "이름을 입력해주세요",
                })}
              />
              {profileForm.formState.errors.name && (
                <p className="mt-1 text-sm text-red-500">
                  {profileForm.formState.errors.name.message}
                </p>
              )}
            </div>

            {/* Email (readonly) */}
            <div>
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ""}
                disabled
                className="bg-gray-50"
              />
              <p className="mt-1 text-xs text-gray-400">
                이메일은 변경할 수 없습니다
              </p>
            </div>

            <Button type="submit" disabled={isProfileSaving}>
              {isProfileSaving && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              저장
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Password Section */}
      <Card>
        <CardContent className="p-6">
          <div className="mb-6 flex items-center gap-3">
            <Lock className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">
              비밀번호 변경
            </h3>
          </div>

          <form
            onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="currentPassword">현재 비밀번호</Label>
              <Input
                id="currentPassword"
                type="password"
                placeholder="현재 비밀번호를 입력하세요"
                {...passwordForm.register("currentPassword", {
                  required: "현재 비밀번호를 입력해주세요",
                })}
              />
              {passwordForm.formState.errors.currentPassword && (
                <p className="mt-1 text-sm text-red-500">
                  {passwordForm.formState.errors.currentPassword.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="newPassword">새 비밀번호</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="새 비밀번호를 입력하세요"
                {...passwordForm.register("newPassword", {
                  required: "새 비밀번호를 입력해주세요",
                  minLength: {
                    value: 8,
                    message: "비밀번호는 8자 이상이어야 합니다",
                  },
                })}
              />
              {passwordForm.formState.errors.newPassword && (
                <p className="mt-1 text-sm text-red-500">
                  {passwordForm.formState.errors.newPassword.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">새 비밀번호 확인</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="새 비밀번호를 다시 입력하세요"
                {...passwordForm.register("confirmPassword", {
                  required: "비밀번호 확인을 입력해주세요",
                })}
              />
              {passwordForm.formState.errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">
                  {passwordForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Separator />

            <Button type="submit" disabled={isPasswordSaving}>
              {isPasswordSaving && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              비밀번호 변경
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
