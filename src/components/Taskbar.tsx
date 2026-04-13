import { useState } from "react";
import { useGameStore } from "../store/gameStore";

const APPS: { id: string; label: string; icon: string }[] = [
  { id: "agentHQ", label: "AgentHQ", icon: "🤖" },
  { id: "market", label: "Market", icon: "🛒" },
  { id: "apartment", label: "Apartment", icon: "🛋️" },
];

export function Taskbar() {
  const openWindows = useGameStore((s) => s.openWindows);
  const toggleWindow = useGameStore((s) => s.toggleWindow);
  const focusWindow = useGameStore((s) => s.focusWindow);
  const unreadMails = useGameStore((s) => s.mails.filter((m) => !m.read).length);
  const saveGame = useGameStore((s) => s.saveGame);
  const paused = useGameStore((s) => s.paused);
  const setPaused = useGameStore((s) => s.setPaused);
  const [startOpen, setStartOpen] = useState(false);

  return (
    <div className="shell-panel flex items-center px-2 py-1 gap-2 border-t-2">
      <div className="relative">
        <button
          onClick={() => setStartOpen(!startOpen)}
          className="shell-button !text-shell-cyan !py-1.5 flex items-center gap-2"
        >
          <span>▣</span>
          <span>START</span>
        </button>
        {startOpen && (
          <div className="absolute bottom-full left-0 mb-1 w-48 shell-panel border-2 border-shell-border z-50">
            <button
              onClick={() => { saveGame(); setStartOpen(false); }}
              className="w-full text-left px-3 py-1.5 font-mono text-xs text-shell-text hover:bg-shell-border flex items-center gap-2"
            >
              💾 Backup to Cloud
            </button>
            <button
              onClick={() => { setPaused(!paused); setStartOpen(false); }}
              className="w-full text-left px-3 py-1.5 font-mono text-xs text-shell-text hover:bg-shell-border flex items-center gap-2"
            >
              {paused ? "▶ Resume" : "⏸ Pause"}
            </button>
            <div className="border-t border-shell-border" />
            <div className="px-3 py-1 font-mono text-[10px] text-shell-dim">
              SHELLOS v0.1.4
            </div>
          </div>
        )}
      </div>
      <div className="h-6 w-px bg-shell-border" />
      {APPS.map((app) => {
        const isOpen = openWindows.includes(app.id);
        return (
          <button
            key={app.id}
            onClick={() => {
              if (isOpen) {
                focusWindow(app.id);
              } else {
                toggleWindow(app.id);
              }
            }}
            onDoubleClick={() => {
              if (isOpen) toggleWindow(app.id);
            }}
            className={`shell-button flex items-center gap-2 relative ${
              isOpen ? "!bg-shell-border !text-shell-cyan" : ""
            }`}
          >
            <span>{app.icon}</span>
            <span>{app.label}</span>
            {app.id === "mail" && unreadMails > 0 && (
              <span className="absolute -top-1 -right-1 bg-shell-danger text-shell-bg rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-bold">
                {unreadMails > 9 ? "9+" : unreadMails}
              </span>
            )}
          </button>
        );
      })}
      <div className="flex-1" />
      <div className="font-mono text-xs text-shell-dim px-2">
        🔊 ▒ 📡 ▒ 🔋 87%
      </div>
    </div>
  );
}
