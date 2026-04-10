import { useGameStore, UPGRADE_CPU_COST, maxAgents } from "../../store/gameStore";

interface RowProps {
  label: string;
  level: number;
  cost: number;
  detail: string;
  canAfford: boolean;
  onUpgrade?: () => void;
  disabled?: boolean;
  testId?: string;
}

function UpgradeRow({
  label,
  level,
  cost,
  detail,
  canAfford,
  onUpgrade,
  disabled,
  testId,
}: RowProps) {
  const isDisabled = disabled || !onUpgrade || !canAfford;
  return (
    <div className="shell-panel-inset p-3 mb-2 font-mono text-xs">
      <div className="flex justify-between items-start gap-2">
        <div>
          <div className="text-shell-text uppercase font-bold">
            {label} <span className="text-shell-cyan">lv {level}</span>
          </div>
          <div className="text-shell-dim mt-0.5">{detail}</div>
        </div>
        <button
          onClick={onUpgrade}
          disabled={isDisabled}
          data-testid={testId}
          className={`shell-button shrink-0 ${
            isDisabled
              ? "!text-shell-dim !cursor-not-allowed"
              : "!text-shell-good"
          }`}
        >
          ⬆ ${cost}
        </button>
      </div>
    </div>
  );
}

export function Hardware() {
  const hw = useGameStore((s) => s.hardware);
  const money = useGameStore((s) => s.money);
  const agents = useGameStore((s) => s.agents);
  const upgradeCpu = useGameStore((s) => s.upgradeCpu);
  const close = () => useGameStore.getState().setActiveApp(null);

  const cap = maxAgents(hw);

  return (
    <div className="shell-panel absolute inset-4 flex flex-col z-10">
      <div className="shell-title flex items-center justify-between">
        <span>🖥️ HARDWARE.SHOP — Upgrades</span>
        <button
          onClick={close}
          className="shell-button !py-0 !px-2 !text-shell-danger"
        >
          X
        </button>
      </div>

      <div className="flex-1 overflow-y-auto log-scroll bg-shell-bg p-4 font-mono text-sm">
        <div className="text-shell-cyan uppercase text-xs mb-2 border-b border-shell-border pb-1">
          Available Upgrades
        </div>

        <UpgradeRow
          label="CPU"
          level={hw.cpu}
          cost={UPGRADE_CPU_COST}
          detail={`Agent slots: ${agents.length}/${cap} — upgrade to unlock one more.`}
          canAfford={money >= UPGRADE_CPU_COST}
          onUpgrade={upgradeCpu}
          testId="upgrade-cpu"
        />
        <UpgradeRow
          label="RAM"
          level={hw.ram}
          cost={750}
          detail="// TODO: concurrent tasks per agent"
          canAfford={false}
          disabled
        />
        <UpgradeRow
          label="Cooling"
          level={hw.cooling}
          cost={500}
          detail="// TODO: reduces heat gain per error"
          canAfford={false}
          disabled
        />
        <UpgradeRow
          label="Storage"
          level={hw.storage}
          cost={400}
          detail="// TODO: max inventory capacity"
          canAfford={false}
          disabled
        />

        <div className="text-shell-dim text-xs mt-4 italic">
          NOTE: the fan is making 'the sound.' Again.
        </div>
      </div>

      <div className="border-t-2 border-shell-border bg-shell-panel2 px-3 py-1 font-mono text-xs text-shell-dim flex justify-between">
        <span>💰 ${money}</span>
        <span>HARDWARE.SHOP v0.1</span>
      </div>
    </div>
  );
}
