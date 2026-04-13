import { useGameStore, maxAgents } from "../../store/gameStore";
import {
  CPU_TIERS,
  RAM_TIERS,
  COOLING_TIERS,
  STORAGE_TIERS,
  getCpuSlots,
  getRamSpeedMult,
  getStorageMax,
  getUpgradeCost,
  getSystemStatus,
  MAX_HW_LEVEL,
} from "../../data/hardwareConfig";
import { getCoolingDissipation } from "../../systems/temperatureSystem";

// ── Progress bar ─────────────────────────────────────────────────

function LevelBar({ level, max = MAX_HW_LEVEL }: { level: number; max?: number }) {
  const filled = level;
  const empty = max - level;
  return (
    <div className="font-mono text-xs tracking-tighter">
      <span className="text-shell-cyan">{"█".repeat(filled)}</span>
      <span className="text-shell-border">{"░".repeat(empty)}</span>
      <span className="text-shell-dim ml-1">Lv{level}/{max}</span>
    </div>
  );
}

// ── Upgrade card ─────────────────────────────────────────────────

interface CardProps {
  icon: string;
  label: string;
  level: number;
  effect: string;
  flavor: string;
  nextLabel: string | null;
  upgradeCost: number | null;
  canAfford: boolean;
  locked: boolean;
  onUpgrade: () => void;
  testId?: string;
}

