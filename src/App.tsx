import { useEffect } from "react";
import { TopBar } from "./components/TopBar";
import { AgentPanel } from "./components/AgentPanel";
import { EventLog } from "./components/EventLog";
import { StatsPanel } from "./components/StatsPanel";
import { Taskbar } from "./components/Taskbar";
import { AppWindow } from "./components/AppWindow";
import { AgentHQ } from "./components/windows/AgentHQ";
import { Market } from "./components/windows/Market";
import { Hardware } from "./components/windows/Hardware";
import { ShellMail } from "./components/windows/ShellMail";
import { GameOverScreen } from "./components/GameOverScreen";
import { DevTools } from "./components/DevTools";
import { useGameStore } from "./store/gameStore";
import { TICK_MS } from "./systems/gameTick";

const WINDOW_DEFS: Record<
  string,
  { title: string; icon: string; component: React.FC; width?: number; height?: number; defaultPos?: { x: number; y: number } }
> = {
  agentHQ: { title: "AGENT.HQ — Personnel Manager", icon: "🤖", component: AgentHQ, defaultPos: { x: 60, y: 20 } },
  market: { title: "MARKET.EXE — Source & List", icon: "🛒", component: Market, width: 650, defaultPos: { x: 100, y: 40 } },
  hardware: { title: "HARDWARE.SHOP — Upgrades", icon: "🖥️", component: Hardware, width: 500, defaultPos: { x: 140, y: 60 } },
  mail: { title: "SHELL.MAIL — Inbox", icon: "📬", component: ShellMail, width: 600, height: 420, defaultPos: { x: 120, y: 50 } },
};

function OpenWindows() {
  const openWindows = useGameStore((s) => s.openWindows);

  return (
    <>
      {openWindows.map((appId) => {
        const def = WINDOW_DEFS[appId];
        if (!def) return null;
        const Content = def.component;
        return (
          <AppWindow
            key={appId}
            appId={appId}
            title={def.title}
            icon={def.icon}
            width={def.width}
            height={def.height}
            defaultPos={def.defaultPos}
          >
            <Content />
          </AppWindow>
        );
      })}
    </>
  );
}

function useGameLoop() {
  useEffect(() => {
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

        {/* Center — Event log + windows */}
        <div className="flex-1 relative">
          <EventLog />
          <OpenWindows />
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
