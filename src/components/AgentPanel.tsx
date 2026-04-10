import { useGameStore, maxAgents, HIRE_COST } from "../store/gameStore";
import type { Agent } from "../types";

const statusColor: Record<Agent["status"], string> = {
  idle: "text-shell-dim",
  working: "text-shell-good",
  error: "text-shell-warn",
  rogue: "text-shell-danger",
};

const statusDot: Record<Agent["status"], string> = {
  idle: "●",
  working: "▶",
  error: "!",
  rogue: "☠",
};

function AgentRow({ agent }: { agent: Agent }) {
  const assignTask = useGameStore((s) => s.assignTask);

  return (
    <div className="shell-panel-inset p-2 mb-2 font-mono text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          <div>
            <div className="text-shell-text font-bold uppercase tracking-wide">
              {agent.name}
            </div>
            <div className="text-shell-dim">tier {agent.tier}</div>
          </div>
        </div>
        <div className={`${statusColor[agent.status]} text-right`}>
          <div className="text-base leading-none">
            {statusDot[agent.status]}
          </div>
          <div className="uppercase">{agent.status}</div>
        </div>
      </div>
      {agent.currentTask && (
        <div className="mt-2 text-shell-cyan border-t border-shell-border pt-1">
          ↳ {agent.currentTask.label}{" "}
          <span className="text-shell-dim">
            ({agent.currentTask.ticksRemaining}t)
          </span>
        </div>
      )}
      <div className="mt-1 text-shell-dim italic">"{agent.mood}"</div>
      {agent.status === "idle" && (
        <button
          onClick={() => assignTask(agent.id)}
          className="shell-button w-full mt-2 !text-shell-cyan"
        >
          ▶ ASSIGN: SOURCE
        </button>
      )}
    </div>
  );
}

export function AgentPanel() {
  const agents = useGameStore((s) => s.agents);
  const hardware = useGameStore((s) => s.hardware);
  const money = useGameStore((s) => s.money);
  const hireAgent = useGameStore((s) => s.hireAgent);

  const cap = maxAgents(hardware);
  const atCapacity = agents.length >= cap;
  const tooPoor = money < HIRE_COST;
  const hireDisabled = atCapacity || tooPoor;

  const hireLabel = atCapacity
    ? `AT CAPACITY ${agents.length}/${cap}`
    : tooPoor
      ? `NEED $${HIRE_COST}`
      : `+ HIRE ($${HIRE_COST})`;

  return (
    <div className="shell-panel flex flex-col h-full overflow-hidden">
      <div className="shell-title flex justify-between">
        <span>🤖 AGENTS</span>
        <span data-testid="agent-capacity">
          [{agents.length}/{cap}]
        </span>
      </div>
      <div className="flex-1 overflow-y-auto log-scroll p-2">
        {agents.map((a) => (
          <AgentRow key={a.id} agent={a} />
        ))}
        <button
          onClick={hireAgent}
          disabled={hireDisabled}
          data-testid="hire-agent"
          className={`shell-button w-full mt-2 ${
            hireDisabled
              ? "!text-shell-dim !cursor-not-allowed"
              : "!text-shell-good"
          }`}
        >
          {hireLabel}
        </button>
      </div>
    </div>
  );
}
