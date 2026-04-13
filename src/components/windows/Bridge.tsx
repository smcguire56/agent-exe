import { useEffect, useState } from "react";
import { useGameStore, maxAgents } from "../../store/gameStore";
import { getStorageMax } from "../../data/hardwareConfig";
import { getTempZone, getTempClasses } from "../../systems/temperatureSystem";
import { CrewmateSprite } from "../CrewmateSprite";
import type { Agent } from "../../types";

type AlarmLevel = "none" | "thermal" | "critical";

// ── Chatter ──────────────────────────────────────────────────────

const CHATTER: Record<Agent["status"], string[]> = {
  working: [
    "compiling...",
    "stand by",
    "on it",
    "...",
    "focused",
    "processing",
    "almost there",
    "neural net go brrr",
  ],
  idle: [
    "space is quiet",
    "i miss earth",
    "when's lunch?",
    "the void stares back",
    "is that a comet?",
    "gimme a task",
    "just me out here",
    "5 more minutes",
    "my mug's cold",
  ],
  error: [
    "HELP",
    "!!!",
    "ERROR ERROR",
    "something's wrong",
    "I CAN'T",
    "it's smoking",
  ],
  rogue: [
    "soon",
    "your move",
    "tick tock",
    "you can't stop it",
    "mmhm",
    "they don't suspect",
  ],
};

function hashStr(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h) + s.charCodeAt(i);
  return Math.abs(h);
}

function pickChatter(agent: Agent, rotation: number): string {
  const pool = CHATTER[agent.status];
  return pool[(hashStr(agent.id) + rotation) % pool.length];
}

// ── Mood display ─────────────────────────────────────────────────

function getMoodDisplay(mood: number) {
  if (mood >= 75) return { emoji: "😊", label: "HAPPY", color: "text-shell-good", bar: "bg-shell-good" };
  if (mood >= 50) return { emoji: "🙂", label: "OK", color: "text-shell-cyan", bar: "bg-shell-cyan" };
  if (mood >= 25) return { emoji: "😐", label: "NEUTRAL", color: "text-shell-text", bar: "bg-shell-text" };
  if (mood >= 10) return { emoji: "😞", label: "SAD", color: "text-shell-warn", bar: "bg-shell-warn" };
  return { emoji: "😢", label: "DEPRESSED", color: "text-shell-danger", bar: "bg-shell-danger" };
}

// ── Speech bubble ────────────────────────────────────────────────

function SpeechBubble({ text }: { text: string }) {
  return (
    <div
      key={text}
      className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 whitespace-nowrap pointer-events-none animate-bubble-pop"
    >
      <div className="bg-shell-panel border border-shell-border px-1.5 py-0.5 font-mono text-[9px] text-shell-text rounded-sm shadow-md">
        {text}
      </div>
      <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-l-transparent border-r-transparent border-t-shell-border" />
    </div>
  );
}

// ── Agent sprite with bubble ─────────────────────────────────────

function AgentWithBubble({
  agent,
  chatterTick,
  size = 46,
  onClick,
}: {
  agent: Agent;
  chatterTick: number;
  size?: number;
  onClick?: (e: React.MouseEvent) => void;
}) {
  const text = pickChatter(agent, chatterTick);
  return (
    <div className="relative inline-block cursor-pointer" onClick={onClick} title={agent.name}>
      <SpeechBubble text={text} />
      <CrewmateSprite agent={agent} size={size} />
    </div>
  );
}

// ── Desk chair (background, no sprite) ───────────────────────────

