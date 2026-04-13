import type { Agent, EventLog, GameTime, Product } from "../types";
import { TIER_1_PRODUCTS, TIER_2_PRODUCTS, HIDDEN_TRAITS } from "../data/products";
import {
  SOURCING_FLAVOR_MESSAGES,
  SOURCING_SUCCESS_MESSAGES,
  ERROR_MESSAGES,
  T2_SOURCING_FLAVOR_MESSAGES,
  T2_SOURCING_SUCCESS_MESSAGES,
  T2_ERROR_MESSAGES,
  T2_INITIATIVE_MESSAGES,
} from "../data/messages";
import { makeId, randomFrom } from "./gameTick";
import {
  effectiveAccuracy,
  rollTraitFlavor,
  rollKleptoSteal,
} from "./traitEffects";
import { clampMood, MOOD_TASK_SUCCESS, MOOD_TASK_FAIL, getCompleteMessage } from "./moodSystem";

// Probability per in-progress tick that we emit a flavor chatter line
const FLAVOR_CHANCE = 0.35;

// Tier 2 initiative chance per completed task
const T2_INITIATIVE_CHANCE = 0.15;

export interface AgentTickResult {
  agent: Agent;
  productsToAdd: Product[];
  eventsToAdd: Omit<EventLog, "id">[];
  moneyDelta: number;
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
    moneyDelta: 0,
  };

  const task = agent.currentTask;
  if (!task || agent.status !== "working") return result;

  const newTicksRemaining = task.ticksRemaining - 1;

  // Pick message pools based on tier
  const flavorPool = agent.tier >= 2 ? T2_SOURCING_FLAVOR_MESSAGES : SOURCING_FLAVOR_MESSAGES;
  const successPool = agent.tier >= 2 ? T2_SOURCING_SUCCESS_MESSAGES : SOURCING_SUCCESS_MESSAGES;
  const errorPool = agent.tier >= 2 ? T2_ERROR_MESSAGES : ERROR_MESSAGES;

  // Still working — chance to emit flavor chatter
  if (newTicksRemaining > 0) {
    if (Math.random() < FLAVOR_CHANCE) {
      result.eventsToAdd.push(
        makeEvent(time, {
          level: "agent",
          source: agent.name,
          icon: agent.tier >= 2 ? "🤖" : "🤖",
          message: randomFrom(flavorPool),
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
    // Tier 2 agents can source grey products (50/50 chance)
    const productPool = agent.tier >= 2 && Math.random() < 0.5
      ? TIER_2_PRODUCTS
      : TIER_1_PRODUCTS;

    const template = randomFrom(productPool);
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
    } else {
      result.productsToAdd.push(product);
    }

    result.eventsToAdd.push(
      makeEvent(time, {
        level: "good",
        source: agent.name,
        icon: "📦",
        message: `Sourced "${product.name}" for $${product.buyPrice}. ${randomFrom(successPool)} ${getCompleteMessage(agent.name, agent.mood)}`,
      }),
    );

    // Tier 2 "take initiative" — bonus action
    if (agent.tier >= 2 && Math.random() < T2_INITIATIVE_CHANCE) {
      const initiativeMsg = randomFrom(T2_INITIATIVE_MESSAGES);
      // Initiative bonus: small money gain or extra product
      const bonusCash = 10 + Math.floor(Math.random() * 40);
      result.moneyDelta += bonusCash;
      result.eventsToAdd.push(
        makeEvent(time, {
          level: "good",
          source: agent.name,
          icon: "💡",
          message: `${agent.name} ${initiativeMsg} (+$${bonusCash})`,
        }),
      );
    }
  } else {
    result.eventsToAdd.push(
      makeEvent(time, {
        level: "warning",
        source: agent.name,
        icon: "⚠️",
        message: randomFrom(errorPool),
      }),
    );
  }

  result.agent = {
    ...agent,
    status: "idle",
    currentTask: null,
    mood: success
      ? clampMood(agent.mood + MOOD_TASK_SUCCESS)
      : clampMood(agent.mood - MOOD_TASK_FAIL),
  };
  return result;
}
