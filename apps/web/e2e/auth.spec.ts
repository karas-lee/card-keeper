import { test, expect } from "@playwright/test";

test.describe("Authentication pages", () => {
  test.describe("Login page", () => {
    test("should display the login page", async ({ page }) => {
      await page.goto("/login");

      await expect(page).toHaveURL(/\/login/);
    });

    test("should display the login heading", async ({ page }) => {
      await page.goto("/login");

      const heading = page.getByRole("heading", { name: "로그인" });
      await expect(heading).toBeVisible();
    });

    test("should display login form elements", async ({ page }) => {
      await page.goto("/login");

      // Expect email and password input fields to be present
      await expect(page.getByRole("heading", { name: "로그인" })).toBeVisible();
    });

    test("should have a link to the register page", async ({ page }) => {
      await page.goto("/login");

      const registerLink = page.getByRole("link", { name: /회원가입/ });
      await expect(registerLink).toBeVisible();
    });
  });

  test.describe("Register page", () => {
    test("should display the register page", async ({ page }) => {
      await page.goto("/register");

      await expect(page).toHaveURL(/\/register/);
    });

    test("should display the register heading", async ({ page }) => {
      await page.goto("/register");

      const heading = page.getByRole("heading", { name: "회원가입" });
      await expect(heading).toBeVisible();
    });

    test("should display register form elements", async ({ page }) => {
      await page.goto("/register");

      // Expect the registration heading to be present
      await expect(page.getByRole("heading", { name: "회원가입" })).toBeVisible();
    });

    test("should have a link to the login page", async ({ page }) => {
      await page.goto("/register");

      const loginLink = page.getByRole("link", { name: /로그인/ });
      await expect(loginLink).toBeVisible();
    });
  });

  test.describe("Navigation between auth pages", () => {
    test("should navigate from login to register", async ({ page }) => {
      await page.goto("/login");

      const registerLink = page.getByRole("link", { name: /회원가입/ });
      await registerLink.click();

      await expect(page).toHaveURL(/\/register/);
    });

    test("should navigate from register to login", async ({ page }) => {
      await page.goto("/register");

      const loginLink = page.getByRole("link", { name: /로그인/ });
      await loginLink.click();

      await expect(page).toHaveURL(/\/login/);
    });
  });
});
