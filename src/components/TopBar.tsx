import { useState, useRef, useEffect } from "react";
import { useGameStore } from "../store/gameStore";
import { isMuted, setMuted } from "../systems/sound";

const pad = (n: number) => n.toString().padStart(2, "0");

export function TopBar() {
  const money = useGameStore((s) => s.money);
  const time = useGameStore((s) => s.time);
  const heat = useGameStore((s) => s.heat);
  const hardware = useGameStore((s) => s.hardware);
  const [muted, setMutedState] = useState(isMuted());

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
  };

  const prevMoney = useRef(money);
  const [moneyFlash, setMoneyFlash] = useState(false);

  useEffect(() => {
    if (money > prevMoney.current) {
      setMoneyFlash(true);
      const t = setTimeout(() => setMoneyFlash(false), 600);
      return () => clearTimeout(t);
    }
    prevMoney.current = money;
  }, [money]);

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
        <span className={`text-shell-good${moneyFlash ? " animate-flash-green" : ""}`}>
          💰 ${money.toLocaleString()}
        </span>
        <span className="text-shell-text">
          ⚡ CPU {cpuLoad}%
        </span>
        <span className="text-shell-text">
          🌡️ {temp}°C
        </span>
        <span className={`${heatColor}${heat >= 50 ? " animate-heat-pulse" : ""}`}>
          ⚠️ Heat {heat}%
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-shell-dim">
          HW.cpu lv{hardware.cpu}
        </span>
        <button
          onClick={toggleMute}
          className="text-shell-dim hover:text-shell-text transition-colors"
          title={muted ? "Unmute" : "Mute"}
        >
          {muted ? "🔇" : "🔊"}
        </button>
        <span className="text-shell-cyan" data-testid="topbar-clock">
          🕐 Day {time.day} — {pad(time.hour)}:{pad(time.minute)}
        </span>
        <span className="text-shell-good animate-blink">█</span>
      </div>
    </div>
  );
}
