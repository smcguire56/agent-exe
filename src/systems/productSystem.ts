import type { EventLog, GameTime, Product } from "../types";
import { COMPLAINT_MESSAGES, SALE_MESSAGES } from "../data/messages";
import { randomFrom } from "./gameTick";

const BASE_COMPLAINT_CHANCE = 0.15;
const COMPLAINT_HEAT = 5;

const BLIND_COMPLAINT_MESSAGES = [
  "📦 Customer reports: 'This phone case arrived warm for no reason. I'm scared.'",
  "📦 Customer reports: 'It works, but it whispers sometimes.'",
  "📦 Customer reports: 'This is not what the picture showed. The picture was better. Obviously.'",
  "📦 Customer reports: 'My dog won't stop barking at it.'",
  "📦 Customer reports: 'The smell. THE SMELL.'",
];

export interface ProductTickResult {
  product: Product | null; // null if it sold and should be removed
  eventsToAdd: Omit<EventLog, "id">[];
  moneyDelta: number;
  heatDelta: number;
}

/** Quality multiplier applied to sell price */
function qualityMultiplier(quality: Product["quality"]): number {
  switch (quality) {
    case "excellent": return 2.0;
    case "good": return 1.5;
    case "ok": return 1.0;
    case "bad": return 0.6;
    default: return 1.0; // unknown — base price
  }
}

/** Complaint chance based on quality and whether inspected */
function complaintChance(product: Product): number {
  if (!product.inspected) {
    // Selling blind — bad items are risky
    if (product.quality === "bad") return 0.40;
    return BASE_COMPLAINT_CHANCE;
  }
  // Inspected items — you knew what you were selling
  switch (product.quality) {
    case "bad": return 0.40;
    case "ok": return 0.10;
    case "good": return 0.05;
    case "excellent": return 0.02;
    default: return BASE_COMPLAINT_CHANCE;
  }
}

export function processProduct(
  product: Product,
  time: GameTime,
  complaintMult: number = 1.0,
): ProductTickResult {
  const result: ProductTickResult = {
    product,
    eventsToAdd: [],
    moneyDelta: 0,
    heatDelta: 0,
  };

  // Process inspection countdown
  if (product.inspectTicks !== null && product.inspectTicks > 0) {
    const newTicks = product.inspectTicks - 1;
    if (newTicks > 0) {
      result.product = { ...product, inspectTicks: newTicks };
      return result;
    }

    // Inspection complete
    const inspected = product.inspectType === "deep";
    const revealedQuality = product.quality === "unknown" ? "ok" : product.quality;

    result.product = {
      ...product,
      inspected: true,
      inspectTicks: null,
      inspectType: null,
      quality: revealedQuality,
    };

    const qualityLabel = revealedQuality.toUpperCase();
    if (inspected && product.hiddenTrait) {
      result.eventsToAdd.push({
        timestamp: { ...time },
        level: "info",
        icon: "🔍",
        message: `Deep inspection of "${product.name}": Quality ${qualityLabel}. Hidden trait: "${product.hiddenTrait}"`,
      });
    } else {
      result.eventsToAdd.push({
        timestamp: { ...time },
        level: "info",
        icon: "🔎",
        message: `Inspection of "${product.name}": Quality ${qualityLabel}.`,
      });
    }
    return result;
  }

  if (!product.listed || product.ticksToSell === null) return result;

  const newTicks = product.ticksToSell - 1;

  if (newTicks > 0) {
    result.product = { ...product, ticksToSell: newTicks };
    return result;
  }

  // Sale! Apply quality multiplier if inspected (known quality = priced accordingly)
  const mult = product.inspected ? qualityMultiplier(product.quality) : 1.0;
  const finalPrice = Math.round(product.sellPrice * mult);

  result.product = null;
  result.moneyDelta = finalPrice;
  result.eventsToAdd.push({
    timestamp: { ...time },
    level: "good",
    icon: "💰",
    message: `SOLD: "${product.name}" for $${finalPrice}. ${randomFrom(SALE_MESSAGES)}`,
  });

  // Complaint roll (Paranoid agents reduce complaints via complaintMult)
  // Grey products (tier 2) generate 2x heat on complaints
  const heatMult = product.tier >= 2 ? 2 : 1;
  const cc = complaintChance(product) * complaintMult;
  if (Math.random() < cc) {
    result.heatDelta = COMPLAINT_HEAT * heatMult;

    if (!product.inspected && product.quality === "bad") {
      // Blind sale of bad item — special message
      result.eventsToAdd.push({
        timestamp: { ...time },
        level: "warning",
        icon: "📮",
        message: randomFrom(BLIND_COMPLAINT_MESSAGES),
      });
    } else {
      result.eventsToAdd.push({
        timestamp: { ...time },
        level: "warning",
        icon: "📮",
        message: randomFrom(COMPLAINT_MESSAGES),
      });
    }
  }

  return result;
}
