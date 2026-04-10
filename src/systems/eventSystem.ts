import type { EventLog } from "../types";
import {
  RANDOM_EVENTS,
  HIGH_HEAT_WARNINGS,
  GAME_OVER_MESSAGES,
  type EventTemplate,
} from "../data/events";
import { randomFrom } from "./gameTick";

// Base chance per tick that a random event fires.
export const RANDOM_EVENT_CHANCE = 0.08;

// Once heat >= HIGH_HEAT_THRESHOLD, chance of an extra doom-y warning.
export const HIGH_HEAT_THRESHOLD = 80;
export const HIGH_HEAT_WARNING_CHANCE = 0.25;

// How much heat passively burns off every tick.
export const HEAT_DECAY_PER_TICK = 1;

// Anything at or above this ends the run.
export const HEAT_GAME_OVER = 100;

export interface RolledEvent {
  event: Omit<EventLog, "id" | "timestamp">;
  moneyDelta: number;
  heatDelta: number;
}

function templateToRolled(t: EventTemplate): RolledEvent {
  return {
    event: {
      level: t.level,
      icon: t.icon,
      message: t.message,
    },
    moneyDelta: t.effect?.money ?? 0,
    heatDelta: t.effect?.heat ?? 0,
  };
}

export function rollRandomEvent(): RolledEvent | null {
  if (Math.random() >= RANDOM_EVENT_CHANCE) return null;
  return templateToRolled(randomFrom(RANDOM_EVENTS));
}

export function rollHighHeatWarning(heat: number): RolledEvent | null {
  if (heat < HIGH_HEAT_THRESHOLD) return null;
  if (Math.random() >= HIGH_HEAT_WARNING_CHANCE) return null;
  return templateToRolled(randomFrom(HIGH_HEAT_WARNINGS));
}

export function getGameOverMessage(): string {
  return randomFrom(GAME_OVER_MESSAGES);
}
