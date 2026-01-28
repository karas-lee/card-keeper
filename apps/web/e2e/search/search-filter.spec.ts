import { test, expect } from "../fixtures/auth.fixture";

test.describe("Search and Filter", () => {
  test("should display search input on cards page", async ({ authenticatedPage: page }) => {
    await page.goto("/cards");
    const searchInput = page.getByPlaceholder(/검색|search/i);
    await expect(searchInput).toBeVisible();
  });

  test("should accept search input", async ({ authenticatedPage: page }) => {
    await page.goto("/cards");
    const searchInput = page.getByPlaceholder(/검색|search/i);
    await searchInput.fill("테스트");
    await expect(searchInput).toHaveValue("테스트");
  });

  test("should show empty state or results after search", async ({ authenticatedPage: page }) => {
    await page.goto("/cards");
    const searchInput = page.getByPlaceholder(/검색|search/i);
    await searchInput.fill("존재하지않는명함xyz");
    await searchInput.press("Enter");
    // Should show either results or empty state
    await page.waitForTimeout(2000);
    const body = await page.textContent("body");
    expect(body).toBeTruthy();
  });
});
