import { useState, useRef, useEffect } from "react";
import { useGameStore, maxAgents } from "../store/gameStore";
import { isMuted, setMuted } from "../systems/sound";
import { getSuspicionStars, getSuspicionStarLevel } from "../systems/eventSystem";
import { getTempZone, getTempClasses } from "../systems/temperatureSystem";
import { Dialog } from "./ConfirmDialog";

const pad = (n: number) => n.toString().padStart(2, "0");

export function TopBar() {
  const money = useGameStore((s) => s.money);
  const time = useGameStore((s) => s.time);
  const suspicion = useGameStore((s) => s.suspicion);
  const temperature = useGameStore((s) => s.temperature);
  const hardware = useGameStore((s) => s.hardware);
  const agents = useGameStore((s) => s.agents);
  const toggleWindow = useGameStore((s) => s.toggleWindow);
  const openWindows = useGameStore((s) => s.openWindows);
  const unreadMail = useGameStore((s) => s.mails.filter((m) => !m.read).length);
  const [muted, setMutedState] = useState(isMuted());
  const [helpOpen, setHelpOpen] = useState(false);

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
    <>
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
          onClick={() => toggleWindow("hardware")}
          className={`text-shell-dim hover:text-shell-text transition-colors${openWindows.includes("hardware") ? " text-shell-cyan" : ""}`}
          title="Hardware"
        >
          🖥️
        </button>
        <button
          onClick={() => toggleWindow("mail")}
          className="relative text-shell-dim hover:text-shell-text transition-colors"
          title="Mail"
        >
          📬
          {unreadMail > 0 && !openWindows.includes("mail") && (
            <span className="absolute -top-1 -right-1 bg-shell-good text-shell-bg rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-bold font-mono">
              {unreadMail}
            </span>
          )}
        </button>
        <button
          onClick={toggleMute}
          className="text-shell-dim hover:text-shell-text transition-colors"
          title={muted ? "Unmute" : "Mute"}
        >
          {muted ? "🔇" : "🔊"}
        </button>
        <button
          onClick={() => setHelpOpen(true)}
          className="text-shell-dim hover:text-shell-text transition-colors"
          title="How to play"
        >
          ❓
        </button>
        <span className="text-shell-cyan" data-testid="topbar-clock">
          🕐 Day {time.day} — {pad(time.hour)}:{pad(time.minute)}
        </span>
        <span className="text-shell-good animate-blink">█</span>
      </div>
    </div>

    <Dialog
      open={helpOpen}
      title="HOW TO PLAY — SHELLOS v0.2"
      titleIcon="❓"
      onClose={() => setHelpOpen(false)}
      width={520}
    >
      <div className="p-4 font-mono text-xs text-shell-text max-h-[70vh] overflow-y-auto log-scroll">
        <div className="text-shell-cyan uppercase text-[10px] mb-2 border-b border-shell-border pb-1">
          The Pitch
        </div>
        <p className="text-shell-dim leading-relaxed mb-3">
          You are running a shady dropshipping operation out of your apartment.
          You hire digital agents to source products, you list them on the market,
          and you try not to get caught.
        </p>

        <div className="text-shell-cyan uppercase text-[10px] mb-2 border-b border-shell-border pb-1">
          Core Loop
        </div>
        <ol className="text-shell-text leading-relaxed mb-3 space-y-1 list-decimal list-inside">
          <li><span className="text-shell-good">Hire</span> an agent from AGENT.HQ → 🤝 Hire tab.</li>
          <li><span className="text-shell-good">Assign</span> tasks from the left sidebar (▶ TASK button).</li>
          <li>Agents return with <span className="text-shell-cyan">products</span>. Open MARKET to list them.</li>
          <li><span className="text-shell-good">Inspect</span> items before listing to learn their quality.</li>
          <li>Reinvest profits into 🖥️ HARDWARE upgrades. Survive.</li>
        </ol>

        <div className="text-shell-cyan uppercase text-[10px] mb-2 border-b border-shell-border pb-1">
          Top Bar Readouts
        </div>
        <ul className="text-shell-text leading-relaxed mb-3 space-y-1">
          <li>💰 <span className="text-shell-dim">— cash on hand</span></li>
          <li>⚡ <span className="text-shell-dim">CPU — agents currently working / max slots</span></li>
          <li>🌡️ <span className="text-shell-dim">— system temperature. High heat causes hardware failures. Buy cooling.</span></li>
          <li>⭐ <span className="text-shell-dim">— suspicion. 5 stars = game over. Only rises from customer complaints on shady sales.</span></li>
        </ul>

        <div className="text-shell-cyan uppercase text-[10px] mb-2 border-b border-shell-border pb-1">
          Hardware
        </div>
        <ul className="text-shell-text leading-relaxed mb-3 space-y-1">
          <li>⚡ <span className="text-shell-dim">CPU — more agent slots</span></li>
          <li>💾 <span className="text-shell-dim">RAM — agents complete tasks faster</span></li>
          <li>🌡️ <span className="text-shell-dim">Cooling — dissipates heat per tick</span></li>
          <li>📦 <span className="text-shell-dim">Storage — max inventory size</span></li>
        </ul>

        <div className="text-shell-cyan uppercase text-[10px] mb-2 border-b border-shell-border pb-1">
          Agent Mood
        </div>
        <p className="text-shell-dim leading-relaxed mb-3">
          Agents have a mood from 0–100. Sad agents work slower and make mistakes.
          Depressed agents may refuse tasks entirely. Keep them busy and ship sales to
          keep spirits up. Idle agents decay over time.
        </p>

        <div className="text-shell-cyan uppercase text-[10px] mb-2 border-b border-shell-border pb-1">
          Tips
        </div>
        <ul className="text-shell-dim leading-relaxed mb-4 space-y-1 list-disc list-inside">
          <li>Inspect before listing — selling bad items blind is how you get complaints.</li>
          <li>Don't overspend on hardware early. One agent and a bit of cooling goes far.</li>
          <li>Trait tooltips (hover in AGENT.HQ) explain each personality's quirks.</li>
          <li>Fired agents have opinions. They will share them.</li>
        </ul>

        <div className="flex justify-end">
          <button
            onClick={() => setHelpOpen(false)}
            className="shell-button !text-shell-good text-xs px-4"
            autoFocus
          >
            GOT IT
          </button>
        </div>
      </div>
    </Dialog>
    </>
  );
}
