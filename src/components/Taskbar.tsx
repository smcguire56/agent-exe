import { useGameStore } from "../store/gameStore";

const APPS: { id: string; label: string; icon: string }[] = [
  { id: "agentHQ", label: "AgentHQ", icon: "🤖" },
  { id: "market", label: "Market", icon: "🛒" },
  { id: "hardware", label: "Hardware", icon: "🖥️" },
  { id: "apartment", label: "Apartment", icon: "🛋️" },
];

export function Taskbar() {
  const activeApp = useGameStore((s) => s.activeApp);
  const setActiveApp = useGameStore((s) => s.setActiveApp);

  return (
    <div className="shell-panel flex items-center px-2 py-1 gap-2 border-t-2">
      <div className="shell-button !text-shell-cyan !py-1.5 mr-2 flex items-center gap-2">
        <span>▣</span>
        <span>START</span>
      </div>
      <div className="h-6 w-px bg-shell-border" />
      {APPS.map((app) => {
        const active = activeApp === app.id;
        return (
          <button
            key={app.id}
            onClick={() => setActiveApp(active ? null : app.id)}
            className={`shell-button flex items-center gap-2 ${
              active ? "!bg-shell-border !text-shell-cyan" : ""
            }`}
          >
            <span>{app.icon}</span>
            <span>{app.label}</span>
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
