import { useGameStore } from "../store/gameStore";

export function GameOverScreen() {
  const reason = useGameStore((s) => s.gameOverReason);
  const stats = useGameStore((s) => s.stats);
  const restart = useGameStore((s) => s.restart);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-shell-bg/90 backdrop-blur-sm font-mono">
      <div className="shell-panel max-w-xl w-full mx-4 p-0">
        <div className="shell-title flex items-center justify-between">
          <span>💀 GAME.OVER — You Have Been Cancelled</span>
          <span className="text-shell-danger animate-blink">█</span>
        </div>

        <div className="p-6 bg-shell-bg">
          <div className="text-shell-danger text-xl font-bold uppercase tracking-widest mb-2">
            SYSTEM HALTED
          </div>
          <div className="text-shell-dim text-xs mb-4">
            // cause of death: too much suspicion
          </div>

          <div className="shell-panel-inset p-3 mb-4 text-shell-text text-sm leading-relaxed">
            {reason ??
              "Something went wrong. Probably everything. No one is sure."}
          </div>

          <div className="text-shell-cyan uppercase text-xs mb-2 border-b border-shell-border pb-1">
            Final Report
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs mb-6">
            <div className="flex justify-between shell-panel-inset px-2 py-1">
              <span className="text-shell-dim">Days survived</span>
              <span className="text-shell-text">{stats.daysSurvived}</span>
            </div>
            <div className="flex justify-between shell-panel-inset px-2 py-1">
              <span className="text-shell-dim">Items sold</span>
              <span className="text-shell-text">{stats.itemsSold}</span>
            </div>
            <div className="flex justify-between shell-panel-inset px-2 py-1">
              <span className="text-shell-dim">Agents hired</span>
              <span className="text-shell-text">{stats.agentsHired}</span>
            </div>
            <div className="flex justify-between shell-panel-inset px-2 py-1">
              <span className="text-shell-dim">Total earned</span>
              <span className="text-shell-good">
                ${stats.totalEarned.toLocaleString()}
              </span>
            </div>
          </div>

          <button
            onClick={restart}
            data-testid="restart-button"
            className="shell-button w-full !text-shell-good text-sm py-2"
          >
            ▶ REBOOT SHELLOS (Restart Run)
          </button>
          <div className="text-shell-dim text-xs italic text-center mt-3">
            "Failure is just success with more paperwork." — Bryan, probably
          </div>
        </div>
      </div>
    </div>
  );
}
