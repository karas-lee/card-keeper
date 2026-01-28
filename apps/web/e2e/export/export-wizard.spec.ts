import { test, expect } from "../fixtures/auth.fixture";

test.describe("Export Wizard", () => {
  test("should display export page", async ({ authenticatedPage: page }) => {
    await page.goto("/settings/export");
    await expect(page).toHaveURL(/\/settings\/export/);
  });

  test("should have export format options", async ({ authenticatedPage: page }) => {
    await page.goto("/settings/export");
    // Look for vCard or CSV options
    const vcardOption = page.getByText(/vCard/i);
    const csvOption = page.getByText(/CSV/i);
    const hasOptions = await vcardOption.isVisible({ timeout: 3000 }).catch(() => false)
      || await csvOption.isVisible({ timeout: 3000 }).catch(() => false);
    expect(hasOptions).toBeTruthy();
  });
});
