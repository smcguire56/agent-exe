import { useState } from "react";
import { useGameStore, maxAgents, HIRE_COST } from "../../store/gameStore";
import type { Agent } from "../../types";

function AgentRow({ agent }: { agent: Agent }) {
  const assignTask = useGameStore((s) => s.assignTask);
  const statusColor =
    agent.status === "working"
      ? "text-shell-cyan"
      : agent.status === "error"
        ? "text-shell-danger"
        : agent.status === "rogue"
          ? "text-shell-warn"
          : "text-shell-dim";

  return (
    <div className="shell-panel-inset p-2 mb-2 font-mono text-xs">
      <div className="flex justify-between items-start gap-2">
        <div className="min-w-0">
          <div className="text-shell-text font-bold">
            {agent.name}{" "}
            <span className="text-shell-dim font-normal">T{agent.tier}</span>
          </div>
          <div className={`${statusColor} uppercase text-[10px]`}>
            {agent.status}
            {agent.currentTask ? ` — ${agent.currentTask.label}` : ""}
          </div>
          <div className="text-shell-dim mt-0.5 flex gap-3">
            <span>SPD {agent.speed}</span>
            <span>ACC {Math.round(agent.accuracy * 100)}%</span>
          </div>
          {agent.traits.length > 0 && (
            <div className="text-shell-warn text-[10px] mt-0.5">
              {agent.traits.join(" · ")}
            </div>
          )}
          <div className="text-shell-dim italic text-[10px] mt-0.5">
            mood: {agent.mood}
          </div>
        </div>
        <div className="shrink-0 flex flex-col gap-1">
          {agent.status === "idle" && (
            <button
              onClick={() => assignTask(agent.id)}
              className="shell-button !text-shell-good"
              data-testid={`assign-${agent.id}`}
            >
              ▶ TASK
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function CandidateRow({ agent }: { agent: Agent }) {
  const hireCandidate = useGameStore((s) => s.hireCandidate);
  const money = useGameStore((s) => s.money);
  const agents = useGameStore((s) => s.agents);
  const hardware = useGameStore((s) => s.hardware);
  const cap = maxAgents(hardware);
  const canAfford = money >= agent.cost;
  const hasSlotsOpen = agents.length < cap;

  return (
    <div className="shell-panel-inset p-3 mb-2 font-mono text-xs">
      <div className="flex justify-between items-start gap-2">
        <div className="min-w-0">
          <div className="text-shell-text font-bold text-sm">
            {agent.name}
          </div>
          <div className="text-shell-dim mt-0.5 flex gap-3">
            <span>SPD {agent.speed}</span>
            <span>ACC {Math.round(agent.accuracy * 100)}%</span>
            <span>WAGE ${agent.wage}/day</span>
          </div>
          <div className="text-shell-warn text-[10px] mt-1">
            {agent.traits.join(" · ")}
          </div>
          <div className="text-shell-dim italic mt-1 leading-snug">
            "{agent.bio}"
          </div>
        </div>
        <button
          onClick={() => hireCandidate(agent.id)}
          disabled={!canAfford || !hasSlotsOpen}
          className={`shell-button shrink-0 ${
            canAfford && hasSlotsOpen
              ? "!text-shell-good"
              : "!text-shell-dim !cursor-not-allowed"
          }`}
        >
          HIRE ${agent.cost}
        </button>
      </div>
    </div>
  );
}

export function AgentHQ() {
  const [tab, setTab] = useState<"roster" | "hire">("roster");
  const agents = useGameStore((s) => s.agents);
  const hardware = useGameStore((s) => s.hardware);
  const hireCandidates = useGameStore((s) => s.hireCandidates);
  const hireCandidatesDay = useGameStore((s) => s.hireCandidatesDay);
  const refreshCandidates = useGameStore((s) => s.refreshCandidates);
  const cap = maxAgents(hardware);

  return (
    <>
      {/* Tab bar */}
      <div className="flex border-b-2 border-shell-border bg-shell-panel2">
        <button
          onClick={() => setTab("roster")}
          className={`px-4 py-1 font-mono text-xs uppercase tracking-wider ${
            tab === "roster"
              ? "text-shell-cyan bg-shell-bg border-b-2 border-shell-cyan -mb-[2px]"
              : "text-shell-dim hover:text-shell-text"
          }`}
        >
          📋 Roster ({agents.length}/{cap})
        </button>
        <button
          onClick={() => setTab("hire")}
          className={`px-4 py-1 font-mono text-xs uppercase tracking-wider relative ${
            tab === "hire"
              ? "text-shell-cyan bg-shell-bg border-b-2 border-shell-cyan -mb-[2px]"
              : "text-shell-dim hover:text-shell-text"
          }`}
        >
          🤝 Hire
          {hireCandidates.length > 0 && tab !== "hire" && (
            <span className="absolute -top-1 -right-1 bg-shell-good text-shell-bg rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-bold">
              {hireCandidates.length}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto log-scroll p-3">
        {tab === "roster" && (
          <>
            {agents.length === 0 ? (
              <div className="text-shell-dim font-mono text-xs p-2">
                // No agents. You are truly alone.
              </div>
            ) : (
              agents.map((a) => <AgentRow key={a.id} agent={a} />)
            )}
          </>
        )}

        {tab === "hire" && (
          <>
            <div className="text-shell-dim font-mono text-[10px] mb-3 flex justify-between items-center">
              <span>
                Candidates refresh every 10 days (last: day {hireCandidatesDay})
              </span>
              <button
                onClick={refreshCandidates}
                className="shell-button !text-shell-dim !text-[10px]"
              >
                ↻ REFRESH
              </button>
            </div>

            {agents.length >= cap && (
              <div className="shell-panel-inset p-2 mb-3 text-shell-danger font-mono text-xs">
                ⚠ No free CPU slots ({agents.length}/{cap}). Upgrade hardware
                to hire more agents.
              </div>
            )}

            {hireCandidates.length === 0 ? (
              <div className="text-shell-dim font-mono text-xs p-2">
                // No applicants right now. Check back in a few days.
              </div>
            ) : (
              hireCandidates.map((c) => (
                <CandidateRow key={c.id} agent={c} />
              ))
            )}
          </>
        )}
      </div>

      {/* Status bar */}
      <div className="border-t-2 border-shell-border bg-shell-panel2 px-3 py-1 font-mono text-xs text-shell-dim flex justify-between">
        <span>
          👥 {agents.length}/{cap} agents · 💰 hire from ${HIRE_COST}
        </span>
        <span>AGENT.HQ v0.2</span>
      </div>
    </>
  );
}
