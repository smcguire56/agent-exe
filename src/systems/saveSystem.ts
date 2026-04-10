import type { GameState } from "../types";

const SAVE_KEY = "shellos_save_v1";
const AUTO_SAVE_INTERVAL_DAYS = 1;

const SAVE_MESSAGES = [
  "Backing up to the cloud... (it's actually just your browser)",
  "Saving state. If this fails, blame cosmic rays.",
  "Compressing memories. Bryan's take up the most space.",
  "Save complete. Your progress is now 'backed up.' Air quotes intentional.",
];

const LOAD_MESSAGES = [
  "Session restored. Your agents missed you. (Bryan definitely cried.)",
  "Welcome back, Operator. Things are mostly fine. Mostly.",
  "Data recovered. Only minor corruption detected. Probably cosmetic.",
  "Previous state loaded. Time is a flat circle. Let's sell some stuff.",
];

export function randomSaveMessage(): string {
  return SAVE_MESSAGES[Math.floor(Math.random() * SAVE_MESSAGES.length)];
}

export function randomLoadMessage(): string {
  return LOAD_MESSAGES[Math.floor(Math.random() * LOAD_MESSAGES.length)];
}

/** Fields to persist (excludes runtime-only state like paused, functions, etc.) */
const SAVE_FIELDS: (keyof GameState)[] = [
  "money",
  "time",
  "agents",
  "products",
  "inventory",
  "hardware",
  "heat",
  "events",
  "upgrades",
  "openWindows",
  "windowZOrder",
  "gameOver",
  "gameOverReason",
  "stats",
  "hireCandidates",
  "hireCandidatesDay",
  "mails",
];

export function saveGame(state: GameState): string {
  const data: Partial<GameState> = {};
  for (const key of SAVE_FIELDS) {
    (data as Record<string, unknown>)[key] = state[key];
  }
  const json = JSON.stringify(data);
  localStorage.setItem(SAVE_KEY, json);
  return randomSaveMessage();
}

export function hasSave(): boolean {
  return localStorage.getItem(SAVE_KEY) !== null;
}

export function loadGame(): { state: Partial<GameState>; message: string } | null {
  const json = localStorage.getItem(SAVE_KEY);
  if (!json) return null;
  try {
    const data = JSON.parse(json) as Partial<GameState>;
    return { state: data, message: randomLoadMessage() };
  } catch {
    return null;
  }
}

export function deleteSave(): void {
  localStorage.removeItem(SAVE_KEY);
}

/** Check if we should auto-save based on the day. */
export function shouldAutoSave(currentDay: number, lastSaveDay: number): boolean {
  return currentDay - lastSaveDay >= AUTO_SAVE_INTERVAL_DAYS;
}
