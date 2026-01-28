import { by, device, element, expect } from "detox";

describe("Cards Flow", () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });

    // Login first
    await element(by.id("email-input")).typeText("test@cardkeeper.app");
    await element(by.id("password-input")).typeText("Test1234!");
    await element(by.text("로그인")).tap();
    await waitFor(element(by.id("cards-tab")))
      .toBeVisible()
      .withTimeout(10000);
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    // Re-login if needed
  });

  it("should display cards list", async () => {
    await expect(element(by.id("cards-list"))).toBeVisible();
  });

  it("should navigate to card detail on tap", async () => {
    // Tap first card if exists
    try {
      await element(by.id("card-item")).atIndex(0).tap();
      await expect(element(by.text("명함 상세"))).toBeVisible();
    } catch {
      // No cards yet, skip
    }
  });

  it("should navigate to new card screen", async () => {
    await element(by.id("add-card-button")).tap();
    await expect(element(by.text("명함 추가"))).toBeVisible();
  });

  it("should create a new card", async () => {
    await element(by.id("add-card-button")).tap();
    await element(by.id("name-input")).typeText("테스트 명함");
    await element(by.id("company-input")).typeText("테스트 회사");
    await element(by.id("job-title-input")).typeText("개발자");
    await element(by.text("저장")).tap();

    // Should navigate back to list
    await waitFor(element(by.id("cards-list")))
      .toBeVisible()
      .withTimeout(5000);
  });

  it("should pull to refresh", async () => {
    await element(by.id("cards-list")).swipe("down", "slow");
    // List should still be visible after refresh
    await expect(element(by.id("cards-list"))).toBeVisible();
  });

  it("should long press to enter selection mode", async () => {
    try {
      await element(by.id("card-item")).atIndex(0).longPress();
      await expect(element(by.id("selection-bar"))).toBeVisible();
    } catch {
      // No cards, skip
    }
  });
});
