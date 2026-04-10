import { useGameStore } from "../store/gameStore";

const pad = (n: number) => n.toString().padStart(2, "0");

export function TopBar() {
  const money = useGameStore((s) => s.money);
  const time = useGameStore((s) => s.time);
  const heat = useGameStore((s) => s.heat);
  const hardware = useGameStore((s) => s.hardware);

  // Placeholder derived stats
  const cpuLoad = 35;
  const temp = 42;

  const heatColor =
    heat >= 80
      ? "text-shell-danger"
      : heat >= 50
        ? "text-shell-warn"
        : "text-shell-good";

  return (
    <div className="shell-panel flex items-center justify-between px-4 py-2 border-b-2 font-mono text-sm">
      <div className="flex items-center gap-6">
        <span className="text-shell-cyan font-bold tracking-widest">
          SHELLOS
        </span>
        <span className="text-shell-good">
          💰 ${money.toLocaleString()}
        </span>
        <span className="text-shell-text">
          ⚡ CPU {cpuLoad}%
        </span>
        <span className="text-shell-text">
          🌡️ {temp}°C
        </span>
        <span className={heatColor}>
          ⚠️ Heat {heat}%
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-shell-dim">
          HW.cpu lv{hardware.cpu}
        </span>
        <span className="text-shell-cyan" data-testid="topbar-clock">
          🕐 Day {time.day} — {pad(time.hour)}:{pad(time.minute)}
        </span>
        <span className="text-shell-good animate-blink">█</span>
      </div>
    </div>
  );
}
