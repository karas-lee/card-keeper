import { test, expect } from "../fixtures/auth.fixture";

test.describe("Tag Management", () => {
  test("should display tags page", async ({ authenticatedPage: page }) => {
    await page.goto("/tags");
    await expect(page).toHaveURL(/\/tags/);
  });

  test("should have create tag button", async ({ authenticatedPage: page }) => {
    await page.goto("/tags");
    await expect(page.getByRole("button", { name: /새 태그|태그 추가|만들기/ }).or(page.getByTestId("create-tag-button"))).toBeVisible();
  });
});
