import { create } from "zustand";
import type {
  Agent,
  EventLog,
  GameStats,
  GameState,
  Hardware,
  Product,
  Task,
} from "../types";
import {
  STARTUP_MESSAGES,
  SOURCING_START_MESSAGES,
} from "../data/messages";
import { TIER_1_NAMES } from "../data/agentNames";
import { advanceTime, randomFrom, makeId } from "../systems/gameTick";
import { processAgent } from "../systems/agentSystem";
import { processProduct } from "../systems/productSystem";
import {
  rollRandomEvent,
  rollHighHeatWarning,
  getGameOverMessage,
  HEAT_DECAY_PER_TICK,
  HEAT_GAME_OVER,
} from "../systems/eventSystem";

const MAX_EVENTS = 200;
const TRIM_TO = 150;
const SOURCING_TASK_TICKS = 5;
const SALE_TICKS = 6;
export const UPGRADE_CPU_COST = 1000;
export const HIRE_COST = 100;

export function maxAgents(hardware: Hardware): number {
  return hardware.cpu;
}

let eventCounter = 0;
const nextEventId = () => `evt_${Date.now()}_${eventCounter++}`;

const initialStats: GameStats = {
  itemsSold: 0,
  agentsHired: 0,
  totalEarned: 0,
  daysSurvived: 1,
};

const buildPlaceholderAgents = (): Agent[] => [
  {
    id: "agent_bryan",
    name: "Bryan",
    tier: 1,
    status: "idle",
    speed: 3,
    accuracy: 0.7,
    riskTolerance: 0.3,
    cost: 100,
    wage: 5,
    traits: ["forgetful", "earnest"],
    currentTask: null,
    mood: "tired but optimistic",
    settings: {
      prioritizeProfit: false,
      safetyMode: true,
      autoFixErrors: false,
    },
  },
  {
    id: "agent_pam",
    name: "Pam",
    tier: 1,
    status: "working",
    speed: 4,
    accuracy: 0.65,
    riskTolerance: 0.5,
    cost: 100,
    wage: 5,
    traits: ["chatty"],
    currentTask: {
      id: "task_pam_1",
      kind: "source",
      label: "Sourcing knockoff sunglasses",
      ticksRemaining: 6,
    },
    mood: "caffeinated",
    settings: {
      prioritizeProfit: true,
      safetyMode: false,
      autoFixErrors: false,
    },
  },
];

const seedEvents = (): EventLog[] => {
  const t = { day: 1, hour: 9, minute: 0 };
  return [
    {
      id: nextEventId(),
      timestamp: t,
      level: "system",
      icon: "💾",
      message: STARTUP_MESSAGES[0],
    },
    {
      id: nextEventId(),
      timestamp: t,
      level: "system",
      icon: "🧠",
      message: STARTUP_MESSAGES[1],
    },
    {
      id: nextEventId(),
      timestamp: t,
      level: "info",
      icon: "🛰️",
      message: STARTUP_MESSAGES[2],
    },
    {
      id: nextEventId(),
      timestamp: t,
      level: "good",
      icon: "✨",
      message: STARTUP_MESSAGES[3],
    },
    {
      id: nextEventId(),
      timestamp: t,
      level: "agent",
      source: "Bryan",
      icon: "🤖",
      message: "Booted up. Asking what we're doing today. Several times.",
    },
    {
      id: nextEventId(),
      timestamp: t,
      level: "agent",
      source: "Pam",
      icon: "🤖",
      message:
        "Started sourcing knockoff sunglasses. Says they 'looked legit on the website.'",
    },
    {
      id: nextEventId(),
      timestamp: t,
      level: "warning",
      icon: "⚠️",
      message:
        "WARNING: A subreddit has noticed your store. Heat is technically zero. For now.",
    },
  ];
};

interface GameStore extends GameState {
  paused: boolean;
  setActiveApp: (app: string | null) => void;
  pushEvent: (e: Omit<EventLog, "id" | "timestamp">) => void;
  tick: () => void;
  assignTask: (agentId: string) => void;
  listProduct: (productId: string) => void;
  hireAgent: () => void;
  upgradeCpu: () => void;
  setPaused: (paused: boolean) => void;
  restart: () => void;
  devSet: (patch: Partial<GameState>) => void;
}

function appendEvents(
  existing: EventLog[],
  toAdd: Omit<EventLog, "id">[],
): EventLog[] {
  const next = existing.concat(
    toAdd.map((e) => ({ ...e, id: nextEventId() })),
  );
  if (next.length > MAX_EVENTS) {
    return next.slice(next.length - TRIM_TO);
  }
  return next;
}

