import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, "비밀번호는 8자 이상이어야 합니다")
  .regex(/[a-zA-Z]/, "영문자를 포함해야 합니다")
  .regex(/[0-9]/, "숫자를 포함해야 합니다")
  .regex(/[!@#$%^&*(),.?":{}|<>]/, "특수문자를 포함해야 합니다");

export const registerSchema = z
  .object({
    name: z.string().min(1, "이름을 입력해주세요").max(50),
    email: z.string().email("유효한 이메일 주소를 입력해주세요"),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("유효한 이메일 주소를 입력해주세요"),
  password: z.string().min(1, "비밀번호를 입력해주세요"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("유효한 이메일 주소를 입력해주세요"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
