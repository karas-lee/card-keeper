import { test, expect } from "../fixtures/auth.fixture";

test.describe("Create Card", () => {
  test("should navigate to new card page", async ({ authenticatedPage: page }) => {
    await page.goto("/cards/new");
    await expect(page).toHaveURL(/\/cards\/new/);
  });

  test("should display card creation form", async ({ authenticatedPage: page }) => {
    await page.goto("/cards/new");
    await expect(page.getByLabel("이름")).toBeVisible();
  });

  test("should show validation error for empty name", async ({ authenticatedPage: page }) => {
    await page.goto("/cards/new");
    await page.getByRole("button", { name: /저장|등록/ }).click();
    await expect(page.getByText(/이름.*입력|필수/)).toBeVisible();
  });

  test("should create card with basic info", async ({ authenticatedPage: page }) => {
    await page.goto("/cards/new");
    await page.getByLabel("이름").fill("테스트 명함");
    await page.getByLabel("회사").fill("테스트 회사");
    await page.getByLabel("직함").fill("개발자");
    await page.getByRole("button", { name: /저장|등록/ }).click();
    // Should redirect to cards list or card detail
    await page.waitForURL(/\/cards/);
  });
});
