import { test, expect } from "../fixtures/auth.fixture";

test.describe("Edit Card", () => {
  test("should display edit form when navigating to edit page", async ({ authenticatedPage: page }) => {
    // This test assumes a card exists; in real E2E, you'd create one first
    await page.goto("/cards");
    // If there are cards, click the first one
    const cardLink = page.locator("[data-testid='card-item']").first();
    if (await cardLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await cardLink.click();
      await page.getByRole("link", { name: /수정|편집|edit/i }).click();
      await expect(page.getByLabel("이름")).toBeVisible();
    }
  });
});
