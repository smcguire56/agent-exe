import { test, expect } from "@playwright/test";

declare global {
  interface Window {
    __game: {
      getState: () => {
        time: { day: number; hour: number; minute: number };
        tick: () => void;
        setPaused: (p: boolean) => void;
      };
    };
  }
}

test.describe("Milestone 2 — ticking clock", () => {
  test("clock advances by 15 minutes per tick (manual tick)", async ({
    page,
  }) => {
    await page.goto("/?paused=1");

    // Initial time
    const before = await page.evaluate(() => window.__game.getState().time);
    expect(before).toEqual({ day: 1, hour: 9, minute: 0 });

    // Tick once via the store
    await page.evaluate(() => window.__game.getState().tick());

    const after = await page.evaluate(() => window.__game.getState().time);
    expect(after).toEqual({ day: 1, hour: 9, minute: 15 });

    // Top bar reflects the new time
    await expect(page.getByTestId("topbar-clock")).toContainText("09:15");
  });

  test("paused store does not auto-tick", async ({ page }) => {
    await page.goto("/?paused=1");

    const before = await page.evaluate(() => window.__game.getState().time);
    // Wait longer than one TICK_MS interval
    await page.waitForTimeout(2400);
    const after = await page.evaluate(() => window.__game.getState().time);
    expect(after).toEqual(before);
  });

  test("live tick advances the clock automatically", async ({ page }) => {
    await page.goto("/");
    const clock = page.getByTestId("topbar-clock");
    await expect(clock).toContainText("09:00");
    // After ~2.5s, at least one tick has fired and time has advanced
    await expect(clock).toContainText("09:15", { timeout: 4000 });
  });

  test("hour and day rollover work correctly", async ({ page }) => {
    await page.goto("/?paused=1");

    // 4 ticks = +60 minutes → 10:00
    for (let i = 0; i < 4; i++) {
      await page.evaluate(() => window.__game.getState().tick());
    }
    const t1 = await page.evaluate(() => window.__game.getState().time);
    expect(t1).toEqual({ day: 1, hour: 10, minute: 0 });

    // Jump to end of day: another (24-10)*4 - 0 = 56 ticks → day 2 00:00
    const ticksToMidnight = (24 - 10) * 4;
    for (let i = 0; i < ticksToMidnight; i++) {
      await page.evaluate(() => window.__game.getState().tick());
    }
    const t2 = await page.evaluate(() => window.__game.getState().time);
    expect(t2).toEqual({ day: 2, hour: 0, minute: 0 });
  });

  test("money display starts at $500 and is visible in the top bar", async ({
    page,
  }) => {
    await page.goto("/?paused=1");
    await expect(page.getByText("$500")).toBeVisible();
  });
});
