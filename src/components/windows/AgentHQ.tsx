import { useGameStore } from "../../store/gameStore";

export function AgentHQ() {
  const agents = useGameStore((s) => s.agents);
  const close = () => useGameStore.getState().setActiveApp(null);

  return (
    <div className="shell-panel absolute inset-4 flex flex-col z-10">
      <div className="shell-title flex items-center justify-between">
        <span>🤖 AGENT.HQ — Personnel Manager</span>
        <button
          onClick={close}
          className="shell-button !py-0 !px-2 !text-shell-danger"
        >
          X
        </button>
      </div>
      <div className="flex-1 p-4 overflow-y-auto log-scroll bg-shell-bg font-mono text-sm">
        <p className="text-shell-dim mb-4">
          // TODO: agent hiring, firing, settings, mood management
        </p>
        <ul className="space-y-2">
          {agents.map((a) => (
            <li
              key={a.id}
              className="shell-panel-inset p-2 text-shell-text"
            >
              {a.name} — tier {a.tier} — {a.status}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
