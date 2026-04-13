import { useGameStore, maxAgents } from "../../store/gameStore";
import { getStorageMax } from "../../data/hardwareConfig";
import { getTempZone, getTempClasses } from "../../systems/temperatureSystem";
import type { Agent } from "../../types";

// ── Desk ─────────────────────────────────────────────────────────

function Desk({
  agent,
  onClick,
}: {
  agent: Agent | null;
  onClick: () => void;
}) {
  const occupied = agent !== null;

  const statusColor =
    agent?.status === "working"
      ? "text-shell-cyan"
      : agent?.status === "error"
        ? "text-shell-danger"
        : agent?.status === "rogue"
          ? "text-shell-warn"
          : "text-shell-dim";

  return (
    <button
      onClick={onClick}
      className={`relative w-[120px] h-[80px] font-mono text-[10px] transition-all ${
        occupied
          ? "border-2 border-shell-cyan bg-shell-panel2 shadow-[0_0_12px_rgba(0,255,255,0.25)] hover:shadow-[0_0_18px_rgba(0,255,255,0.45)]"
          : "border border-dashed border-shell-border bg-shell-bg/40 hover:border-shell-dim"
      }`}
      title={occupied ? `${agent!.name} — open AgentHQ` : "Empty slot — open AgentHQ"}
    >
      {/* Monitor graphic */}
      <div
        className={`absolute inset-x-3 top-2 h-6 border ${
          occupied
            ? "border-shell-cyan bg-shell-bg"
            : "border-shell-border bg-shell-bg/60"
        } flex items-center justify-center`}
      >
        {occupied ? (
          <span className={`${statusColor} uppercase tracking-wider`}>
            {agent!.status === "working" ? "▮▮▮" : agent!.status === "idle" ? "▯▯▯" : "!!!"}
          </span>
        ) : (
          <span className="text-shell-border">— OFF —</span>
        )}
      </div>

      {/* Desk surface label */}
      <div className="absolute inset-x-0 bottom-1 text-center">
        {occupied ? (
          <>
            <div className="text-shell-text font-bold truncate px-1">{agent!.name}</div>
            <div className={`${statusColor} uppercase text-[9px]`}>{agent!.status}</div>
          </>
        ) : (
          <div className="text-shell-border uppercase text-[9px]">Empty Slot</div>
        )}
      </div>
    </button>
  );
}

// ── Server rack ──────────────────────────────────────────────────

function ServerRack({ cpuLevel }: { cpuLevel: number }) {
  const ledRows = 5;
  return (
    <div className="w-[140px] h-[180px] border-2 border-shell-border bg-shell-panel2 relative shadow-[0_0_24px_rgba(0,255,255,0.15)]">
      <div className="absolute inset-x-0 top-0 border-b border-shell-border bg-shell-panel px-2 py-0.5 font-mono text-[9px] text-shell-cyan uppercase tracking-wider text-center">
        Server Rack
      </div>
      <div className="absolute inset-x-2 top-6 bottom-6 flex flex-col justify-around">
        {Array.from({ length: ledRows }).map((_, row) => (
          <div key={row} className="flex items-center justify-between px-1 border-b border-shell-border/40 pb-0.5">
            <div className="flex gap-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <span
                  key={i}
                  className="inline-block w-1.5 h-1.5 bg-shell-good rounded-full animate-blink"
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

// ── Main component ────────────────────────────────────────────────

export function Bridge() {
  const agents = useGameStore((s) => s.agents);
  const hardware = useGameStore((s) => s.hardware);
  const toggleWindow = useGameStore((s) => s.toggleWindow);
  const openWindows = useGameStore((s) => s.openWindows);

  const cap = maxAgents(hardware);

  // Distribute desks across left and right columns (left gets the extra on odd counts)
  const leftCount = Math.ceil(cap / 2);
  const rightCount = cap - leftCount;

  const leftSlots: (Agent | null)[] = [];
  const rightSlots: (Agent | null)[] = [];
  for (let i = 0; i < leftCount; i++) leftSlots.push(agents[i] ?? null);
  for (let i = 0; i < rightCount; i++) rightSlots.push(agents[leftCount + i] ?? null);

  const openAgentHQ = () => {
    if (!openWindows.includes("agentHQ")) toggleWindow("agentHQ");
  };

  return (
    <div
      className="relative flex-1 overflow-hidden bg-shell-bg"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.04) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
    >
      {/* Outer ship "walls" — cyan glow border inset */}
      <div className="absolute inset-3 border border-shell-cyan/30 pointer-events-none" />

      {/* HUD overlay */}
      <BridgeHUD />

      {/* Bridge interior — 3 columns: left desks / server rack / right desks */}
      <div className="absolute inset-0 flex items-center justify-center gap-8 p-6 pt-8">
        {/* Left desks */}
        <div className="flex flex-col gap-4">
          {leftSlots.map((agent, i) => (
            <Desk key={`L${i}`} agent={agent} onClick={openAgentHQ} />
          ))}
        </div>

        {/* Center server rack */}
        <ServerRack cpuLevel={hardware.cpu} />

        {/* Right desks */}
        <div className="flex flex-col gap-4">
          {rightSlots.map((agent, i) => (
            <Desk key={`R${i}`} agent={agent} onClick={openAgentHQ} />
          ))}
          {rightCount === 0 && <div className="w-[120px]" /> /* spacer to keep rack centered when cap=1 */}
        </div>
      </div>

      {/* Bottom status strip */}
      <div className="absolute bottom-0 inset-x-0 border-t-2 border-shell-border bg-shell-panel2 px-3 py-1 font-mono text-[10px] text-shell-dim flex justify-between">
        <span>🛸 THE BRIDGE — Click a desk to manage crew</span>
        <span>BRIDGE.EXE v0.1</span>
      </div>
    </div>
  );
}
