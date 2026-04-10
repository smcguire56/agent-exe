import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";

interface DebugProduct {
  id: string;
  name: string;
  sellPrice: number;
  buyPrice: number;
  listed: boolean;
  ticksToSell: number | null;
}

declare global {
  interface Window {
    __game: {
      getState: () => {
        money: number;
        products: DebugProduct[];
        agents: { name: string; accuracy: number; status: string; currentTask: unknown }[];
        events: { message: string; level: string; icon?: string }[];
        tick: () => void;
        assignTask: (id: string) => void;
        listProduct: (id: string) => void;
        setPaused: (p: boolean) => void;
      };
    };
  }
}

// Give Bryan guaranteed success and silence Pam, then source 1 product.
async function seedOneProduct(page: Page) {
  await page.evaluate(() => {
    const state = window.__game.getState() as unknown as {
      agents: {
        name: string;
        accuracy: number;
        status: string;
        currentTask: unknown;
      }[];
    };
    const bryan = state.agents.find((a) => a.name === "Bryan");
    if (bryan) bryan.accuracy = 1;
    const pam = state.agents.find((a) => a.name === "Pam");
    if (pam) {
      pam.status = "idle";
      pam.currentTask = null;
    }
  });

  await page.evaluate(() => {
    window.__game.getState().assignTask("agent_bryan");
    for (let i = 0; i < 6; i++) window.__game.getState().tick();
  });

  const products = await page.evaluate(
    () => window.__game.getState().products,
  );
  expect(products.length).toBe(1);
  return products[0];
}

test.describe("Milestone 4 — selling products", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/?paused=1");
  });

  test("Market window shows inventory with a List button after sourcing", async ({
    page,
  }) => {
    const product = await seedOneProduct(page);

    await page.getByRole("button", { name: /Market/ }).click();
    await expect(page.getByText(/MARKET\.EXE — Source/)).toBeVisible();
    await expect(page.getByTestId("market-inventory-count")).toContainText(
      "[1]",
    );
    await expect(page.getByTestId("market-listings-count")).toContainText(
      "[0]",
    );
    await expect(
      page.getByTestId(`list-product-${product.id}`),
    ).toBeVisible();
  });

  test("clicking List for Sale moves the product into listings", async ({
    page,
  }) => {
    const product = await seedOneProduct(page);

    await page.getByRole("button", { name: /Market/ }).click();
    await page.getByTestId(`list-product-${product.id}`).click();

    const state = await page.evaluate(() =>
      window.__game.getState().products,
    );
    expect(state.length).toBe(1);
    expect(state[0].listed).toBe(true);
    expect(state[0].ticksToSell).toBe(6);

    await expect(page.getByTestId("market-inventory-count")).toContainText(
      "[0]",
    );
    await expect(page.getByTestId("market-listings-count")).toContainText(
      "[1]",
    );
  });

  test("after enough ticks a listed product sells, money goes up, log records sale", async ({
    page,
  }) => {
    const product = await seedOneProduct(page);
    const moneyBefore = await page.evaluate(
      () => window.__game.getState().money,
    );

    await page.evaluate((id) => {
      window.__game.getState().listProduct(id);
      for (let i = 0; i < 6; i++) window.__game.getState().tick();
    }, product.id);

    const state = await page.evaluate(() => ({
      money: window.__game.getState().money,
      products: window.__game.getState().products,
      events: window.__game.getState().events,
    }));

    // Product removed from inventory
    expect(state.products.length).toBe(0);
    // Money increased by exactly the sell price
    expect(state.money).toBe(moneyBefore + product.sellPrice);
    // A SOLD log entry was recorded
    const sold = state.events.some(
      (e) => e.icon === "💰" && /^SOLD:/.test(e.message),
    );
    expect(sold).toBe(true);

    // Stats panel inventory counter reflects the removal
    const inv = await page.getByTestId("inventory-count").textContent();
    expect(Number(inv)).toBe(0);
  });

  test("listing counts down over ticks", async ({ page }) => {
    const product = await seedOneProduct(page);
    await page.evaluate((id) => {
      window.__game.getState().listProduct(id);
    }, product.id);

    await page.getByRole("button", { name: /Market/ }).click();
    await expect(page.getByText("6t")).toBeVisible();

    await page.evaluate(() => window.__game.getState().tick());
    await expect(page.getByText("5t")).toBeVisible();
  });

  test("listProduct is a no-op for non-existent product IDs", async ({
    page,
  }) => {
    const before = await page.evaluate(
      () => window.__game.getState().products.length,
    );
    await page.evaluate(() =>
      window.__game.getState().listProduct("nonsense"),
    );
    const after = await page.evaluate(
      () => window.__game.getState().products.length,
    );
    expect(after).toBe(before);
  });
});
