import type { EventLog, GameTime, Product } from "../types";
import { COMPLAINT_MESSAGES, SALE_MESSAGES } from "../data/messages";
import { randomFrom } from "./gameTick";

const COMPLAINT_CHANCE = 0.15;
const COMPLAINT_HEAT = 5;

export interface ProductTickResult {
  product: Product | null; // null if it sold and should be removed
  eventsToAdd: Omit<EventLog, "id">[];
  moneyDelta: number;
  heatDelta: number;
}

export function processProduct(
  product: Product,
  time: GameTime,
): ProductTickResult {
  const result: ProductTickResult = {
    product,
    eventsToAdd: [],
    moneyDelta: 0,
    heatDelta: 0,
  };

  if (!product.listed || product.ticksToSell === null) return result;

  const newTicks = product.ticksToSell - 1;

  if (newTicks > 0) {
    result.product = { ...product, ticksToSell: newTicks };
    return result;
  }

  // Sale!
  result.product = null;
  result.moneyDelta = product.sellPrice;
  result.eventsToAdd.push({
    timestamp: { ...time },
    level: "good",
    icon: "💰",
    message: `SOLD: "${product.name}" for $${product.sellPrice}. ${randomFrom(SALE_MESSAGES)}`,
  });

  if (Math.random() < COMPLAINT_CHANCE) {
    result.heatDelta = COMPLAINT_HEAT;
    result.eventsToAdd.push({
      timestamp: { ...time },
      level: "warning",
      icon: "📮",
      message: randomFrom(COMPLAINT_MESSAGES),
    });
  }

  return result;
}
