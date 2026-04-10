import { useState } from "react";
import { useGameStore } from "../store/gameStore";
import { getGameOverMessage } from "../systems/eventSystem";

export function DevTools() {
  const [open, setOpen] = useState(false);
  const heat = useGameStore((s) => s.heat);
  const money = useGameStore((s) => s.money);
  const paused = useGameStore((s) => s.paused);
  const time = useGameStore((s) => s.time);
  const agents = useGameStore((s) => s.agents);
  const products = useGameStore((s) => s.products);
  const devSet = useGameStore((s) => s.devSet);
  const tick = useGameStore((s) => s.tick);
  const setPaused = useGameStore((s) => s.setPaused);
  const pushEvent = useGameStore((s) => s.pushEvent);

  const [moneyInput, setMoneyInput] = useState("");

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-12 right-2 z-40 shell-button !text-shell-warn text-xs px-2 py-1 font-mono"
        title="Open dev tools"
      >
        🛠 DEV
      </button>
    );
  }

  const applyMoney = () => {
    const n = parseInt(moneyInput, 10);
    if (!Number.isNaN(n)) devSet({ money: n });
  };

  const triggerGameOver = () => {
    devSet({
      heat: 100,
      gameOver: true,
      gameOverReason: getGameOverMessage(),
    });
  };

  const forceTick = () => {
    tick();
  };

  const addCash = (amount: number) => {
    devSet({ money: Math.max(0, money + amount) });
  };

  const setHeat = (h: number) => {
    devSet({ heat: Math.min(100, Math.max(0, h)) });
  };

  const skipTicks = (n: number) => {
    for (let i = 0; i < n; i++) tick();
  };

  const resetHeat = () => devSet({ heat: 0 });

  const fireTestEvent = () => {
    pushEvent({
      level: "info",
      icon: "🛠",
      message: "[dev] manual test event fired.",
    });
  };

  return (
    <div className="fixed bottom-12 right-2 z-40 w-[280px] shell-panel font-mono text-xs">
      <div className="shell-title flex items-center justify-between">
        <span>🛠 DEV.TOOLS</span>
        <button
          onClick={() => setOpen(false)}
          className="text-shell-dim hover:text-shell-text px-1"
          title="Close"
        >
          ✕
        </button>
      </div>

      <div className="p-2 bg-shell-bg space-y-3 max-h-[70vh] overflow-y-auto log-scroll">
        {/* Snapshot */}
        <div className="shell-panel-inset p-2 text-shell-dim space-y-0.5">
          <div className="flex justify-between">
            <span>day</span>
            <span className="text-shell-text">
              {time.day} {String(time.hour).padStart(2, "0")}:
              {String(time.minute).padStart(2, "0")}
            </span>
          </div>
          <div className="flex justify-between">
            <span>money</span>
            <span className="text-shell-good">${money}</span>
          </div>
          <div className="flex justify-between">
            <span>heat</span>
            <span
              className={
                heat >= 80
                  ? "text-shell-danger"
                  : heat >= 50
                    ? "text-shell-warn"
                    : "text-shell-text"
              }
            >
              {heat}
            </span>
          </div>
          <div className="flex justify-between">
            <span>agents / products</span>
            <span className="text-shell-text">
              {agents.length} / {products.length}
            </span>
          </div>
        </div>

        {/* Heat */}
        <div>
          <div className="text-shell-cyan uppercase mb-1">Heat</div>
          <input
            type="range"
            min={0}
            max={100}
            value={heat}
            onChange={(e) => setHeat(parseInt(e.target.value, 10))}
            className="w-full accent-shell-danger"
          />
          <div className="flex gap-1 mt-1">
            <button className="shell-button flex-1" onClick={() => setHeat(0)}>
              0
            </button>
            <button className="shell-button flex-1" onClick={() => setHeat(50)}>
              50
            </button>
            <button className="shell-button flex-1" onClick={() => setHeat(85)}>
              85
            </button>
            <button
              className="shell-button flex-1 !text-shell-danger"
              onClick={() => setHeat(99)}
            >
              99
            </button>
          </div>
        </div>

        {/* Money */}
        <div>
          <div className="text-shell-cyan uppercase mb-1">Money</div>
          <div className="flex gap-1 mb-1">
            <input
              value={moneyInput}
              onChange={(e) => setMoneyInput(e.target.value)}
              placeholder="set $"
              className="flex-1 bg-shell-bg border border-shell-border px-1 py-0.5 text-shell-text outline-none focus:border-shell-cyan"
            />
            <button className="shell-button" onClick={applyMoney}>
              SET
            </button>
          </div>
          <div className="flex gap-1">
            <button className="shell-button flex-1" onClick={() => addCash(100)}>
              +100
            </button>
            <button
              className="shell-button flex-1"
              onClick={() => addCash(1000)}
            >
              +1k
            </button>
            <button
              className="shell-button flex-1"
              onClick={() => addCash(10000)}
            >
              +10k
            </button>
            <button
              className="shell-button flex-1 !text-shell-warn"
              onClick={() => addCash(-500)}
            >
              -500
            </button>
          </div>
        </div>

        {/* Time */}
        <div>
          <div className="text-shell-cyan uppercase mb-1">Time</div>
          <div className="flex gap-1">
            <button
              className="shell-button flex-1"
              onClick={() => setPaused(!paused)}
            >
              {paused ? "▶ RESUME" : "⏸ PAUSE"}
            </button>
            <button className="shell-button flex-1" onClick={forceTick}>
              ⏭ TICK
            </button>
            <button className="shell-button flex-1" onClick={() => skipTicks(10)}>
              +10
            </button>
            <button className="shell-button flex-1" onClick={() => skipTicks(50)}>
              +50
            </button>
          </div>
        </div>

        {/* Misc */}
        <div>
          <div className="text-shell-cyan uppercase mb-1">Actions</div>
          <div className="grid grid-cols-2 gap-1">
            <button className="shell-button" onClick={fireTestEvent}>
              📣 EVENT
            </button>
            <button className="shell-button" onClick={resetHeat}>
              ❄ COOL
            </button>
            <button
              className="shell-button !text-shell-danger col-span-2"
              onClick={triggerGameOver}
            >
              💀 KILL RUN
            </button>
          </div>
        </div>

        <div className="text-shell-dim italic text-[10px] pt-1 border-t border-shell-border">
          dev only — not shipped to investors
        </div>
      </div>
    </div>
  );
}
