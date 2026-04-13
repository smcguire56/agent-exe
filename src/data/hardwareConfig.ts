// ── Hardware upgrade tiers ────────────────────────────────────────
// Index = level - 1 (level 1 = index 0, level 5 = index 4)
// cost = cost to reach THIS level from the previous one

export const MAX_HW_LEVEL = 5;

// ── CPU — agent slots ─────────────────────────────────────────────

interface CpuTier { slots: number; cost: number; flavor: string }

export const CPU_TIERS: CpuTier[] = [
  { slots: 2,  cost: 0,      flavor: "Minimum viable processing. Holding together." },
  { slots: 3,  cost: 1000,   flavor: "It's doing its best." },
  { slots: 4,  cost: 3000,   flavor: "You can feel the difference. Sort of." },
  { slots: 6,  cost: 8000,   flavor: "Parallel processes. You're serious now." },
  { slots: 8,  cost: 20000,  flavor: "Classified military surplus. Don't ask." },
];

export function getCpuSlots(level: number): number {
  return CPU_TIERS[Math.min(level, MAX_HW_LEVEL) - 1]?.slots ?? 2;
}

// ── RAM — agent task speed ────────────────────────────────────────

interface RamTier { speedMult: number; cost: number; flavor: string }

export const RAM_TIERS: RamTier[] = [
  { speedMult: 1.00, cost: 0,      flavor: "One thing at a time. Literally." },
  { speedMult: 1.25, cost: 750,    flavor: "The agents noticed. Bryan is noticeably peppier." },
  { speedMult: 1.50, cost: 2000,   flavor: "50% faster. Bryan is sweating. Productively." },
  { speedMult: 2.00, cost: 6000,   flavor: "Multitask mode. Two streams, twice the chaos." },
  { speedMult: 2.00, cost: 15000,  flavor: "Is this even RAM anymore? It's warm to the touch." },
];

export function getRamSpeedMult(level: number): number {
  return RAM_TIERS[Math.min(level, MAX_HW_LEVEL) - 1]?.speedMult ?? 1.0;
}

// ── Cooling — temperature dissipation ────────────────────────────
// Note: actual dissipation (°C/tick) is in temperatureSystem.ts
// This file just provides upgrade costs and flavor text.

interface CoolingTier { cost: number; flavor: string }

export const COOLING_TIERS: CoolingTier[] = [
  { cost: 0,      flavor: "NOTE: the fan is making 'the sound.' Again." },
  { cost: 500,    flavor: "The fan sounds slightly less like a dying animal." },
  { cost: 1500,   flavor: "Liquid cooling installed. It gurgles sometimes." },
  { cost: 4000,   flavor: "Cryo unit. The desk is frosting over." },
  { cost: 12000,  flavor: "Suspicious cooling unit. Where did this come from? Why is it humming a tune?" },
];

// ── Storage — max inventory ───────────────────────────────────────

interface StorageTier { maxItems: number; cost: number; flavor: string }

export const STORAGE_TIERS: StorageTier[] = [
  { maxItems: 20,  cost: 0,      flavor: "20 item limit. You live in an apartment." },
  { maxItems: 50,  cost: 400,    flavor: "Added a shelf. Revolutionary." },
  { maxItems: 100, cost: 1200,   flavor: "Second shelf. Engineering at its finest." },
  { maxItems: 250, cost: 3500,   flavor: "Cargo bay extension. Things are getting serious." },
  { maxItems: 500, cost: 10000,  flavor: "The warehouse. You can hear echoes in here." },
];

export function getStorageMax(level: number): number {
  return STORAGE_TIERS[Math.min(level, MAX_HW_LEVEL) - 1]?.maxItems ?? 20;
}

// ── Generic helpers ───────────────────────────────────────────────

/** Cost to upgrade from currentLevel to currentLevel+1. Returns null if maxed. */
export function getUpgradeCost(
  tiers: { cost: number }[],
  currentLevel: number,
): number | null {
  if (currentLevel >= MAX_HW_LEVEL) return null;
  return tiers[currentLevel]?.cost ?? null; // tiers[currentLevel] = next level (0-indexed)
}

/** System status flavor based on average component level. */
export function getSystemStatus(cpu: number, ram: number, cooling: number, storage: number): string {
  const avg = (cpu + ram + cooling + storage) / 4;
  if (avg >= 4.5) return "This machine should not exist. Yet here we are.";
  if (avg >= 3.0) return "Actually kind of impressive.";
  if (avg >= 2.0) return "Held together with duct tape and optimism.";
  return "Running on hopes and prayers.";
}

/** Install log messages by component. */
export const INSTALL_MESSAGES: Record<string, string[]> = {
  cpu:     [
    "CPU upgrade installed. Your agents can feel the difference. Bryan is emotional about it.",
    "New CPU slotted in. Extra cores spinning up. The room is warmer.",
  ],
  ram:     [
    "RAM upgrade installed. Everything feels faster. Suspiciously faster.",
    "RAM expansion complete. Agents are processing at concerning speed.",
  ],
  cooling: [
    "Cooling upgrade installed. Temperature dropping. Bryan says it's 'nippy.'",
    "Thermal solution upgraded. The humming has changed pitch.",
  ],
  storage: [
    "Storage expanded. More room for questionable inventory.",
    "New storage mounted. It creaks a little. Probably fine.",
  ],
};
