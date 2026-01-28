import { test, expect } from "../fixtures/auth.fixture";

test.describe("View Cards", () => {
  test("should display cards list page", async ({ authenticatedPage: page }) => {
    await page.goto("/cards");
    await expect(page).toHaveURL(/\/cards/);
  });

  test("should have search input", async ({ authenticatedPage: page }) => {
    await page.goto("/cards");
    await expect(page.getByPlaceholder(/검색|search/i)).toBeVisible();
  });

  test("should have new card button", async ({ authenticatedPage: page }) => {
    await page.goto("/cards");
    await expect(page.getByRole("link", { name: /새 명함|추가|등록/ }).or(page.getByTestId("new-card-button"))).toBeVisible();
  });
});
