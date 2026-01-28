import { test, expect } from "@playwright/test";

test.describe("Password Reset Flow", () => {
  test("should display forgot password form", async ({ page }) => {
    await page.goto("/forgot-password");
    await expect(page.getByRole("heading", { name: /비밀번호 찾기|비밀번호 재설정/ })).toBeVisible();
    await expect(page.getByLabel("이메일")).toBeVisible();
  });

  test("should show validation for invalid email", async ({ page }) => {
    await page.goto("/forgot-password");
    await page.getByLabel("이메일").fill("not-an-email");
    await page.getByRole("button", { name: /전송|보내기|확인/ }).click();
    await expect(page.getByText(/유효한 이메일|이메일/)).toBeVisible();
  });

  test("should display reset password page", async ({ page }) => {
    await page.goto("/reset-password?token=test-token");
    await expect(page.getByLabel("비밀번호", { exact: true })).toBeVisible();
  });
});
