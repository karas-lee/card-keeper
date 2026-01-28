import { test as base, expect } from "@playwright/test";

type AuthFixtures = {
  authenticatedPage: ReturnType<typeof base["page"]> extends Promise<infer P> ? P : never;
};

export const test = base.extend<{ authenticatedPage: any }>({
  authenticatedPage: async ({ page }, use) => {
    // Login before test
    await page.goto("/login");
    await page.getByLabel("이메일").fill("test@cardkeeper.app");
    await page.getByLabel("비밀번호").fill("Test1234!");
    await page.getByRole("button", { name: "로그인" }).click();
    await page.waitForURL(/\/(cards|$)/);
    await use(page);
  },
});

export { expect };
