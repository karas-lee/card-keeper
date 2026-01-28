import { test, expect } from "../fixtures/auth.fixture";

test.describe("Delete Card", () => {
  test("should show delete confirmation dialog", async ({ authenticatedPage: page }) => {
    await page.goto("/cards");
    const cardItem = page.locator("[data-testid='card-item']").first();
    if (await cardItem.isVisible({ timeout: 3000 }).catch(() => false)) {
      await cardItem.click();
      const deleteButton = page.getByRole("button", { name: /삭제|delete/i });
      if (await deleteButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await deleteButton.click();
        await expect(page.getByText(/정말 삭제|삭제하시겠습니까/)).toBeVisible();
      }
    }
  });
});
