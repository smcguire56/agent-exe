import type { Agent, EventLog, GameTime, Product } from "../types";
import { TIER_1_PRODUCTS, HIDDEN_TRAITS } from "../data/products";
import {
  SOURCING_FLAVOR_MESSAGES,
  SOURCING_SUCCESS_MESSAGES,
  ERROR_MESSAGES,
} from "../data/messages";
import { makeId, randomFrom } from "./gameTick";
import {
  effectiveAccuracy,
  rollTraitFlavor,
  rollKleptoSteal,
} from "./traitEffects";

// Probability per in-progress tick that we emit a flavor chatter line
const FLAVOR_CHANCE = 0.35;

export interface AgentTickResult {
  agent: Agent;
  productsToAdd: Product[];
  eventsToAdd: Omit<EventLog, "id">[];
}

function makeEvent(
  time: GameTime,
  partial: Omit<EventLog, "id" | "timestamp">,
): Omit<EventLog, "id"> {
  return { timestamp: { ...time }, ...partial };
}

export function processAgent(agent: Agent, time: GameTime): AgentTickResult {
  const result: AgentTickResult = {
    agent,
    productsToAdd: [],
    eventsToAdd: [],
  };

  const task = agent.currentTask;
  if (!task || agent.status !== "working") return result;

  const newTicksRemaining = task.ticksRemaining - 1;

  // Still working — chance to emit flavor chatter
  if (newTicksRemaining > 0) {
    if (Math.random() < FLAVOR_CHANCE) {
      result.eventsToAdd.push(
        makeEvent(time, {
          level: "agent",
          source: agent.name,
          icon: "🤖",
          message: randomFrom(SOURCING_FLAVOR_MESSAGES),
        }),
      );
    }
    // Trait-specific flavor chatter
    const traitEvent = rollTraitFlavor(agent, time);
    if (traitEvent) result.eventsToAdd.push(traitEvent);

    result.agent = {
      ...agent,
      currentTask: { ...task, ticksRemaining: newTicksRemaining },
    };
    return result;
  }

  // Task complete — accuracy roll (trait-modified)
  const success = Math.random() < effectiveAccuracy(agent);

  if (success) {
    const template = randomFrom(TIER_1_PRODUCTS);
    const qualityRoll = Math.random();
    const hiddenQuality =
      qualityRoll < 0.15 ? "bad" as const
      : qualityRoll < 0.45 ? "ok" as const
      : qualityRoll < 0.80 ? "good" as const
      : "excellent" as const;

    const product: Product = {
      ...template,
      id: makeId("prod"),
      quality: hiddenQuality,
      hiddenTrait:
        Math.random() < 0.25 ? randomFrom(HIDDEN_TRAITS) : null,
    };

    // Kleptomaniac steal roll — product sourced but "lost"
    const stealEvent = rollKleptoSteal(agent, time);
    if (stealEvent) {
      result.eventsToAdd.push(stealEvent);
      // Product vanishes — don't add it to inventory
    } else {
      result.productsToAdd.push(product);
    }

    result.eventsToAdd.push(
      makeEvent(time, {
        level: "good",
        source: agent.name,
        icon: "📦",
        message: `Sourced "${product.name}" for $${product.buyPrice}. ${randomFrom(SOURCING_SUCCESS_MESSAGES)}`,
      }),
    );
  } else {
    result.eventsToAdd.push(
      makeEvent(time, {
        level: "warning",
        source: agent.name,
        icon: "⚠️",
        message: randomFrom(ERROR_MESSAGES),
      }),
    );
  }

  result.agent = {
    ...agent,
    status: "idle",
    currentTask: null,
    mood: success ? "smug" : "having a day",
  };
  return result;
}
