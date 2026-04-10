import { useGameStore } from "../store/gameStore";
import { hasSave } from "../systems/saveSystem";

interface BootScreenProps {
  onDone: () => void;
}

export function BootScreen({ onDone }: BootScreenProps) {
  const loadSave = useGameStore((s) => s.loadSave);
  const saveExists = hasSave();

  const handleContinue = () => {
    loadSave();
    onDone();
  };

  const handleNewGame = () => {
    onDone();
  };

  return (
    <div className="h-screen w-screen bg-shell-bg flex items-center justify-center font-mono">
      <div className="shell-panel max-w-lg w-full mx-4 p-0">
        <div className="shell-title flex items-center justify-between">
          <span>💾 SHELLOS BOOT SEQUENCE</span>
          <span className="text-shell-good animate-blink">█</span>
        </div>

        <div className="p-6 bg-shell-bg space-y-4">
          <div className="text-shell-cyan text-sm">
            <div>SHELLOS v0.1.4 — System Check</div>
            <div className="text-shell-dim text-xs mt-1">
              Loading kernel modules... <span className="text-shell-good">OK</span>
            </div>
            <div className="text-shell-dim text-xs">
              Loading dignity... <span className="text-shell-warn">NOT FOUND</span>
            </div>
            <div className="text-shell-dim text-xs">
              Establishing marketplace connection... <span className="text-shell-good">OK</span>
            </div>
          </div>

          {saveExists ? (
            <>
              <div className="shell-panel-inset p-3 text-shell-text text-xs leading-relaxed">
                Previous session detected. Your agents have been waiting.
                Bryan has been staring at the door.
              </div>

              <div className="text-shell-dim text-xs">
                Resume operation?
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleContinue}
                  className="shell-button flex-1 !text-shell-good text-sm py-2"
                >
                  ▶ CONTINUE
                </button>
                <button
                  onClick={handleNewGame}
                  className="shell-button flex-1 !text-shell-warn text-sm py-2"
                >
                  ⟳ NEW GAME
                </button>
              </div>

              <div className="text-shell-dim text-[10px] italic text-center">
                "Save corrupted. Just kidding. Everything's fine. Probably."
              </div>
            </>
          ) : (
            <>
              <div className="shell-panel-inset p-3 text-shell-text text-xs leading-relaxed">
                No previous session found. Starting fresh.
                This is either your first time, or you cleared your browser data
                in a moment of panic. Either way, welcome.
              </div>

              <button
                onClick={handleNewGame}
                className="shell-button w-full !text-shell-good text-sm py-2"
              >
                ▶ BOOT SHELLOS
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
