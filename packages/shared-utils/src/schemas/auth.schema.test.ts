import { describe, it, expect } from "vitest";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../schemas/auth.schema";

describe("registerSchema", () => {
  const validData = {
    name: "홍길동",
    email: "hong@example.com",
    password: "Password1!",
    confirmPassword: "Password1!",
  };

  it("should pass with valid data", () => {
    const result = registerSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should fail when name is empty", () => {
    const result = registerSchema.safeParse({ ...validData, name: "" });
    expect(result.success).toBe(false);
  });

  it("should fail when name is missing", () => {
    const { name, ...rest } = validData;
    const result = registerSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("should fail when email is invalid", () => {
    const result = registerSchema.safeParse({
      ...validData,
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("should fail when password is shorter than 8 characters", () => {
    const result = registerSchema.safeParse({
      ...validData,
      password: "Pa1!",
      confirmPassword: "Pa1!",
    });
    expect(result.success).toBe(false);
  });

  it("should fail when password has no letters", () => {
    const result = registerSchema.safeParse({
      ...validData,
      password: "12345678!",
      confirmPassword: "12345678!",
    });
    expect(result.success).toBe(false);
  });

  it("should fail when password has no numbers", () => {
    const result = registerSchema.safeParse({
      ...validData,
      password: "Password!",
      confirmPassword: "Password!",
    });
    expect(result.success).toBe(false);
  });

  it("should fail when password has no special characters", () => {
    const result = registerSchema.safeParse({
      ...validData,
      password: "Password1",
      confirmPassword: "Password1",
    });
    expect(result.success).toBe(false);
  });

  it("should fail when confirmPassword does not match password", () => {
    const result = registerSchema.safeParse({
      ...validData,
      confirmPassword: "DifferentPass1!",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const confirmErr = result.error.issues.find(
        (i) => i.path.includes("confirmPassword")
      );
      expect(confirmErr).toBeDefined();
    }
  });
});

describe("loginSchema", () => {
  const validData = {
    email: "hong@example.com",
    password: "anypassword",
  };

  it("should pass with valid data", () => {
    const result = loginSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should fail when email is missing", () => {
    const result = loginSchema.safeParse({ password: "anypassword" });
    expect(result.success).toBe(false);
  });

  it("should fail when email is invalid", () => {
    const result = loginSchema.safeParse({
      ...validData,
      email: "invalid",
    });
    expect(result.success).toBe(false);
  });

  it("should fail when password is empty", () => {
    const result = loginSchema.safeParse({
      ...validData,
      password: "",
    });
    expect(result.success).toBe(false);
  });

  it("should fail when password is missing", () => {
    const result = loginSchema.safeParse({ email: "hong@example.com" });
    expect(result.success).toBe(false);
  });
});

describe("forgotPasswordSchema", () => {
  it("should pass with a valid email", () => {
    const result = forgotPasswordSchema.safeParse({
      email: "hong@example.com",
    });
    expect(result.success).toBe(true);
  });

  it("should fail with an invalid email", () => {
    const result = forgotPasswordSchema.safeParse({ email: "not-valid" });
    expect(result.success).toBe(false);
  });

  it("should fail when email is missing", () => {
    const result = forgotPasswordSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("resetPasswordSchema", () => {
  const validData = {
    token: "some-token",
    password: "Password1!",
    confirmPassword: "Password1!",
  };

  it("should pass with valid data", () => {
    const result = resetPasswordSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should fail when token is empty", () => {
    const result = resetPasswordSchema.safeParse({
      ...validData,
      token: "",
    });
    expect(result.success).toBe(false);
  });

  it("should fail when password does not meet rules", () => {
    const result = resetPasswordSchema.safeParse({
      ...validData,
      password: "short",
      confirmPassword: "short",
    });
    expect(result.success).toBe(false);
  });

  it("should fail when password has no special characters", () => {
    const result = resetPasswordSchema.safeParse({
      ...validData,
      password: "Password1",
      confirmPassword: "Password1",
    });
    expect(result.success).toBe(false);
  });

  it("should fail when confirmPassword does not match", () => {
    const result = resetPasswordSchema.safeParse({
      ...validData,
      confirmPassword: "Different1!",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const confirmErr = result.error.issues.find(
        (i) => i.path.includes("confirmPassword")
      );
      expect(confirmErr).toBeDefined();
    }
  });
});