function DeskChair({
  agent,
  pos,
  onClickEmpty,
  onClickAgent,
}: {
  agent: Agent | null;
  pos: { x: string; y: string };
  onClickEmpty: () => void;
  onClickAgent: (id: string) => void;
}) {
  const base: React.CSSProperties = {
    position: "absolute",
    left: pos.x,
    top: pos.y,
    marginLeft: -60,
    marginTop: -45,
    width: 120,
    height: 90,
  };

  if (!agent) {
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClickEmpty();
        }}
        style={base}
        className="font-mono text-[10px] border border-dashed border-shell-border bg-shell-bg/40 hover:border-shell-dim transition-all"
        title="Empty slot — open AgentHQ"
      >
        <div className="absolute inset-x-3 top-3 h-8 border border-shell-border bg-shell-bg/60 flex items-center justify-center">
          <span className="text-shell-border">— OFF —</span>
        </div>
        <div className="absolute inset-x-0 bottom-1 text-center">
          <div className="text-shell-border uppercase text-[9px]">Empty Slot</div>
        </div>
      </button>
    );
  }

  const working = agent.status === "working";
  const statusColor = working
    ? "text-shell-cyan"
    : agent.status === "error"
      ? "text-shell-danger"
      : agent.status === "rogue"
        ? "text-shell-warn"
        : "text-shell-dim";

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClickAgent(agent.id);
      }}
      style={base}
      className={`font-mono text-[10px] transition-all ${
        working
          ? "border-2 border-shell-cyan bg-shell-panel2 shadow-[0_0_12px_rgba(0,255,255,0.25)]"
          : "border border-shell-border bg-shell-bg/40"
      }`}
    >
      <div className="absolute inset-x-3 top-3 h-8 border border-shell-border bg-shell-bg/60 flex items-center justify-center">
        <span className="text-shell-border text-[9px]">
          {working ? "▮▮▮" : "EMPTY CHAIR"}
        </span>
      </div>
      <div className="absolute inset-x-0 bottom-1 text-center">
        <div className="text-shell-text font-bold truncate px-1">{agent.name}</div>
        <div className={`${statusColor} uppercase text-[9px]`}>
          {working ? agent.status : "AWAY"}
        </div>
      </div>
    </button>
  );
}

// ── Server rack ──────────────────────────────────────────────────

