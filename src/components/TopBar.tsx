import { useState, useRef, useEffect } from "react";
import { useGameStore, maxAgents } from "../store/gameStore";
import { isMuted, setMuted } from "../systems/sound";
import { getSuspicionStars, getSuspicionStarLevel } from "../systems/eventSystem";
import { getTempZone, getTempClasses } from "../systems/temperatureSystem";

const pad = (n: number) => n.toString().padStart(2, "0");

export function TopBar() {
  const money = useGameStore((s) => s.money);
  const time = useGameStore((s) => s.time);
  const suspicion = useGameStore((s) => s.suspicion);
  const temperature = useGameStore((s) => s.temperature);
  const hardware = useGameStore((s) => s.hardware);
  const agents = useGameStore((s) => s.agents);
  const [muted, setMutedState] = useState(isMuted());

  const cpuCap = maxAgents(hardware);
  const activeAgents = agents.filter((a) => a.status === "working").length;

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

  const tempZone = getTempZone(temperature);
  const tempClasses = getTempClasses(tempZone);

  const starLevel = getSuspicionStarLevel(suspicion);
  const stars = getSuspicionStars(suspicion);

  const suspicionColor =
    starLevel >= 4
      ? "text-shell-danger"
      : starLevel >= 2
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
          ⚡ CPU {activeAgents}/{cpuCap}
        </span>
        <span className={tempClasses}>
          🌡️ {Math.round(temperature)}°C
        </span>
        <span className={`${suspicionColor}${starLevel >= 2 ? " animate-suspicion-pulse" : ""}`}>
          ⭐ {stars}
        </span>
      </div>
      <div className="flex items-center gap-4">
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
