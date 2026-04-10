import { useEffect } from "react";
import { TopBar } from "./components/TopBar";
import { AgentPanel } from "./components/AgentPanel";
import { EventLog } from "./components/EventLog";
import { StatsPanel } from "./components/StatsPanel";
import { Taskbar } from "./components/Taskbar";
import { AgentHQ } from "./components/windows/AgentHQ";
import { Market } from "./components/windows/Market";
import { Hardware } from "./components/windows/Hardware";
import { GameOverScreen } from "./components/GameOverScreen";
import { DevTools } from "./components/DevTools";
import { useGameStore } from "./store/gameStore";
import { TICK_MS } from "./systems/gameTick";

function ActiveWindow() {
  const activeApp = useGameStore((s) => s.activeApp);
  switch (activeApp) {
    case "agentHQ":
      return <AgentHQ />;
    case "market":
      return <Market />;
    case "hardware":
      return <Hardware />;
    case "apartment":
      return null;
    default:
      return null;
  }
}

function useGameLoop() {
  useEffect(() => {
    // Allow tests to start paused via ?paused=1
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("paused") === "1") {
        useGameStore.getState().setPaused(true);
      }
    }
    const id = window.setInterval(() => {
      const state = useGameStore.getState();
      if (state.paused) return;
      if (state.gameOver) return;
      state.tick();
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, []);
}

export default function App() {
  useGameLoop();
  const gameOver = useGameStore((s) => s.gameOver);

  return (
    <div className="crt h-screen w-screen flex flex-col bg-shell-bg text-shell-text overflow-hidden relative">
      <TopBar />

      <div className="flex-1 flex gap-2 p-2 overflow-hidden">
        {/* Left — Agents */}
        <div className="w-[260px] shrink-0">
          <AgentPanel />
        </div>

        {/* Center — Event log + active window overlay */}
        <div className="flex-1 relative">
          <EventLog />
          <ActiveWindow />
        </div>

        {/* Right — Stats */}
        <div className="w-[260px] shrink-0">
          <StatsPanel />
        </div>
      </div>

      <Taskbar />

      {gameOver && <GameOverScreen />}
      <DevTools />
    </div>
  );
}