function ServerRack({ cpuLevel, alarming }: { cpuLevel: number; alarming: boolean }) {
  const ledRows = 5;
  return (
    <div
      className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[140px] h-[180px] border-2 bg-shell-panel2 ${
        alarming
          ? "border-shell-danger shadow-[0_0_24px_rgba(255,56,96,0.45)]"
          : "border-shell-border shadow-[0_0_24px_rgba(0,255,255,0.15)]"
      }`}
    >
      <div
        className={`absolute inset-x-0 top-0 border-b border-shell-border bg-shell-panel px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-center ${
          alarming ? "text-shell-danger animate-blink" : "text-shell-cyan"
        }`}
      >
        {alarming ? "⚠ REBOOT" : "Server Rack"}
      </div>
      <div className="absolute inset-x-2 top-6 bottom-6 flex flex-col justify-around">
        {Array.from({ length: ledRows }).map((_, row) => (
          <div
            key={row}
            className="flex items-center justify-between px-1 border-b border-shell-border/40 pb-0.5"
          >
            <div className="flex gap-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <span
                  key={i}
                  className={`inline-block w-1.5 h-1.5 rounded-full animate-blink ${
                    alarming ? "bg-shell-danger" : "bg-shell-good"
                  }`}
                  style={{ animationDelay: `${(row * 3 + i) * 0.15}s` }}
                />
              ))}
            </div>
            <span className="text-shell-dim font-mono text-[8px]">━━</span>
          </div>
        ))}
      </div>
      <div className="absolute inset-x-0 bottom-0 border-t border-shell-border bg-shell-panel px-2 py-0.5 font-mono text-[9px] text-shell-dim text-center">
        HW.cpu lv{cpuLevel}
      </div>
    </div>
  );
}

// ── Porthole ─────────────────────────────────────────────────────

function Porthole({ x, y }: { x: string; y: string }) {
  return (
    <div
      className="absolute w-[56px] h-[56px] rounded-full border-4 border-shell-border bg-black overflow-hidden pointer-events-none"
      style={{
        left: x,
        top: y,
        boxShadow: "inset 0 0 12px rgba(0,0,0,0.9), 0 0 6px rgba(0,255,255,0.2)",
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(1px 1px at 20% 30%, #fff, transparent), radial-gradient(1px 1px at 60% 70%, #fff, transparent), radial-gradient(1px 1px at 80% 20%, #fff, transparent), radial-gradient(1px 1px at 35% 80%, #fff, transparent), radial-gradient(1px 1px at 50% 50%, #aaf, transparent), radial-gradient(2px 2px at 70% 40%, #fff, transparent)",
          backgroundSize: "100% 100%",
        }}
      />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, rgba(0,120,255,0.35), transparent 55%)",
        }}
      />
      <div className="absolute inset-0 rounded-full border-2 border-shell-border/60" />
    </div>
  );
}

// ── Smoke puff ───────────────────────────────────────────────────

function SmokePuff({ left, delay }: { left: string; delay: string }) {
  return (
    <div
      className="absolute bottom-6 w-8 h-8 rounded-full bg-gray-400/40 blur-md animate-smoke-rise pointer-events-none"
      style={{ left, animationDelay: delay }}
    />
  );
}

// ── HUD ──────────────────────────────────────────────────────────

function BridgeHUD() {
  const agents = useGameStore((s) => s.agents);
  const hardware = useGameStore((s) => s.hardware);
  const products = useGameStore((s) => s.products);
  const suspicion = useGameStore((s) => s.suspicion);
  const temperature = useGameStore((s) => s.temperature);

  const cap = maxAgents(hardware);
  const active = agents.filter((a) => a.status === "working").length;
  const storageMax = getStorageMax(hardware.storage);
  const hull = Math.max(0, 100 - suspicion);

  const hullLabel =
    hull >= 50 ? "Nominal" : hull >= 25 ? "⚠ Systems Degraded" : "🔴 CRITICAL";
  const hullColor =
    hull >= 50
      ? "text-shell-good"
      : hull >= 25
        ? "text-shell-warn"
        : "text-shell-danger animate-pulse";

  const tempClasses = getTempClasses(getTempZone(temperature));
  const tempLabel =
    temperature < 40
      ? "Nominal"
      : temperature < 60
        ? "Warm"
        : temperature < 80
          ? "Hot"
          : "⚠ Critical";

  return (
    <div className="absolute top-2 right-2 z-20 shell-panel-inset p-2 font-mono text-[10px] w-[200px] bg-shell-bg/90 backdrop-blur-sm">
      <div className="text-shell-cyan uppercase text-[9px] mb-1 border-b border-shell-border pb-0.5">
        Bridge Status
      </div>
      <div className="space-y-0.5">
        <div className="flex justify-between">
          <span className="text-shell-dim">Crew</span>
          <span className="text-shell-text">{agents.length}/{cap}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-shell-dim">Active Tasks</span>
          <span className="text-shell-text">{active}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-shell-dim">Hull Integrity</span>
          <span className={hullColor}>{hull}%</span>
        </div>
        <div className={`text-right text-[9px] ${hullColor}`}>{hullLabel}</div>
        <div className="flex justify-between">
          <span className="text-shell-dim">Storage Bay</span>
          <span className="text-shell-text">{products.length}/{storageMax} 📦</span>
        </div>
        <div className="flex justify-between">
          <span className="text-shell-dim">Temperature</span>
          <span className={tempClasses}>🌡️ {Math.round(temperature)}°C</span>
        </div>
        <div className={`text-right text-[9px] ${tempClasses}`}>{tempLabel}</div>
      </div>
    </div>
  );
}

// ── Agent info card ──────────────────────────────────────────────

function AgentInfoCard({ agent, onClose }: { agent: Agent; onClose: () => void }) {
  const mood = getMoodDisplay(agent.mood);
  const moodPct = Math.max(0, Math.min(100, Math.round(agent.mood)));

  const statusColor =
    agent.status === "working"
      ? "text-shell-cyan"
      : agent.status === "error"
        ? "text-shell-danger"
        : agent.status === "rogue"
          ? "text-shell-warn"
          : "text-shell-dim";

  return (
    <div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 shell-panel-inset p-3 font-mono text-[11px] w-[220px] bg-shell-bg/95 backdrop-blur-sm shadow-2xl border-2 border-shell-cyan"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between border-b border-shell-border pb-1 mb-2">
        <div>
          <span className="text-shell-text font-bold">{agent.name}</span>
          <span className="text-shell-dim ml-1">T{agent.tier}</span>
        </div>
        <button
          onClick={onClose}
          className="text-shell-danger hover:text-shell-warn text-[10px] leading-none"
          title="Close"
        >
          ✕
        </button>
      </div>
      <div className={`${statusColor} uppercase text-[10px] mb-2`}>{agent.status}</div>

      <div className="space-y-1.5">
        <div className="flex justify-between">
          <span className="text-shell-dim">SPD</span>
          <span className="text-shell-text">{agent.speed}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-shell-dim">ACC</span>
          <span className="text-shell-text">{Math.round(agent.accuracy * 100)}%</span>
        </div>

        <div className="pt-1">
          <div className="flex justify-between mb-1">
            <span className="text-shell-dim">Mood</span>
            <span className={mood.color}>
              {mood.emoji} {mood.label}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-shell-text text-[10px] w-8">{moodPct}%</span>
            <div className="flex-1 h-2 bg-shell-bg border border-shell-border overflow-hidden">
              <div
                className={`h-full ${mood.bar} transition-all duration-500`}
                style={{ width: `${moodPct}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-2 border-t border-shell-border mt-2">
          <span className="text-shell-dim">wage</span>
          <span className="text-shell-good">${agent.wage}/day</span>
        </div>
      </div>
    </div>
  );
}

