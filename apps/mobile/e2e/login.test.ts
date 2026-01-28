import { by, device, element, expect } from "detox";

describe("Login Flow", () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it("should display login screen", async () => {
    await expect(element(by.text("로그인"))).toBeVisible();
  });

  it("should show email and password fields", async () => {
    await expect(element(by.id("email-input"))).toBeVisible();
    await expect(element(by.id("password-input"))).toBeVisible();
  });

  it("should login and navigate to card list", async () => {
    await element(by.id("email-input")).typeText("test@cardkeeper.app");
    await element(by.id("password-input")).typeText("Test1234!");
    await element(by.text("로그인")).tap();

    // Should navigate to the main tabs
    await waitFor(element(by.id("cards-tab")))
      .toBeVisible()
      .withTimeout(10000);
  });

  it("should show error for invalid credentials", async () => {
    await element(by.id("email-input")).typeText("wrong@example.com");
    await element(by.id("password-input")).typeText("WrongPass1!");
    await element(by.text("로그인")).tap();

    await waitFor(element(by.text(/올바르지 않|실패/)))
      .toBeVisible()
      .withTimeout(5000);
  });

  it("should navigate to register screen", async () => {
    await element(by.text("회원가입")).tap();
    await expect(element(by.text("회원가입"))).toBeVisible();
  });
});
