export type AgentStatus = "idle" | "working" | "error" | "rogue";

export interface AgentSettings {
  prioritizeProfit: boolean;
  safetyMode: boolean;
  autoFixErrors: boolean;
}

export interface Task {
  id: string;
  kind: "source" | "list" | "fulfill";
  label: string;
  ticksRemaining: number;
}

export interface Agent {
  id: string;
  name: string;
  tier: 1 | 2 | 3;
  status: AgentStatus;
  speed: number;
  accuracy: number;
  riskTolerance: number;
  cost: number;
  wage: number;
  traits: string[];
  bio: string;
  currentTask: Task | null;
  mood: string;
  settings: AgentSettings;
}

export type ProductQuality =
  | "unknown"
  | "bad"
  | "ok"
  | "good"
  | "excellent";

export interface Product {
  id: string;
  name: string;
  tier: 1 | 2 | 3;
  category: string;
  buyPrice: number;
  sellPrice: number;
  risk: number;
  quality: ProductQuality;
  inspected: boolean;
  hiddenTrait: string | null;
  listed: boolean;
  ticksToSell: number | null;
  inspectTicks: number | null;
  inspectType: "quick" | "deep" | null;
}

export interface InventoryItem {
  productId: string;
  count: number;
}

export interface Hardware {
  cpu: number;
  ram: number;
  cooling: number;
  storage: number;
}

export type EventLevel =
  | "system"
  | "agent"
  | "warning"
  | "danger"
  | "good"
  | "info";

export interface EventLog {
  id: string;
  timestamp: { day: number; hour: number; minute: number };
  level: EventLevel;
  source?: string;
  message: string;
  icon?: string;
}

export interface GameTime {
  day: number;
  hour: number;
  minute: number;
}

export type MailCategory = "sales" | "complaint" | "agent" | "system" | "spam";

export interface Mail {
  id: string;
  timestamp: { day: number; hour: number; minute: number };
  from: string;
  subject: string;
  body: string;
  category: MailCategory;
  read: boolean;
}

export interface GameStats {
  itemsSold: number;
  agentsHired: number;
  totalEarned: number;
  daysSurvived: number;
}

export interface GameState {
  money: number;
  time: GameTime;
  agents: Agent[];
  products: Product[];
  inventory: InventoryItem[];
  hardware: Hardware;
  heat: number;
  events: EventLog[];
  upgrades: Record<string, boolean>;
  activeApp: string | null;
  openWindows: string[];
  windowZOrder: string[];
  gameOver: boolean;
  gameOverReason: string | null;
  stats: GameStats;
  hireCandidates: Agent[];
  hireCandidatesDay: number;
  mails: Mail[];
  tier2Unlocked: boolean;
}