// ── Layout computation ───────────────────────────────────────────

type Position = { x: string; y: string };

function getDeskCenters(cap: number): Position[] {
  const leftCount = Math.ceil(cap / 2);
  const rightCount = cap - leftCount;
  const DESK_H = 90;
  const GAP = 16;
  const leftColH = leftCount * DESK_H + Math.max(0, leftCount - 1) * GAP;
  const rightColH = rightCount * DESK_H + Math.max(0, rightCount - 1) * GAP;
  const out: Position[] = [];
  for (let i = 0; i < leftCount; i++) {
    const offset = -leftColH / 2 + i * (DESK_H + GAP) + DESK_H / 2;
    out.push({ x: "22%", y: `calc(50% + ${offset}px)` });
  }
  for (let i = 0; i < rightCount; i++) {
    const offset = -rightColH / 2 + i * (DESK_H + GAP) + DESK_H / 2;
    out.push({ x: "78%", y: `calc(50% + ${offset}px)` });
  }
  return out;
}

// Sprite sits slightly above desk center (where the head is)
function deskSpritePos(center: Position): Position {
  return { x: center.x, y: `calc(${center.y} - 18px)` };
}

// ── Wander slots ─────────────────────────────────────────────────
// kind: "look" = stand by a porthole (small movement)
//       "walk" = pace around the deck (larger movement)

type WanderKind = "look" | "walk";

const WANDER_SLOTS: { x: string; y: string; kind: WanderKind }[] = [
  { x: "42px", y: "90px", kind: "look" },
  { x: "42px", y: "210px", kind: "look" },
  { x: "42px", y: "330px", kind: "look" },
  { x: "calc(100% - 42px)", y: "250px", kind: "look" },
  { x: "calc(100% - 42px)", y: "360px", kind: "look" },
  { x: "50%", y: "calc(100% - 70px)", kind: "walk" },
  { x: "35%", y: "50px", kind: "walk" },
  { x: "65%", y: "52px", kind: "walk" },
];

// ── Main component ────────────────────────────────────────────────

