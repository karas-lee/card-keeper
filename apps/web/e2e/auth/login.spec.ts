import { test, expect } from "@playwright/test";

test.describe("Login Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("should display login form", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "로그인" })).toBeVisible();
    await expect(page.getByLabel("이메일")).toBeVisible();
    await expect(page.getByLabel("비밀번호")).toBeVisible();
    await expect(page.getByRole("button", { name: "로그인" })).toBeVisible();
  });

  test("should show validation errors for empty fields", async ({ page }) => {
    await page.getByRole("button", { name: "로그인" }).click();
    await expect(page.getByText(/이메일|email/i)).toBeVisible();
  });

  test("should show error for invalid credentials", async ({ page }) => {
    await page.getByLabel("이메일").fill("wrong@example.com");
    await page.getByLabel("비밀번호").fill("WrongPass123!");
    await page.getByRole("button", { name: "로그인" }).click();
    await expect(page.getByText(/올바르지 않|잘못된|실패/)).toBeVisible({ timeout: 10000 });
  });

  test("should navigate to register page", async ({ page }) => {
    await page.getByRole("link", { name: /회원가입/ }).click();
    await expect(page).toHaveURL(/\/register/);
  });

  test("should navigate to forgot password page", async ({ page }) => {
    await page.getByRole("link", { name: /비밀번호 찾기|비밀번호를 잊으셨/ }).click();
    await expect(page).toHaveURL(/\/forgot-password/);
  });
});
