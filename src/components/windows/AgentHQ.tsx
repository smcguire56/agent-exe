import { useGameStore } from "../../store/gameStore";

export function AgentHQ() {
  const agents = useGameStore((s) => s.agents);

  return (
    <div className="flex-1 p-4 overflow-y-auto log-scroll font-mono text-sm">
      <p className="text-shell-dim mb-4">
        // TODO: agent hiring, firing, settings, mood management
      </p>
      <ul className="space-y-2">
        {agents.map((a) => (
          <li key={a.id} className="shell-panel-inset p-2 text-shell-text">
            {a.name} — tier {a.tier} — {a.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
