import { test, expect } from "@playwright/test";

test.describe("Register Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/register");
  });

  test("should display register form", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "회원가입" })).toBeVisible();
  });

  test("should show validation for weak password", async ({ page }) => {
    await page.getByLabel("이름").fill("테스트");
    await page.getByLabel("이메일").fill("new@test.com");
    await page.getByLabel("비밀번호", { exact: true }).fill("short");
    await page.getByLabel("비밀번호 확인").fill("short");
    await page.getByRole("button", { name: /가입|회원가입/ }).click();
    await expect(page.getByText(/8자|비밀번호/)).toBeVisible();
  });

  test("should show error when passwords do not match", async ({ page }) => {
    await page.getByLabel("이름").fill("테스트");
    await page.getByLabel("이메일").fill("new@test.com");
    await page.getByLabel("비밀번호", { exact: true }).fill("Test1234!");
    await page.getByLabel("비밀번호 확인").fill("Different1234!");
    await page.getByRole("button", { name: /가입|회원가입/ }).click();
    await expect(page.getByText(/일치하지 않|match/i)).toBeVisible();
  });

  test("should navigate to login page", async ({ page }) => {
    await page.getByRole("link", { name: /로그인/ }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});
