"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema } from "@cardkeeper/shared-utils";
import type { z } from "zod";
import Link from "next/link";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForgotPassword } from "@/hooks/use-auth";

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const forgotPassword = useForgotPassword();

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (data: ForgotPasswordFormValues) => {
    forgotPassword.mutate(data);
  };

  if (forgotPassword.isSuccess) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-50">
          <Mail className="h-6 w-6 text-primary-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">
          이메일이 전송되었습니다
        </h3>
        <p className="text-sm text-gray-500">
          입력하신 이메일 주소로 비밀번호 재설정 링크를 전송했습니다. 이메일을
          확인해주세요.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          로그인으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>이메일</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  autoComplete="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={forgotPassword.isPending}
        >
          {forgotPassword.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              전송 중...
            </>
          ) : (
            "비밀번호 재설정 이메일 보내기"
          )}
        </Button>

        <div className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            로그인으로 돌아가기
          </Link>
        </div>
      </form>
    </Form>
  );
}
