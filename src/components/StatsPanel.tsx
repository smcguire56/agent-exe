import { useGameStore } from "../store/gameStore";
import { MAX_HW_LEVEL, getStorageMax } from "../data/hardwareConfig";

interface MeterProps {
  label: string;
  value: number;
  max: number;
  color: string;
}

function Meter({ label, value, max, color }: MeterProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  // Build a chunky block-style bar
  const blocks = 10;
  const filled = Math.round((pct / 100) * blocks);
  const bar = "█".repeat(filled) + "░".repeat(blocks - filled);
  return (
    <div className="font-mono text-xs mb-2">
      <div className="flex justify-between text-shell-dim mb-0.5">
        <span className="uppercase">{label}</span>
        <span>
          lv {value}/{max}
        </span>
      </div>
      <div className={`${color} tracking-tighter text-base leading-none`}>
        {bar}
      </div>
    </div>
  );
}

export function StatsPanel() {
  const hardware = useGameStore((s) => s.hardware);
  const suspicion = useGameStore((s) => s.suspicion);
  const products = useGameStore((s) => s.products);
  const storageMax = getStorageMax(hardware.storage);

  return (
    <div className="shell-panel flex flex-col h-full overflow-hidden">
      <div className="shell-title">📊 SYSTEM.STATS</div>
      <div className="flex-1 overflow-y-auto log-scroll p-3">
        <div className="text-shell-cyan font-mono text-xs uppercase mb-2 border-b border-shell-border pb-1">
          Hardware
        </div>
        <Meter
          label="CPU"
          value={hardware.cpu}
          max={MAX_HW_LEVEL}
          color="text-shell-good"
        />
        <Meter
          label="RAM"
          value={hardware.ram}
          max={MAX_HW_LEVEL}
          color="text-shell-cyan"
        />
        <Meter
          label="Cooling"
          value={hardware.cooling}
          max={MAX_HW_LEVEL}
          color="text-shell-cyan"
        />
        <Meter
          label="Storage"
          value={hardware.storage}
          max={MAX_HW_LEVEL}
          color="text-shell-warn"
        />

        <div className="text-shell-cyan font-mono text-xs uppercase mt-4 mb-2 border-b border-shell-border pb-1">
          Operations
        </div>
        <Meter
          label="Suspicion"
          value={suspicion}
          max={100}
          color={
            suspicion >= 85
              ? "text-shell-danger"
              : suspicion >= 40
                ? "text-shell-warn"
                : "text-shell-good"
          }
        />

        <div className="font-mono text-xs text-shell-dim mt-4 space-y-1">
          <div className="flex justify-between">
            <span>📦 Inventory</span>
            <span className="text-shell-text" data-testid="inventory-count">
              {products.length}/{storageMax}
            </span>
          </div>
          <div className="flex justify-between">
            <span>🔌 Uptime</span>
            <span className="text-shell-text">00:14:22</span>
          </div>
        </div>

      </div>
    </div>
  );
}
