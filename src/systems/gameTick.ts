import type { GameTime } from "../types";

export const TICK_MS = 2000;
export const MINUTES_PER_TICK = 15;

export function advanceTime(time: GameTime): GameTime {
  let { day, hour, minute } = time;
  minute += MINUTES_PER_TICK;
  while (minute >= 60) {
    minute -= 60;
    hour += 1;
  }
  while (hour >= 24) {
    hour -= 24;
    day += 1;
  }
  return { day, hour, minute };
}

export function randomFrom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

let idCounter = 0;
export function makeId(prefix: string): string {
  idCounter += 1;
  return `${prefix}_${Date.now().toString(36)}_${idCounter}`;
}
