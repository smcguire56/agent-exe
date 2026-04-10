import type { Agent, EventLog, GameTime, Product } from "../types";
import { TIER_1_PRODUCTS, HIDDEN_TRAITS } from "../data/products";
import {
  SOURCING_FLAVOR_MESSAGES,
  SOURCING_SUCCESS_MESSAGES,
  ERROR_MESSAGES,
} from "../data/messages";
import { makeId, randomFrom } from "./gameTick";

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
    result.agent = {
      ...agent,
      currentTask: { ...task, ticksRemaining: newTicksRemaining },
    };
    return result;
  }

  // Task complete — accuracy roll
  const success = Math.random() < agent.accuracy;

  if (success) {
    const template = randomFrom(TIER_1_PRODUCTS);
    // Assign hidden quality — revealed on inspection
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
      // 25% chance the item has a hidden trait we'll surface later
      hiddenTrait:
        Math.random() < 0.25 ? randomFrom(HIDDEN_TRAITS) : null,
    };
    result.productsToAdd.push(product);

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
