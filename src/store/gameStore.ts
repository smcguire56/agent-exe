import { create } from "zustand";
import type {
  Agent,
  EventLog,
  GameStats,
  GameState,
  Hardware,
  Mail,
  Product,
  Task,
} from "../types";
import {
  STARTUP_MESSAGES,
  SOURCING_START_MESSAGES,
} from "../data/messages";
import { TIER_1_NAMES, TIER_2_NAMES } from "../data/agentNames";
import { pickTraits, generateBio, randomMood } from "../data/traits";
import { advanceTime, randomFrom, makeId } from "../systems/gameTick";
import { effectiveTaskTicks, getModifiers, effectiveWage } from "../systems/traitEffects";
import { randomMail, randomMailCategory, saleMailTemplate, complaintMailTemplate } from "../data/mails";
import { saveGame as saveToStorage, loadGame as loadFromStorage, shouldAutoSave, deleteSave as deleteStorageSave } from "../systems/saveSystem";
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

const HIRE_REFRESH_DAYS = 10;
const HIRE_CANDIDATE_COUNT = 3;

let eventCounter = 0;
const nextEventId = () => `evt_${Date.now()}_${eventCounter++}`;

export const TIER_2_UNLOCK_EARNED = 5000;
const TIER_2_HIRE_COST_MIN = 500;
const TIER_2_HIRE_COST_MAX = 2000;

function makeTier1Candidate(name: string): Agent {
  const traits = pickTraits(2);
  return {
    id: makeId("candidate"),
    name,
    tier: 1,
    status: "idle",
    speed: 2 + Math.floor(Math.random() * 4),
    accuracy: +(0.5 + Math.random() * 0.3).toFixed(2),
    riskTolerance: +Math.random().toFixed(2),
    cost: HIRE_COST,
    wage: 5,
    traits: traits as string[],
    bio: generateBio(name, traits),
    currentTask: null,
    mood: randomMood(),
    settings: { prioritizeProfit: false, safetyMode: true, autoFixErrors: false },
  };
}

function makeTier2Candidate(name: string): Agent {
  const traits = pickTraits(2);
  const cost = TIER_2_HIRE_COST_MIN + Math.floor(Math.random() * (TIER_2_HIRE_COST_MAX - TIER_2_HIRE_COST_MIN));
  return {
    id: makeId("candidate"),
    name,
    tier: 2,
    status: "idle",
    speed: 5 + Math.floor(Math.random() * 4),
    accuracy: +(0.8 + Math.random() * 0.1).toFixed(2),
    riskTolerance: +(0.4 + Math.random() * 0.4).toFixed(2),
    cost,
    wage: 15,
    traits: traits as string[],
    bio: generateBio(name, traits),
    currentTask: null,
    mood: randomMood(),
    settings: { prioritizeProfit: true, safetyMode: false, autoFixErrors: false },
  };
}

