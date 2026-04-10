import { useEffect, useRef } from "react";
import { useGameStore } from "../store/gameStore";
import type { EventLevel } from "../types";

const levelColor: Record<EventLevel, string> = {
  system: "text-shell-cyan",
  agent: "text-shell-good",
  warning: "text-shell-warn",
  danger: "text-shell-danger",
  good: "text-shell-good",
  info: "text-shell-text",
};

const pad = (n: number) => n.toString().padStart(2, "0");

export function EventLog() {
  const events = useGameStore((s) => s.events);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  return (
    <div className="shell-panel flex flex-col h-full overflow-hidden">
      <div className="shell-title flex items-center justify-between">
        <span>📜 EVENT.LOG</span>
        <span className="text-shell-dim normal-case tracking-normal">
          [{events.length} entries]
        </span>
      </div>
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto log-scroll p-3 font-mono text-[13px] leading-relaxed bg-shell-bg"
      >
        {events.map((e) => {
          const ts = `D${e.timestamp.day} ${pad(e.timestamp.hour)}:${pad(e.timestamp.minute)}`;
          return (
            <div key={e.id} className="mb-1 flex gap-2 animate-slide-in">
              <span className="text-shell-dim shrink-0">[{ts}]</span>
              {e.icon && <span className="shrink-0">{e.icon}</span>}
              <span className={levelColor[e.level]}>
                {e.source && (
                  <span className="font-bold">[{e.source}] </span>
                )}
                {e.message}
              </span>
            </div>
          );
        })}
        <div className="text-shell-good">
          <span className="animate-blink">▌</span>
        </div>
      </div>
    </div>
  );
}
