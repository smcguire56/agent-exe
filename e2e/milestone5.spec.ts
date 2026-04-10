import { test, expect } from "@playwright/test";

interface DebugAgent {
  id: string;
  name: string;
  status: string;
}

declare global {
  interface Window {
    __game: {
      getState: () => {
        money: number;
        agents: DebugAgent[];
        hardware: { cpu: number; ram: number; cooling: number; storage: number };
        events: { message: string; level: string; icon?: string }[];
        tick: () => void;
        hireAgent: () => void;
        upgradeCpu: () => void;
        setPaused: (p: boolean) => void;
      };
    };
  }
}

test.describe("Milestone 5 — hardware upgrade and hiring", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/?paused=1");
  });

  test("agent panel shows capacity 2/2 on fresh boot", async ({ page }) => {
    await expect(page.getByTestId("agent-capacity")).toContainText("[2/2]");
  });

  test("hire button is disabled at capacity", async ({ page }) => {
    const hire = page.getByTestId("hire-agent");
    await expect(hire).toBeDisabled();
    await expect(hire).toContainText(/CAPACITY/);
  });

  test("Hardware window shows CPU upgrade button with current cost", async ({
    page,
  }) => {
    await page.getByRole("button", { name: /Hardware/ }).click();
    const btn = page.getByTestId("upgrade-cpu");
    await expect(btn).toBeVisible();
    await expect(btn).toContainText("$1000");
  });

  test("upgradeCpu fails when the player cannot afford it", async ({
    page,
  }) => {
    // Drain money
    await page.evaluate(() => {
      const state = window.__game.getState() as unknown as { money: number };
      state.money = 0;
    });
    const cpuBefore = await page.evaluate(
      () => window.__game.getState().hardware.cpu,
    );
    await page.evaluate(() => window.__game.getState().upgradeCpu());
    const cpuAfter = await page.evaluate(
      () => window.__game.getState().hardware.cpu,
    );
    expect(cpuAfter).toBe(cpuBefore);

    // A warning log entry was recorded
    const warned = await page.evaluate(() =>
      window.__game
        .getState()
        .events.some(
          (e) => e.level === "warning" && /Upgrade denied/.test(e.message),
        ),
    );
    expect(warned).toBe(true);
  });

  test("upgradeCpu deducts $1000, bumps CPU level, and unlocks an agent slot", async ({
    page,
  }) => {
    // Give the player enough money
    await page.evaluate(() => {
      const state = window.__game.getState() as unknown as { money: number };
      state.money = 1200;
    });

    await page.evaluate(() => window.__game.getState().upgradeCpu());

    const state = await page.evaluate(() => ({
      money: window.__game.getState().money,
      cpu: window.__game.getState().hardware.cpu,
    }));
    expect(state.money).toBe(200);
    expect(state.cpu).toBe(3);

    // Agent panel reflects new cap 2/3
    await expect(page.getByTestId("agent-capacity")).toContainText("[2/3]");

    // Hire button is now enabled
    const hire = page.getByTestId("hire-agent");
    await expect(hire).toBeEnabled();
    await expect(hire).toContainText(/HIRE/);
  });

  test("hireAgent adds a new idle tier-1 agent after capacity is unlocked", async ({
    page,
  }) => {
    await page.evaluate(() => {
      const state = window.__game.getState() as unknown as { money: number };
      state.money = 2000;
      window.__game.getState().upgradeCpu();
    });

    const countBefore = await page.evaluate(
      () => window.__game.getState().agents.length,
    );

    await page.getByTestId("hire-agent").click();

    const after = await page.evaluate(() => ({
      agents: window.__game.getState().agents,
      money: window.__game.getState().money,
    }));
    expect(after.agents.length).toBe(countBefore + 1);
    const hired = after.agents[after.agents.length - 1];
    expect(hired.status).toBe("idle");
    expect(after.money).toBe(1000 - 100); // 2000 - 1000 (upgrade) - 100 (hire)

    // Once hired, we're back at capacity
    await expect(page.getByTestId("agent-capacity")).toContainText("[3/3]");
    await expect(page.getByTestId("hire-agent")).toBeDisabled();
  });

  test("hireAgent refuses when at capacity and logs a warning", async ({
    page,
  }) => {
    const eventsBefore = await page.evaluate(
      () => window.__game.getState().events.length,
    );
    await page.evaluate(() => window.__game.getState().hireAgent());
    const eventsAfter = await page.evaluate(
      () => window.__game.getState().events.length,
    );
    expect(eventsAfter).toBeGreaterThan(eventsBefore);

    const blocked = await page.evaluate(() =>
      window.__game
        .getState()
        .events.some(
          (e) =>
            e.level === "warning" && /Hiring denied/.test(e.message),
        ),
    );
    expect(blocked).toBe(true);
  });
});
