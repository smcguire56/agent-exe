// ── Temperature constants ────────────────────────────────────────

/** Floor temperature — system never goes below this. */
export const TEMP_BASE = 30;

/** °C added per working agent per tick. */
export const TEMP_PER_WORKING = 5;

/** °C added per idle agent per tick (still online, still running). */
export const TEMP_PER_IDLE = 1;

/** Temperature resets to this after a meltdown. */
export const TEMP_MELTDOWN_RESET = 40;

/** Ticks agents cannot be reassigned after a meltdown. */
export const AGENT_COOLDOWN_TICKS = 10;

/** How long hardware damage lasts (ticks). */
export const HARDWARE_DAMAGE_TICKS = 50;

// ── Cooling dissipation by level ─────────────────────────────────

const COOLING_TABLE: Record<number, number> = {
  1: 3,
  2: 6,
  3: 10,
  4: 15,
  5: 22,
};

/** °C dissipated per tick at a given cooling level. */
export function getCoolingDissipation(level: number): number {
  if (level <= 0) return 0;
  if (level in COOLING_TABLE) return COOLING_TABLE[level];
  // Extrapolate beyond level 5
  return 22 + (level - 5) * 5;
}

// ── Temperature zones ────────────────────────────────────────────

export type TempZone = "normal" | "warm" | "hot" | "critical" | "meltdown";

export function getTempZone(temp: number): TempZone {
  if (temp >= 95) return "meltdown";
  if (temp >= 85) return "critical";
  if (temp >= 70) return "hot";
  if (temp >= 50) return "warm";
  return "normal";
}

/** Tailwind classes for displaying temperature based on zone. */
export function getTempClasses(zone: TempZone): string {
  switch (zone) {
    case "meltdown":  return "text-shell-danger animate-meltdown-flash";
    case "critical":  return "text-shell-danger animate-suspicion-pulse";
    case "hot":       return "text-orange-400 animate-suspicion-pulse";
    case "warm":      return "text-shell-warn";
    default:          return "text-shell-good";
  }
}

// ── Zone transition log messages ─────────────────────────────────

export const ZONE_ENTER_MESSAGES: Record<TempZone, { level: string; icon: string; messages: string[] }> = {
  normal: { level: "system", icon: "🌡️", messages: ["SYSTEM: Temperature nominal. Everything is fine."] },
  warm: {
    level: "warning",
    icon: "🌡️",
    messages: [
      "SYSTEM: CPU fan spinning up. Bryan comments that it's 'a bit toasty in here.'",
      "SYSTEM: Thermal sensors reporting elevated readings. Consider cooling upgrades.",
    ],
  },
  hot: {
    level: "warning",
    icon: "⚠️",
    messages: [
      "⚠️ THERMAL WARNING: Performance degraded. Consider upgrading cooling.",
      "[Bryan] 'Is it just me or is the room actually melting?'",
    ],
  },
  critical: {
    level: "danger",
    icon: "🔥",
    messages: [
      "🔥 CRITICAL TEMPERATURE: System unstable!",
      "[Bryan] 'I can smell the motherboard. That's not good, right?'",
    ],
  },
  meltdown: {
    level: "danger",
    icon: "💀",
    messages: [
      "💀 SYSTEM CRASH — Emergency shutdown triggered",
      "SHELLOS: Rebooting... please don't do that again.",
      "[Bryan] '...are we dead? Is this the afterlife? Oh wait we're back.'",
    ],
  },
};

// ── Thermal task-failure chances ─────────────────────────────────

/** Chance per tick that a working agent's task fails due to heat. */
export const THERMAL_FAIL_CHANCE: Partial<Record<TempZone, number>> = {
  hot: 0.10,
  critical: 0.20,
};

export const THERMAL_FAIL_MESSAGES = [
  "Task process killed by kernel. Thermal event logged.",
  "Operation terminated: thermal protection engaged.",
  "Task aborted. The CPU refused to continue under these conditions.",
  "Process died quietly. The heat got to it.",
];
