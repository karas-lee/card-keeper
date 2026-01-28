import { test, expect } from "../fixtures/auth.fixture";

test.describe("Scan - File Upload", () => {
  test("should display scan page", async ({ authenticatedPage: page }) => {
    await page.goto("/scan");
    await expect(page).toHaveURL(/\/scan/);
  });

  test("should have file upload input", async ({ authenticatedPage: page }) => {
    await page.goto("/scan");
    const fileInput = page.locator("input[type='file']").or(page.getByTestId("file-input"));
    await expect(fileInput).toBeAttached();
  });
});