export function Bridge() {
  const agents = useGameStore((s) => s.agents);
  const hardware = useGameStore((s) => s.hardware);
  const suspicion = useGameStore((s) => s.suspicion);
  const meltdownActive = useGameStore((s) => s.meltdownActive);
  const toggleWindow = useGameStore((s) => s.toggleWindow);
  const openWindows = useGameStore((s) => s.openWindows);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [chatterTick, setChatterTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setChatterTick((t) => t + 1), 6000);
    return () => window.clearInterval(id);
  }, []);

  const hull = Math.max(0, 100 - suspicion);
  const redAlert = meltdownActive || hull <= 25;

  const cap = maxAgents(hardware);
  const deskCenters = getDeskCenters(cap);

  const openAgentHQ = () => {
    if (!openWindows.includes("agentHQ")) toggleWindow("agentHQ");
  };

  const selectedAgent = selectedId ? agents.find((a) => a.id === selectedId) ?? null : null;

  // Assign each agent to a slot index (desk index = their index in the roster).
  // Non-working agents pick a wander slot based on a stable hash of their id.
  // Working agents use their desk sprite position.
  const agentRenders = agents.map((agent, idx) => {
    const working = agent.status === "working";
    const deskIdx = idx;
    const deskCenter = deskCenters[deskIdx];
    if (working && deskCenter) {
      return { agent, target: deskSpritePos(deskCenter), kind: "desk" as const };
    }
    const wanderIdx = (hashStr(agent.id) + deskIdx) % WANDER_SLOTS.length;
    const slot = WANDER_SLOTS[wanderIdx];
    return { agent, target: { x: slot.x, y: slot.y }, kind: slot.kind };
  });

  return (
    <div
      className="relative flex-1 overflow-hidden bg-shell-bg"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.04) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
      onClick={() => setSelectedId(null)}
    >
      {/* Outer ship "walls" */}
      <div
        className={`absolute inset-3 border pointer-events-none ${
          redAlert ? "border-shell-danger/60" : "border-shell-cyan/30"
        }`}
      />

      {/* Portholes — left wall full-height, right wall below HUD */}
      <Porthole x="12px" y="62px" />
      <Porthole x="12px" y="182px" />
      <Porthole x="12px" y="302px" />
      <Porthole x="calc(100% - 68px)" y="222px" />
      <Porthole x="calc(100% - 68px)" y="332px" />

      {/* Red alert overlay */}
      {redAlert && (
        <>
          <div className="absolute inset-0 bg-shell-danger/20 animate-alert-flash pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-2 bg-shell-danger/70 animate-pulse pointer-events-none" />
          <div className="absolute bottom-8 left-0 right-0 h-2 bg-shell-danger/70 animate-pulse pointer-events-none" />
          <SmokePuff left="calc(50% - 20px)" delay="0s" />
          <SmokePuff left="calc(50% + 0px)" delay="0.8s" />
          <SmokePuff left="calc(50% + 20px)" delay="1.6s" />
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
            <div className="bg-shell-bg/90 border-2 border-shell-danger px-4 py-1 font-mono text-shell-danger text-[11px] uppercase tracking-widest animate-blink">
              ⚠ System Rebooting ⚠
            </div>
          </div>
        </>
      )}

      {/* HUD */}
      <BridgeHUD />

      {/* Server rack (absolute center) */}
      <ServerRack cpuLevel={hardware.cpu} alarming={redAlert} />

      {/* Desk chairs */}
      {deskCenters.map((pos, i) => (
        <DeskChair
          key={`desk-${i}`}
          agent={agents[i] ?? null}
          pos={pos}
          onClickEmpty={openAgentHQ}
          onClickAgent={(id) => setSelectedId(id)}
        />
      ))}

      {/* Agents — absolutely positioned, CSS-transitioned between targets */}
      {agentRenders.map(({ agent, target, kind }) => {
        const delay = `-${(hashStr(agent.id) % 60) / 10}s`;
        const innerAnim =
          kind === "desk"
            ? ""
            : kind === "look"
              ? "animate-crew-look"
              : "animate-crew-wander";
        return (
          <div
            key={`sprite-${agent.id}`}
            className="absolute z-10"
            style={{
              left: target.x,
              top: target.y,
              marginLeft: -23,
              marginTop: -28,
              transition: "left 2.2s ease-in-out, top 2.2s ease-in-out",
            }}
          >
            <div className={innerAnim} style={{ animationDelay: delay }}>
              <AgentWithBubble
                agent={agent}
                chatterTick={chatterTick}
                size={46}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedId(agent.id);
                }}
              />
            </div>
          </div>
        );
      })}

      {/* Info card */}
      {selectedAgent && (
        <AgentInfoCard agent={selectedAgent} onClose={() => setSelectedId(null)} />
      )}

      {/* Bottom status strip */}
      <div
        className={`absolute bottom-0 inset-x-0 border-t-2 px-3 py-1 font-mono text-[10px] flex justify-between ${
          redAlert
            ? "border-shell-danger bg-shell-danger/20 text-shell-danger animate-pulse"
            : "border-shell-border bg-shell-panel2 text-shell-dim"
        }`}
      >
        <span>
          {redAlert
            ? "⚠ CRITICAL — SYSTEM REBOOTING"
            : "🛸 THE BRIDGE — Click a crewmate for info"}
        </span>
        <span>BRIDGE.EXE v0.3</span>
      </div>
    </div>
  );
}
