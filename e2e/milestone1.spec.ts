import { test, expect, type ConsoleMessage } from "@playwright/test";

test.describe("Milestone 1 — ShellOS desktop", () => {
  let consoleErrors: string[] = [];

  test.beforeEach(async ({ page }) => {
    consoleErrors = [];
    page.on("console", (msg: ConsoleMessage) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push(err.message));
    // Pause the game loop so layout assertions stay deterministic
    await page.goto("/?paused=1");
  });

  test("top bar shows starting state", async ({ page }) => {
    const topBar = page.locator("div").filter({ hasText: /^SHELLOS/ }).first();
    await expect(topBar).toContainText("SHELLOS");
    await expect(topBar).toContainText("$500");
    await expect(topBar).toContainText("CPU 35%");
    await expect(topBar).toContainText("Heat 12%");
    await expect(topBar).toContainText("Day 1");
    await expect(topBar).toContainText("09:00");
  });

  test("agent panel lists Bryan and Pam with correct status", async ({ page }) => {
    await expect(page.getByTestId("agent-capacity")).toContainText("[2/2]");
    // Names are styled uppercase via CSS but the underlying text is "Bryan"/"Pam"
    await expect(page.getByText("Bryan", { exact: true })).toBeVisible();
    await expect(page.getByText("Pam", { exact: true })).toBeVisible();

    // Pam is working and shows her task — match the ↳ prefix to disambiguate
    // from the seeded log entry that mentions "sourcing"
    await expect(
      page.getByText("↳ Sourcing knockoff sunglasses"),
    ).toBeVisible();

    // Hire button present (label varies based on capacity/funds)
    await expect(page.getByTestId("hire-agent")).toBeVisible();
  });

  test("event log shows seeded boot entries", async ({ page }) => {
    await expect(page.getByText("EVENT.LOG")).toBeVisible();
    await expect(page.getByText("[7 entries]")).toBeVisible();

    await expect(
      page.getByText(/SHELLOS v0\.1\.4 — Booting up/),
    ).toBeVisible();
    await expect(
      page.getByText(/Loading dignity\.\.\. not found/),
    ).toBeVisible();
    await expect(
      page.getByText(/Welcome back, Operator/),
    ).toBeVisible();
    await expect(
      page.getByText(/Asking what we're doing today/),
    ).toBeVisible();
    await expect(
      page.getByText(/looked legit on the website/),
    ).toBeVisible();
    await expect(
      page.getByText(/A subreddit has noticed your store/),
    ).toBeVisible();

    // Timestamp prefix exists
    await expect(page.getByText(/\[D1 09:00\]/).first()).toBeVisible();
  });

  test("stats panel shows hardware meters and inventory", async ({ page }) => {
    await expect(page.getByText("SYSTEM.STATS")).toBeVisible();
    // "Hardware" also appears in the taskbar button — scope to the section heading
    await expect(
      page.locator("div.text-shell-cyan", { hasText: /^Hardware$/ }),
    ).toBeVisible();
    await expect(page.getByText("Operations")).toBeVisible();
    await expect(page.getByText("Cooling")).toBeVisible();
    await expect(page.getByText("Storage")).toBeVisible();
    await expect(page.getByText("📦 Inventory")).toBeVisible();
    await expect(page.getByRole("button", { name: /UPGRADE/ })).toBeVisible();
  });

  test("taskbar exposes all four app buttons", async ({ page }) => {
    await expect(page.getByRole("button", { name: /AgentHQ/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Market/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Hardware/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Apartment/ })).toBeVisible();
  });

  test("AgentHQ window opens, lists agents, and closes via X", async ({ page }) => {
    await page.getByRole("button", { name: /AgentHQ/ }).click();

    const window = page.getByText("AGENT.HQ — Personnel Manager");
    await expect(window).toBeVisible();
    await expect(page.getByText(/Bryan — tier 1/)).toBeVisible();
    await expect(page.getByText(/Pam — tier 1/)).toBeVisible();

    // Close button (X) inside the open window
    await page.getByRole("button", { name: "X" }).click();
    await expect(window).not.toBeVisible();
  });

  test("only one window is open at a time", async ({ page }) => {
    await page.getByRole("button", { name: /AgentHQ/ }).click();
    await expect(page.getByText("AGENT.HQ — Personnel Manager")).toBeVisible();

    await page.getByRole("button", { name: /Market/ }).click();
    await expect(page.getByText("AGENT.HQ — Personnel Manager")).not.toBeVisible();
    await expect(page.getByText(/MARKET\.EXE — Source/)).toBeVisible();

    await page.getByRole("button", { name: /Hardware/ }).click();
    await expect(page.getByText(/MARKET\.EXE — Source/)).not.toBeVisible();
    await expect(page.getByText(/HARDWARE\.SHOP — Upgrades/)).toBeVisible();
  });

  test("clicking the same taskbar button toggles its window closed", async ({ page }) => {
    const btn = page.getByRole("button", { name: /AgentHQ/ });
    await btn.click();
    await expect(page.getByText("AGENT.HQ — Personnel Manager")).toBeVisible();
    await btn.click();
    await expect(page.getByText("AGENT.HQ — Personnel Manager")).not.toBeVisible();
  });

  test("apartment button does not open a window (not built yet)", async ({ page }) => {
    await page.getByRole("button", { name: /Apartment/ }).click();
    // No known window titles should appear
    await expect(page.getByText("AGENT.HQ — Personnel Manager")).not.toBeVisible();
    await expect(page.getByText(/MARKET\.EXE — Source/)).not.toBeVisible();
    await expect(page.getByText(/HARDWARE\.SHOP — Upgrades/)).not.toBeVisible();
  });

  test("no console errors on initial render", async ({ page }) => {
    await page.waitForTimeout(500);
    expect(consoleErrors).toEqual([]);
  });

  test("screenshot the desktop", async ({ page }) => {
    await page.screenshot({ path: "e2e/screenshots/desktop.png", fullPage: false });
    await page.getByRole("button", { name: /AgentHQ/ }).click();
    await page.screenshot({ path: "e2e/screenshots/agenthq-open.png", fullPage: false });
  });
});