function generateCandidates(usedNames: Set<string>, tier2Unlocked = false): Agent[] {
  const t1Available = TIER_1_NAMES.filter((n) => !usedNames.has(n));
  const candidates: Agent[] = [];

  // Always generate Tier 1 candidates
  const t1Count = tier2Unlocked ? 2 : HIRE_CANDIDATE_COUNT;
  for (let i = 0; i < t1Count && t1Available.length > 0; i++) {
    const idx = Math.floor(Math.random() * t1Available.length);
    const name = t1Available.splice(idx, 1)[0];
    candidates.push(makeTier1Candidate(name));
  }

  // Add a Tier 2 candidate if unlocked
  if (tier2Unlocked) {
    const t2Available = TIER_2_NAMES.filter((n) => !usedNames.has(n));
    if (t2Available.length > 0) {
      const idx = Math.floor(Math.random() * t2Available.length);
      candidates.push(makeTier2Candidate(t2Available[idx]));
    }
  }

  return candidates;
}

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
    traits: ["Perfectionist", "Loyal"],
    bio: "Bryan (Perfectionist, Loyal): Will triple-check everything. Will also cry if you yell at him.",
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
    traits: ["Competitive", "Creative"],
    bio: "Pam (Competitive, Creative): Outperforms everyone. Wrote product descriptions in haiku once.",
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
  toggleWindow: (appId: string) => void;
  closeWindow: (appId: string) => void;
  focusWindow: (appId: string) => void;
  pushEvent: (e: Omit<EventLog, "id" | "timestamp">) => void;
  tick: () => void;
  assignTask: (agentId: string) => void;
  listProduct: (productId: string) => void;
  hireAgent: () => void;
  upgradeCpu: () => void;
  setPaused: (paused: boolean) => void;
  restart: () => void;
  hireCandidate: (candidateId: string) => void;
  refreshCandidates: () => void;
  inspectProduct: (productId: string, type: "quick" | "deep") => void;
  readMail: (mailId: string) => void;
  deleteMail: (mailId: string) => void;
  saveGame: () => void;
  loadSave: () => boolean;
  deleteSave: () => void;
  lastSaveDay: number;
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
  openWindows: [],
  windowZOrder: [],
  paused: false,
  gameOver: false,
  gameOverReason: null,
  stats: { ...initialStats },
  hireCandidates: generateCandidates(new Set(["Bryan", "Pam"]), false),
  hireCandidatesDay: 1,
  mails: [],
  lastSaveDay: 1,
  tier2Unlocked: false,

  setActiveApp: (app) => set({ activeApp: app }),
  toggleWindow: (appId) => {
    const { openWindows, windowZOrder } = get();
    if (openWindows.includes(appId)) {
      set({
        openWindows: openWindows.filter((w) => w !== appId),
        windowZOrder: windowZOrder.filter((w) => w !== appId),
      });
    } else {
      set({
        openWindows: [...openWindows, appId],
        windowZOrder: [...windowZOrder.filter((w) => w !== appId), appId],
      });
    }
  },
  closeWindow: (appId) => {
    const { openWindows, windowZOrder } = get();
    set({
      openWindows: openWindows.filter((w) => w !== appId),
      windowZOrder: windowZOrder.filter((w) => w !== appId),
    });
  },
  focusWindow: (appId) => {
    const { windowZOrder } = get();
    set({ windowZOrder: [...windowZOrder.filter((w) => w !== appId), appId] });
  },
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
    let agentMoneyDelta = 0;
    for (const agent of state.agents) {
      const result = processAgent(agent, newTime);
      newAgents.push(result.agent);
      workingProducts.push(...result.productsToAdd);
      eventsBatch.push(...result.eventsToAdd);
      agentMoneyDelta += result.moneyDelta;
    }

    // 2. Process products (listings tick down, may sell and disappear)
    // Compute team-wide complaint multiplier (Paranoid agents help)
    let teamComplaintMult = 1.0;
    for (const a of newAgents) {
      const mods = getModifiers(a);
      teamComplaintMult *= mods.complaintMult;
    }

    let moneyDelta = agentMoneyDelta;
    let heatDelta = 0;
    let itemsSoldThisTick = 0;
    let earnedThisTick = 0;
    const soldNames: { name: string; price: number }[] = [];
    let hadComplaint = false;
    let complaintProductName = "";
    const remainingProducts: Product[] = [];
    for (const p of workingProducts) {
      const result = processProduct(p, newTime, teamComplaintMult);
      if (result.product) {
        remainingProducts.push(result.product);
      } else {
        itemsSoldThisTick += 1;
        earnedThisTick += result.moneyDelta;
        soldNames.push({ name: p.name, price: result.moneyDelta });
      }
      if (result.heatDelta > 0) {
        hadComplaint = true;
        complaintProductName = p.name;
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

    // 5b. Daily wage deduction (on day change)
    if (newTime.day !== state.time.day) {
      let totalWages = 0;
      for (const a of newAgents) {
        totalWages += effectiveWage(a);
      }
      if (totalWages > 0) {
        moneyDelta -= totalWages;
        eventsBatch.push({
          timestamp: { ...newTime },
          level: "info",
          icon: "💸",
          message: `Daily wages paid: $${totalWages} across ${newAgents.length} agent(s).`,
        });
      }
    }

    const newHeat = Math.min(100, Math.max(0, state.heat + heatDelta));
    const newMoney = state.money + moneyDelta;

    // 6. Game over check
    let gameOver: boolean = state.gameOver;
    let gameOverReason: string | null = state.gameOverReason;
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

    // 6b. Tier 2 unlock check
    let newTier2 = state.tier2Unlocked;
    if (!newTier2 && newStats.totalEarned >= TIER_2_UNLOCK_EARNED) {
      newTier2 = true;
      eventsBatch.push({
        timestamp: { ...newTime },
        level: "system",
        icon: "🔓",
        message: "SHELLOS: New agent class detected. Competency level: concerning. Access granted.",
      });
      eventsBatch.push({
        timestamp: { ...newTime },
        level: "good",
        icon: "⚡",
        message: "Tier 2 agents and grey-market products are now available. Check AgentHQ.",
      });
    }

    // Refresh hire candidates every HIRE_REFRESH_DAYS
    const shouldRefresh =
      newTime.day !== state.time.day &&
      newTime.day - state.hireCandidatesDay >= HIRE_REFRESH_DAYS;
    // Also force refresh when tier 2 just unlocked
    const forceRefresh = newTier2 && !state.tier2Unlocked;
    const usedNames = new Set([...newAgents.map((a) => a.name)]);
    const newCandidates = (shouldRefresh || forceRefresh)
      ? generateCandidates(usedNames, newTier2)
      : state.hireCandidates;
    const newCandidatesDay = (shouldRefresh || forceRefresh) ? newTime.day : state.hireCandidatesDay;

    if (shouldRefresh) {
      eventsBatch.push({
        timestamp: { ...newTime },
        level: "info",
        icon: "📋",
        message: "New applicants have arrived. Check AgentHQ.",
      });
    }

    // 7. Generate mails from this tick's events
    const newMails: Mail[] = [...state.mails];
    const MAX_MAILS = 50;

    for (const sold of soldNames) {
      const tmpl = saleMailTemplate(sold.name, sold.price);
      newMails.push({
        ...tmpl,
        id: nextEventId(),
        timestamp: { ...newTime },
        read: false,
      });
    }
    if (hadComplaint) {
      const tmpl = complaintMailTemplate(complaintProductName);
      newMails.push({
        ...tmpl,
        id: nextEventId(),
        timestamp: { ...newTime },
        read: false,
      });
    }
    // Random spam/system mail (~5% chance per tick)
    if (Math.random() < 0.05) {
      const cat = randomMailCategory();
      const tmpl = randomMail(cat);
      newMails.push({
        ...tmpl,
        id: nextEventId(),
        timestamp: { ...newTime },
        read: false,
      });
    }
    // Trim old mails
    const trimmedMails = newMails.length > MAX_MAILS
      ? newMails.slice(newMails.length - MAX_MAILS)
      : newMails;

    // 8. Auto-save check
    const autoSave = newTime.day !== state.time.day &&
      shouldAutoSave(newTime.day, state.lastSaveDay);

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
      hireCandidates: newCandidates,
      hireCandidatesDay: newCandidatesDay,
      mails: trimmedMails,
      tier2Unlocked: newTier2,
    });

    if (autoSave && !gameOver) {
      get().saveGame();
    }
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
      openWindows: [],
      windowZOrder: [],
      gameOver: false,
      gameOverReason: null,
      stats: { ...initialStats },
      hireCandidates: generateCandidates(new Set(["Bryan", "Pam"]), false),
      hireCandidatesDay: 1,
      mails: [],
      lastSaveDay: 1,
      tier2Unlocked: false,
    });
  },

  assignTask: (agentId) => {
    const state = get();
    const agent = state.agents.find((a) => a.id === agentId);
    if (!agent || agent.status !== "idle") return;

    const ticks = effectiveTaskTicks(SOURCING_TASK_TICKS, agent);
    const task: Task = {
      id: makeId("task"),
      kind: "source",
      label: "Sourcing... something",
      ticksRemaining: ticks,
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

    // Creative agents boost sell price
    let bonus = 0;
    for (const a of state.agents) {
      const mods = getModifiers(a);
      if (mods.sellPriceBonus > 0) {
        bonus = Math.max(bonus, mods.sellPriceBonus);
      }
    }
    const boostedPrice = target.sellPrice + bonus;

    set({
      products: state.products.map((p) =>
        p.id === productId
          ? { ...p, listed: true, ticksToSell: SALE_TICKS, sellPrice: boostedPrice }
          : p,
      ),
      events: appendEvents(state.events, [
        {
          timestamp: { ...state.time },
          level: "info",
          icon: "🏷️",
          message: `Listed "${target.name}" for $${boostedPrice}.${bonus > 0 ? ` (+$${bonus} creative bonus!)` : ' Description is "technically accurate."'}`,
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
      bio: "",
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

  hireCandidate: (candidateId) => {
    const state = get();
    const candidate = state.hireCandidates.find((c) => c.id === candidateId);
    if (!candidate) return;

    const cap = maxAgents(state.hardware);
    if (state.agents.length >= cap) {
      set({
        events: appendEvents(state.events, [
          {
            timestamp: { ...state.time },
            level: "warning",
            icon: "🚫",
            message: "No free CPU slots. Upgrade hardware first.",
          },
        ]),
      });
      return;
    }
    if (state.money < candidate.cost) {
      set({
        events: appendEvents(state.events, [
          {
            timestamp: { ...state.time },
            level: "warning",
            icon: "💸",
            message: `Can't afford to hire ${candidate.name}. Need $${candidate.cost}.`,
          },
        ]),
      });
      return;
    }

    const hired: Agent = { ...candidate, id: makeId("agent"), status: "idle", currentTask: null };
    set({
      money: state.money - candidate.cost,
      agents: [...state.agents, hired],
      hireCandidates: state.hireCandidates.filter((c) => c.id !== candidateId),
      stats: { ...state.stats, agentsHired: state.stats.agentsHired + 1 },
      events: appendEvents(state.events, [
        {
          timestamp: { ...state.time },
          level: "good",
          icon: "🤝",
          message: `Hired ${hired.name}. ${hired.bio}`,
        },
      ]),
    });
  },

  refreshCandidates: () => {
    const state = get();
    const usedNames = new Set(state.agents.map((a) => a.name));
    set({
      hireCandidates: generateCandidates(usedNames, state.tier2Unlocked),
      hireCandidatesDay: state.time.day,
    });
  },

  inspectProduct: (productId, type) => {
    const state = get();
    const product = state.products.find((p) => p.id === productId);
    if (!product || product.inspected || product.inspectTicks !== null || product.listed) return;

    const cost = type === "quick" ? 5 : 20;
    const ticks = type === "quick" ? 1 : 3;

    if (state.money < cost) {
      set({
        events: appendEvents(state.events, [
          {
            timestamp: { ...state.time },
            level: "warning",
            icon: "💸",
            message: `Inspection costs $${cost}. You have $${state.money}.`,
          },
        ]),
      });
      return;
    }

    set({
      money: state.money - cost,
      products: state.products.map((p) =>
        p.id === productId
          ? { ...p, inspectTicks: ticks, inspectType: type }
          : p,
      ),
      events: appendEvents(state.events, [
        {
          timestamp: { ...state.time },
          level: "info",
          icon: type === "quick" ? "🔎" : "🔍",
          message: `${type === "quick" ? "Quick" : "Deep"} inspection started on "${product.name}" ($${cost}).`,
        },
      ]),
    });
  },

  readMail: (mailId) => {
    set((state) => ({
      mails: state.mails.map((m) =>
        m.id === mailId ? { ...m, read: true } : m,
      ),
    }));
  },

  deleteMail: (mailId) => {
    set((state) => ({
      mails: state.mails.filter((m) => m.id !== mailId),
    }));
  },

  saveGame: () => {
    const state = get();
    const msg = saveToStorage(state);
    set({
      lastSaveDay: state.time.day,
      events: appendEvents(state.events, [
        {
          timestamp: { ...state.time },
          level: "system",
          icon: "💾",
          message: msg,
        },
      ]),
    });
  },

  loadSave: () => {
    const result = loadFromStorage();
    if (!result) return false;
    set({
      ...result.state,
      events: appendEvents(result.state.events ?? [], [
        {
          timestamp: { ...(result.state.time ?? { day: 1, hour: 9, minute: 0 }) },
          level: "system",
          icon: "💾",
          message: result.message,
        },
      ]),
    });
    return true;
  },

  deleteSave: () => {
    deleteStorageSave();
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
