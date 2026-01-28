import { test, expect } from "../fixtures/auth.fixture";

test.describe("Folder Management", () => {
  test("should display folders page", async ({ authenticatedPage: page }) => {
    await page.goto("/folders");
    await expect(page).toHaveURL(/\/folders/);
  });

  test("should have create folder button", async ({ authenticatedPage: page }) => {
    await page.goto("/folders");
    await expect(page.getByRole("button", { name: /새 폴더|폴더 추가|만들기/ }).or(page.getByTestId("create-folder-button"))).toBeVisible();
  });

  test("should show default folder", async ({ authenticatedPage: page }) => {
    await page.goto("/folders");
    await expect(page.getByText("미분류")).toBeVisible({ timeout: 5000 });
  });
});
