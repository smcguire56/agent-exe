import type { Agent, EventLog, GameTime } from "../types";
import type { PersonalityTrait } from "../data/traits";
import { randomFrom } from "./gameTick";

// ── Stat modifiers ──────────────────────────────────────────────

export interface TraitModifiers {
  speedMult: number;      // multiplied into effective speed
  accuracyMult: number;   // multiplied into effective accuracy
  sellPriceBonus: number; // flat $ added to sell price when listing
  complaintMult: number;  // multiplied into complaint chance
}

const BASE: TraitModifiers = {
  speedMult: 1.0,
  accuracyMult: 1.0,
  sellPriceBonus: 0,
  complaintMult: 1.0,
};

const TRAIT_MODIFIERS: Record<PersonalityTrait, Partial<TraitModifiers>> = {
  Perfectionist: { accuracyMult: 1.15, speedMult: 0.8 },
  Lazy:          { speedMult: 0.7 },
  Paranoid:      { accuracyMult: 1.1, complaintMult: 0.8 },   // careful → fewer complaints
  Sycophant:     {},                                            // flavor only
  Creative:      { sellPriceBonus: 3 },                        // better descriptions → +$3
  Competitive:   { speedMult: 1.2 },                           // always racing
  Loyal:         {},                                            // wage discount handled in tick
  Kleptomaniac:  { accuracyMult: 0.9 },                        // "lost" some of the goods
};

/** Combine all trait modifiers for an agent into one set. */
export function getModifiers(agent: Agent): TraitModifiers {
  const result = { ...BASE };
  for (const t of agent.traits) {
    const mod = TRAIT_MODIFIERS[t as PersonalityTrait];
    if (!mod) continue;
    result.speedMult *= mod.speedMult ?? 1.0;
    result.accuracyMult *= mod.accuracyMult ?? 1.0;
    result.sellPriceBonus += mod.sellPriceBonus ?? 0;
    result.complaintMult *= mod.complaintMult ?? 1.0;
  }
  return result;
}

/** Apply speed modifier to a base tick count (lower = faster). */
export function effectiveTaskTicks(baseTicks: number, agent: Agent): number {
  const { speedMult } = getModifiers(agent);
  // speedMult > 1 = faster = fewer ticks, speedMult < 1 = slower = more ticks
  // We invert: more speed → fewer ticks
  return Math.max(1, Math.round(baseTicks / speedMult));
}

/** Apply accuracy modifier. */
export function effectiveAccuracy(agent: Agent): number {
  const { accuracyMult } = getModifiers(agent);
  return Math.min(1.0, agent.accuracy * accuracyMult);
}

// ── Per-tick trait flavor events ─────────────────────────────────

const PARANOID_FLAVOR = [
  "is convinced the last shipment was a sting operation.",
  "ran a background check on a customer. The customer is a cat.",
  "encrypted all their notes. Forgot the password.",
  "thinks the office microwave is bugged.",
];

const SYCOPHANT_FLAVOR = [
  "said your business plan was 'the best they've ever seen.' They've seen one.",
  "agreed with both sides of an argument. Simultaneously.",
  "left a 5-star review of your company from their personal account.",
  "told you that you look 'very managerial today.'",
];

const COMPETITIVE_FLAVOR = [
  "is tracking everyone's sourcing speed on a whiteboard.",
  "challenged another agent to a 'who can list faster' contest. They're the only participant.",
  "just loudly announced their accuracy percentage to an empty room.",
];

const LAZY_FLAVOR = [
  "took a 'micro-nap' that lasted 20 minutes.",
  "automated their status updates to say 'working on it.'",
  "is somehow behind on a task they haven't started yet.",
];

const KLEPTOMANIAC_FLAVOR = [
  "found a 'spare' product in their jacket. Not sure whose it was.",
  "reorganized the inventory. Some of it is now 'personal inventory.'",
  "pockets jingling suspiciously.",
];

const TRAIT_FLAVOR: Partial<Record<PersonalityTrait, string[]>> = {
  Paranoid: PARANOID_FLAVOR,
  Sycophant: SYCOPHANT_FLAVOR,
  Competitive: COMPETITIVE_FLAVOR,
  Lazy: LAZY_FLAVOR,
  Kleptomaniac: KLEPTOMANIAC_FLAVOR,
};

/** 10% chance per tick for a working agent to emit trait-specific chatter. */
const TRAIT_FLAVOR_CHANCE = 0.10;

export function rollTraitFlavor(
  agent: Agent,
  time: GameTime,
): Omit<EventLog, "id"> | null {
  if (agent.status !== "working") return null;

  for (const t of agent.traits) {
    const pool = TRAIT_FLAVOR[t as PersonalityTrait];
    if (!pool) continue;
    if (Math.random() < TRAIT_FLAVOR_CHANCE) {
      return {
        timestamp: { ...time },
        level: "agent",
        source: agent.name,
        icon: "🤖",
        message: `${agent.name} ${randomFrom(pool)}`,
      };
    }
  }
  return null;
}

// ── Kleptomaniac steal roll (checked on product source) ──────────

const KLEPTO_STEAL_CHANCE = 0.12;

const KLEPTO_STEAL_MESSAGES = [
  "A product vanished from inventory. No one saw anything. Especially not",
  "Inventory count is off by one. The security camera was 'coincidentally' unplugged near",
  "A customer received an empty box. The item was last seen near",
];

export function rollKleptoSteal(
  agent: Agent,
  time: GameTime,
): Omit<EventLog, "id"> | null {
  if (!agent.traits.includes("Kleptomaniac")) return null;
  if (Math.random() >= KLEPTO_STEAL_CHANCE) return null;

  return {
    timestamp: { ...time },
    level: "warning",
    source: agent.name,
    icon: "🫳",
    message: `${randomFrom(KLEPTO_STEAL_MESSAGES)} ${agent.name}.`,
  };
}

// ── Loyal wage discount ─────────────────────────────────────────

/** Loyal agents get a 20% wage discount. */
export function effectiveWage(agent: Agent): number {
  if (agent.traits.includes("Loyal")) {
    return Math.max(1, Math.round(agent.wage * 0.8));
  }
  return agent.wage;
}

// ── Summary tooltip for UI ──────────────────────────────────────

const TRAIT_DESCRIPTIONS: Record<PersonalityTrait, string> = {
  Perfectionist: "+15% accuracy, -20% speed",
  Lazy: "-30% speed",
  Paranoid: "+10% accuracy, -20% complaints",
  Sycophant: "Flavor only (for now)",
  Creative: "+$3 sell price bonus",
  Competitive: "+20% speed",
  Loyal: "-20% wage",
  Kleptomaniac: "-10% accuracy, 12% steal chance",
};

export function traitDescription(trait: string): string {
  return TRAIT_DESCRIPTIONS[trait as PersonalityTrait] ?? "";
}
