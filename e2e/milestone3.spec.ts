import { test, expect } from "@playwright/test";

interface DebugAgent {
  id: string;
  name: string;
  status: "idle" | "working" | "error" | "rogue";
  currentTask: { ticksRemaining: number } | null;
}

declare global {
  interface Window {
    __game: {
      getState: () => {
        agents: DebugAgent[];
        products: { id: string; name: string }[];
        events: { message: string; level: string; source?: string }[];
        tick: () => void;
        assignTask: (agentId: string) => void;
        setPaused: (p: boolean) => void;
      };
    };
  }
}

test.describe("Milestone 3 — sourcing loop", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/?paused=1");
  });

  // Test helper: silence Pam so deterministic Bryan-only tests don't get
  // extra products / errors from her concurrent task.
  const idlePam = (page: import("@playwright/test").Page) =>
    page.evaluate(() => {
      const state = window.__game.getState() as unknown as {
        agents: {
          name: string;
          status: string;
          currentTask: unknown;
        }[];
      };
      const pam = state.agents.find((a) => a.name === "Pam");
      if (pam) {
        pam.status = "idle";
        pam.currentTask = null;
      }
    });

  test("idle agent shows an Assign Task button", async ({ page }) => {
    // Bryan starts idle, Pam starts working — only Bryan should have the button
    const buttons = page.getByRole("button", { name: /ASSIGN: SOURCE/ });
    await expect(buttons).toHaveCount(1);
  });

  test("clicking Assign Task moves Bryan to working with a task and logs a start message", async ({
    page,
  }) => {
    await page.getByRole("button", { name: /ASSIGN: SOURCE/ }).click();

    const bryan = await page.evaluate(() =>
      window.__game.getState().agents.find((a) => a.name === "Bryan"),
    );
    expect(bryan?.status).toBe("working");
    expect(bryan?.currentTask?.ticksRemaining).toBe(5);

    // Bryan no longer has an idle button
    const buttons = page.getByRole("button", { name: /ASSIGN: SOURCE/ });
    await expect(buttons).toHaveCount(0);

    // A start log entry was added under Bryan's name
    const events = await page.evaluate(
      () => window.__game.getState().events,
    );
    const lastBryan = events
      .filter((e) => e.source === "Bryan")
      .slice(-1)[0];
    expect(lastBryan).toBeTruthy();
    expect(lastBryan.level).toBe("agent");
  });

  test("after enough ticks the task resolves to either a product or an error", async ({
    page,
  }) => {
    await page.getByRole("button", { name: /ASSIGN: SOURCE/ }).click();

    const productsBefore = await page.evaluate(
      () => window.__game.getState().products.length,
    );
    const errorEventsBefore = await page.evaluate(
      () =>
        window.__game
          .getState()
          .events.filter((e) => e.level === "warning").length,
    );

    // Run 6 manual ticks (task length is 5 — one extra to be safe)
    await page.evaluate(() => {
      for (let i = 0; i < 6; i++) window.__game.getState().tick();
    });

    const bryan = await page.evaluate(() =>
      window.__game.getState().agents.find((a) => a.name === "Bryan"),
    );
    // Task is finished — Bryan is back to idle
    expect(bryan?.status).toBe("idle");
    expect(bryan?.currentTask).toBeNull();

    const productsAfter = await page.evaluate(
      () => window.__game.getState().products.length,
    );
    const errorEventsAfter = await page.evaluate(
      () =>
        window.__game
          .getState()
          .events.filter((e) => e.level === "warning").length,
    );

    // EITHER a product was added OR a new warning event fired
    const gainedProduct = productsAfter > productsBefore;
    const gainedError = errorEventsAfter > errorEventsBefore;
    expect(gainedProduct || gainedError).toBe(true);
  });

  test("a guaranteed-success agent always produces a product", async ({
    page,
  }) => {
    await idlePam(page);
    // Force Bryan to 100% accuracy by reaching into the store
    await page.evaluate(() => {
      const state = window.__game.getState() as unknown as {
        agents: { name: string; accuracy: number }[];
      };
      const bryan = state.agents.find((a) => a.name === "Bryan");
      if (bryan) bryan.accuracy = 1;
    });

    await page.getByRole("button", { name: /ASSIGN: SOURCE/ }).click();

    const productsBefore = await page.evaluate(
      () => window.__game.getState().products.length,
    );

    await page.evaluate(() => {
      for (let i = 0; i < 6; i++) window.__game.getState().tick();
    });

    const productsAfter = await page.evaluate(
      () => window.__game.getState().products.length,
    );
    expect(productsAfter).toBe(productsBefore + 1);

    // Inventory counter in stats panel reflects this
    const inventoryCount = await page
      .getByTestId("inventory-count")
      .textContent();
    expect(Number(inventoryCount)).toBe(productsAfter);

    // A "Sourced" event with Bryan as source should now exist
    const sourced = await page.evaluate(() =>
      window.__game
        .getState()
        .events.some(
          (e) => e.source === "Bryan" && /^Sourced /.test(e.message),
        ),
    );
    expect(sourced).toBe(true);
  });

  test("a guaranteed-failure agent always produces an error event", async ({
    page,
  }) => {
    await idlePam(page);
    await page.evaluate(() => {
      const state = window.__game.getState() as unknown as {
        agents: { name: string; accuracy: number }[];
      };
      const bryan = state.agents.find((a) => a.name === "Bryan");
      if (bryan) bryan.accuracy = 0;
    });

    await page.getByRole("button", { name: /ASSIGN: SOURCE/ }).click();

    const errorsBefore = await page.evaluate(
      () =>
        window.__game
          .getState()
          .events.filter((e) => e.level === "warning").length,
    );

    await page.evaluate(() => {
      for (let i = 0; i < 6; i++) window.__game.getState().tick();
    });

    const errorsAfter = await page.evaluate(
      () =>
        window.__game
          .getState()
          .events.filter((e) => e.level === "warning").length,
    );
    expect(errorsAfter).toBe(errorsBefore + 1);

    const bryan = await page.evaluate(() =>
      window.__game.getState().agents.find((a) => a.name === "Bryan"),
    );
    expect(bryan?.status).toBe("idle");
  });

  test("ticksRemaining shows in the agent panel and counts down", async ({
    page,
  }) => {
    await page.getByRole("button", { name: /ASSIGN: SOURCE/ }).click();
    // Just-assigned task shows (5t)
    await expect(page.getByText("(5t)")).toBeVisible();

    await page.evaluate(() => window.__game.getState().tick());
    await expect(page.getByText("(4t)")).toBeVisible();
  });
});
