import type { EventLog } from "../types";
import {
  RANDOM_EVENTS,
  HIGH_SUSPICION_WARNINGS,
  GAME_OVER_MESSAGES,
  type EventTemplate,
} from "../data/events";
import { randomFrom } from "./gameTick";

// Base chance per tick that a random event fires.
export const RANDOM_EVENT_CHANCE = 0.08;

// Once suspicion >= HIGH_SUSPICION_THRESHOLD, chance of an extra doom-y warning.
export const HIGH_SUSPICION_THRESHOLD = 55;
export const HIGH_SUSPICION_WARNING_CHANCE = 0.25;

// How much suspicion passively burns off every tick.
export const SUSPICION_DECAY_PER_TICK = 0.3;

// Anything at or above this ends the run.
export const SUSPICION_GAME_OVER = 100;

export interface RolledEvent {
  event: Omit<EventLog, "id" | "timestamp">;
  moneyDelta: number;
  suspicionDelta: number;
}

function templateToRolled(t: EventTemplate): RolledEvent {
  return {
    event: {
      level: t.level,
      icon: t.icon,
      message: t.message,
    },
    moneyDelta: t.effect?.money ?? 0,
    suspicionDelta: t.effect?.suspicion ?? 0,
  };
}

export function rollRandomEvent(hiredAgentNames: string[] = []): RolledEvent | null {
  if (Math.random() >= RANDOM_EVENT_CHANCE) return null;
  const eligible = RANDOM_EVENTS.filter(
    (e) => !e.requiresAgent || hiredAgentNames.includes(e.requiresAgent),
  );
  if (eligible.length === 0) return null;
  return templateToRolled(randomFrom(eligible));
}

export function rollHighSuspicionWarning(suspicion: number): RolledEvent | null {
  if (suspicion < HIGH_SUSPICION_THRESHOLD) return null;
  if (Math.random() >= HIGH_SUSPICION_WARNING_CHANCE) return null;
  return templateToRolled(randomFrom(HIGH_SUSPICION_WARNINGS));
}

export function getGameOverMessage(): string {
  return randomFrom(GAME_OVER_MESSAGES);
}

/** Returns 0-5 star level based on suspicion value */
export function getSuspicionStarLevel(suspicion: number): number {
  if (suspicion < 20) return 0;
  if (suspicion < 40) return 1;
  if (suspicion < 55) return 2;
  if (suspicion < 70) return 3;
  if (suspicion < 85) return 4;
  return 5;
}

/** Returns star display string (e.g. ★★☆☆☆) */
export function getSuspicionStars(suspicion: number): string {
  const level = getSuspicionStarLevel(suspicion);
  return "★".repeat(level) + "☆".repeat(5 - level);
}