function HardwareCard({
  icon, label, level, effect, flavor, nextLabel,
  upgradeCost, canAfford, locked, onUpgrade, testId,
}: CardProps) {
  const isMax = upgradeCost === null;
  const isDisabled = isMax || !canAfford || locked;

  return (
    <div className="shell-panel-inset p-3 mb-3 font-mono text-xs">
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="text-shell-text font-bold uppercase tracking-wide">
            {icon} {label}
          </div>
          <div className="text-shell-cyan text-[10px] mt-0.5">{effect}</div>
        </div>
        <button
          onClick={onUpgrade}
          disabled={isDisabled}
          data-testid={testId}
          className={`shell-button shrink-0 text-[10px] px-2 ${
            isMax
              ? "!text-shell-dim !cursor-default"
              : isDisabled
                ? "!text-shell-dim !cursor-not-allowed"
                : "!text-shell-good"
          }`}
        >
          {isMax ? "MAX" : locked ? "🔒 LOCKED" : `⬆ $${upgradeCost?.toLocaleString()}`}
        </button>
      </div>

      {/* Progress bar */}
      <LevelBar level={level} />

      {/* Next level unlock */}
      {!isMax && nextLabel && (
        <div className="text-shell-dim text-[10px] mt-1.5 border-t border-shell-border pt-1">
          → {nextLabel}
        </div>
      )}

      {/* Flavor */}
      <div className="text-shell-dim italic text-[10px] mt-1">
        {flavor}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────

export function Hardware() {
  const hw = useGameStore((s) => s.hardware);
  const money = useGameStore((s) => s.money);
  const agents = useGameStore((s) => s.agents);
  const products = useGameStore((s) => s.products);
  const hasAgents = agents.length > 0;
  const upgradeCpu = useGameStore((s) => s.upgradeCpu);
  const upgradeRam = useGameStore((s) => s.upgradeRam);
  const upgradeCooling = useGameStore((s) => s.upgradeCooling);
  const upgradeStorage = useGameStore((s) => s.upgradeStorage);

  const cap = maxAgents(hw);
  const storageMax = getStorageMax(hw.storage);
  const systemStatus = getSystemStatus(hw.cpu, hw.ram, hw.cooling, hw.storage);

  // CPU
  const cpuUpgradeCost = getUpgradeCost(CPU_TIERS, hw.cpu);
  const cpuEffect = `Agent slots: ${agents.length}/${cap}`;
  const cpuNextLabel = cpuUpgradeCost !== null
    ? `Lv${hw.cpu + 1}: ${getCpuSlots(hw.cpu + 1)} slots — ${CPU_TIERS[hw.cpu]?.flavor ?? ""}`
    : null;

  // RAM
  const ramUpgradeCost = getUpgradeCost(RAM_TIERS, hw.ram);
  const ramMult = getRamSpeedMult(hw.ram);
  const ramEffect = `Task speed: ${ramMult === 1 ? "1×" : `${ramMult}×`}`;
  const ramNextLabel = ramUpgradeCost !== null
    ? `Lv${hw.ram + 1}: ${getRamSpeedMult(hw.ram + 1)}× speed — ${RAM_TIERS[hw.ram]?.flavor ?? ""}`
    : null;

  // Cooling
  const coolingUpgradeCost = getUpgradeCost(COOLING_TIERS, hw.cooling);
  const coolingDiss = getCoolingDissipation(hw.cooling);
  const coolingEffect = `Dissipates ${coolingDiss}°C/tick`;
  const coolingNextLabel = coolingUpgradeCost !== null
    ? `Lv${hw.cooling + 1}: ${getCoolingDissipation(hw.cooling + 1)}°C/tick — ${COOLING_TIERS[hw.cooling]?.flavor ?? ""}`
    : null;

  // Storage
  const storageUpgradeCost = getUpgradeCost(STORAGE_TIERS, hw.storage);
  const storageEffect = `Inventory: ${products.length}/${storageMax} items`;
  const storageNextLabel = storageUpgradeCost !== null
    ? `Lv${hw.storage + 1}: ${getStorageMax(hw.storage + 1)} items — ${STORAGE_TIERS[hw.storage]?.flavor ?? ""}`
    : null;

  return (
    <>
      <div className="flex-1 overflow-y-auto log-scroll p-3 font-mono text-sm">

        {/* System status */}
        <div className="shell-panel-inset p-2 mb-4 text-center">
          <div className="text-shell-dim text-[10px] uppercase mb-0.5">System Status</div>
          <div className="text-shell-cyan text-xs italic">"{systemStatus}"</div>
        </div>

        <div className="text-shell-cyan uppercase text-[10px] mb-2 border-b border-shell-border pb-1">
          Hardware Components
        </div>

        {!hasAgents && (
          <div className="shell-panel-inset p-2 mb-3 font-mono text-[10px] text-shell-warn text-center">
            🔒 Hire an agent first before upgrading hardware.
          </div>
        )}

        <HardwareCard
          icon="⚡"
          label="CPU"
          level={hw.cpu}
          effect={cpuEffect}
          flavor={CPU_TIERS[hw.cpu - 1]?.flavor ?? ""}
          nextLabel={cpuNextLabel}
          upgradeCost={cpuUpgradeCost}
          canAfford={money >= (cpuUpgradeCost ?? Infinity)}
          locked={!hasAgents}
          onUpgrade={upgradeCpu}
          testId="upgrade-cpu"
        />

        <HardwareCard
          icon="💾"
          label="RAM"
          level={hw.ram}
          effect={ramEffect}
          flavor={RAM_TIERS[hw.ram - 1]?.flavor ?? ""}
          nextLabel={ramNextLabel}
          upgradeCost={ramUpgradeCost}
          canAfford={money >= (ramUpgradeCost ?? Infinity)}
          locked={!hasAgents}
          onUpgrade={upgradeRam}
          testId="upgrade-ram"
        />

        <HardwareCard
          icon="🌡️"
          label="Cooling"
          level={hw.cooling}
          effect={coolingEffect}
          flavor={COOLING_TIERS[hw.cooling - 1]?.flavor ?? ""}
          nextLabel={coolingNextLabel}
          upgradeCost={coolingUpgradeCost}
          canAfford={money >= (coolingUpgradeCost ?? Infinity)}
          locked={!hasAgents}
          onUpgrade={upgradeCooling}
          testId="upgrade-cooling"
        />

        <HardwareCard
          icon="📦"
          label="Storage"
          level={hw.storage}
          effect={storageEffect}
          flavor={STORAGE_TIERS[hw.storage - 1]?.flavor ?? ""}
          nextLabel={storageNextLabel}
          upgradeCost={storageUpgradeCost}
          canAfford={money >= (storageUpgradeCost ?? Infinity)}
          locked={!hasAgents}
          onUpgrade={upgradeStorage}
          testId="upgrade-storage"
        />

      </div>

      <div className="border-t-2 border-shell-border bg-shell-panel2 px-3 py-1 font-mono text-xs text-shell-dim flex justify-between">
        <span>💰 ${money.toLocaleString()}</span>
        <span>HARDWARE.SHOP v0.2</span>
      </div>
    </>
  );
}