export const useGameStore = create<GameStore>((set, get) => ({
  money: 500,
  time: { day: 1, hour: 9, minute: 0 },
  agents: buildPlaceholderAgents(),
  products: [],
  inventory: [],
  hardware: { cpu: 2, ram: 1, cooling: 1, storage: 1 },
  heat: 12,
  events: seedEvents(),
  upgrades: {},
  activeApp: null,
  paused: false,
  gameOver: false,
  gameOverReason: null,
  stats: { ...initialStats },

  setActiveApp: (app) => set({ activeApp: app }),
  setPaused: (paused) => set({ paused }),

  pushEvent: (e) =>
    set((state) => ({
      events: appendEvents(state.events, [
        { ...e, timestamp: { ...state.time } },
      ]),
    })),

  tick: () => {
    // Note: pause is enforced by the interval caller in App.tsx, not here.
    // Calling tick() directly always advances state — useful for tests.
    const state = get();
    if (state.gameOver) return;

    const newTime = advanceTime(state.time);
    const newAgents: Agent[] = [];
    let workingProducts: Product[] = state.products.slice();
    const eventsBatch: Omit<EventLog, "id">[] = [];

    // 1. Process agents (may add new products)
    for (const agent of state.agents) {
      const result = processAgent(agent, newTime);
      newAgents.push(result.agent);
      workingProducts.push(...result.productsToAdd);
      eventsBatch.push(...result.eventsToAdd);
    }

    // 2. Process products (listings tick down, may sell and disappear)
    let moneyDelta = 0;
    let heatDelta = 0;
    let itemsSoldThisTick = 0;
    let earnedThisTick = 0;
    const remainingProducts: Product[] = [];
    for (const p of workingProducts) {
      const result = processProduct(p, newTime);
      if (result.product) {
        remainingProducts.push(result.product);
      } else {
        // Product was removed because it sold
        itemsSoldThisTick += 1;
        earnedThisTick += result.moneyDelta;
      }
      moneyDelta += result.moneyDelta;
      heatDelta += result.heatDelta;
      eventsBatch.push(...result.eventsToAdd);
    }

    // 3. Random chaos event
    const rolled = rollRandomEvent();
    if (rolled) {
      eventsBatch.push({ ...rolled.event, timestamp: { ...newTime } });
      moneyDelta += rolled.moneyDelta;
      heatDelta += rolled.heatDelta;
    }

    // 4. High-heat warnings (doom flavor)
    const warning = rollHighHeatWarning(state.heat);
    if (warning) {
      eventsBatch.push({ ...warning.event, timestamp: { ...newTime } });
      moneyDelta += warning.moneyDelta;
      heatDelta += warning.heatDelta;
    }

    // 5. Passive heat decay
    heatDelta -= HEAT_DECAY_PER_TICK;

    const newHeat = Math.min(100, Math.max(0, state.heat + heatDelta));
    const newMoney = state.money + moneyDelta;

    // 6. Game over check
    let gameOver = state.gameOver;
    let gameOverReason = state.gameOverReason;
    if (!gameOver && newHeat >= HEAT_GAME_OVER) {
      gameOver = true;
      gameOverReason = getGameOverMessage();
      eventsBatch.push({
        timestamp: { ...newTime },
        level: "danger",
        icon: "🚨",
        message: "HEAT CRITICAL — the run is over. Someone just kicked in the door.",
      });
    }

    const newStats: GameStats = {
      itemsSold: state.stats.itemsSold + itemsSoldThisTick,
      agentsHired: state.stats.agentsHired,
      totalEarned: state.stats.totalEarned + earnedThisTick,
      daysSurvived: Math.max(state.stats.daysSurvived, newTime.day),
    };

    set({
      time: newTime,
      agents: newAgents,
      products: remainingProducts,
      money: newMoney,
      heat: newHeat,
      events: appendEvents(state.events, eventsBatch),
      gameOver,
      gameOverReason,
      stats: newStats,
    });
  },

  devSet: (patch) => set(patch as Partial<GameStore>),

  restart: () => {
    set({
      money: 500,
      time: { day: 1, hour: 9, minute: 0 },
      agents: buildPlaceholderAgents(),
      products: [],
      inventory: [],
      hardware: { cpu: 2, ram: 1, cooling: 1, storage: 1 },
      heat: 12,
      events: seedEvents(),
      upgrades: {},
      activeApp: null,
      gameOver: false,
      gameOverReason: null,
      stats: { ...initialStats },
    });
  },

  assignTask: (agentId) => {
    const state = get();
    const agent = state.agents.find((a) => a.id === agentId);
    if (!agent || agent.status !== "idle") return;

    const task: Task = {
      id: makeId("task"),
      kind: "source",
      label: "Sourcing... something",
      ticksRemaining: SOURCING_TASK_TICKS,
    };

    const updatedAgent: Agent = {
      ...agent,
      status: "working",
      currentTask: task,
      mood: "locked in",
    };

    set({
      agents: state.agents.map((a) =>
        a.id === agentId ? updatedAgent : a,
      ),
      events: appendEvents(state.events, [
        {
          timestamp: { ...state.time },
          level: "agent",
          source: agent.name,
          icon: "🤖",
          message: randomFrom(SOURCING_START_MESSAGES),
        },
      ]),
    });
  },

  listProduct: (productId) => {
    const state = get();
    const target = state.products.find((p) => p.id === productId);
    if (!target || target.listed) return;

    set({
      products: state.products.map((p) =>
        p.id === productId
          ? { ...p, listed: true, ticksToSell: SALE_TICKS }
          : p,
      ),
      events: appendEvents(state.events, [
        {
          timestamp: { ...state.time },
          level: "info",
          icon: "🏷️",
          message: `Listed "${target.name}" for $${target.sellPrice}. Description is "technically accurate."`,
        },
      ]),
    });
  },

  hireAgent: () => {
    const state = get();
    const cap = maxAgents(state.hardware);
    if (state.agents.length >= cap) {
      set({
        events: appendEvents(state.events, [
          {
            timestamp: { ...state.time },
            level: "warning",
            icon: "🚫",
            message:
              "Hiring denied. CPU can't handle any more friends. Upgrade hardware first.",
          },
        ]),
      });
      return;
    }
    if (state.money < HIRE_COST) {
      set({
        events: appendEvents(state.events, [
          {
            timestamp: { ...state.time },
            level: "warning",
            icon: "💸",
            message: `Cannot afford to hire. Need $${HIRE_COST}.`,
          },
        ]),
      });
      return;
    }

    const usedNames = new Set(state.agents.map((a) => a.name));
    const available = TIER_1_NAMES.filter((n) => !usedNames.has(n));
    const name =
      available.length > 0
        ? randomFrom(available)
        : `Employee_${Math.floor(Math.random() * 1000)}`;

    const newAgent: Agent = {
      id: makeId("agent"),
      name,
      tier: 1,
      status: "idle",
      speed: 2 + Math.floor(Math.random() * 4),
      accuracy: 0.5 + Math.random() * 0.3,
      riskTolerance: Math.random(),
      cost: HIRE_COST,
      wage: 5,
      traits: [],
      currentTask: null,
      mood: "ready to disappoint",
      settings: {
        prioritizeProfit: false,
        safetyMode: true,
        autoFixErrors: false,
      },
    };

    set({
      money: state.money - HIRE_COST,
      agents: [...state.agents, newAgent],
      stats: { ...state.stats, agentsHired: state.stats.agentsHired + 1 },
      events: appendEvents(state.events, [
        {
          timestamp: { ...state.time },
          level: "good",
          icon: "🤝",
          message: `Hired ${name}. They arrived with a gym bag full of USB cables. No one asked.`,
        },
      ]),
    });
  },

  upgradeCpu: () => {
    const state = get();
    if (state.money < UPGRADE_CPU_COST) {
      set({
        events: appendEvents(state.events, [
          {
            timestamp: { ...state.time },
            level: "warning",
            icon: "💸",
            message: `Upgrade denied. CPU upgrade costs $${UPGRADE_CPU_COST}.`,
          },
        ]),
      });
      return;
    }

    const newLevel = state.hardware.cpu + 1;
    set({
      money: state.money - UPGRADE_CPU_COST,
      hardware: { ...state.hardware, cpu: newLevel },
      events: appendEvents(state.events, [
        {
          timestamp: { ...state.time },
          level: "good",
          icon: "⚡",
          message: `CPU upgraded to lv ${newLevel}. It hums louder now. Probably fine.`,
        },
        {
          timestamp: { ...state.time },
          level: "system",
          icon: "🔓",
          message: `New agent slot unlocked. Max agents: ${newLevel}.`,
        },
      ]),
    });
  },
}));
