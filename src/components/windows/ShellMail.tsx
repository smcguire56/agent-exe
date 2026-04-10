import { useState } from "react";
import { useGameStore } from "../../store/gameStore";
import type { Mail, MailCategory } from "../../types";

const CATEGORY_ICONS: Record<MailCategory, string> = {
  sales: "💰",
  complaint: "😡",
  agent: "🤖",
  system: "💾",
  spam: "🗑️",
};

const CATEGORY_COLORS: Record<MailCategory, string> = {
  sales: "text-shell-good",
  complaint: "text-shell-danger",
  agent: "text-shell-cyan",
  system: "text-shell-dim",
  spam: "text-shell-warn",
};

function MailRow({
  mail,
  selected,
  onSelect,
}: {
  mail: Mail;
  selected: boolean;
  onSelect: () => void;
}) {
  const readMail = useGameStore((s) => s.readMail);

  return (
    <button
      onClick={() => {
        if (!mail.read) readMail(mail.id);
        onSelect();
      }}
      className={`w-full text-left p-2 font-mono text-xs border-b border-shell-border hover:bg-shell-border/30 flex items-start gap-2 ${
        selected ? "bg-shell-border/50" : ""
      } ${!mail.read ? "font-bold" : ""}`}
    >
      <span className={CATEGORY_COLORS[mail.category]}>
        {CATEGORY_ICONS[mail.category]}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex justify-between gap-2">
          <span className={`truncate ${!mail.read ? "text-shell-text" : "text-shell-dim"}`}>
            {mail.from}
          </span>
          <span className="text-shell-dim text-[10px] shrink-0">
            D{mail.timestamp.day} {String(mail.timestamp.hour).padStart(2, "0")}:{String(mail.timestamp.minute).padStart(2, "0")}
          </span>
        </div>
        <div className={`truncate ${!mail.read ? "text-shell-text" : "text-shell-dim"}`}>
          {mail.subject}
        </div>
      </div>
      {!mail.read && (
        <span className="w-2 h-2 rounded-full bg-shell-cyan shrink-0 mt-1.5" />
      )}
    </button>
  );
}

function MailDetail({ mail }: { mail: Mail }) {
  const deleteMail = useGameStore((s) => s.deleteMail);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-3 py-2 border-b border-shell-border bg-shell-panel2">
        <div className="font-mono text-xs text-shell-text font-bold">
          {mail.subject}
        </div>
        <div className="font-mono text-[10px] text-shell-dim mt-0.5 flex justify-between">
          <span>
            From: <span className={CATEGORY_COLORS[mail.category]}>{mail.from}</span>
          </span>
          <span>
            {CATEGORY_ICONS[mail.category]} {mail.category.toUpperCase()}
          </span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto log-scroll p-3">
        <div className="font-mono text-xs text-shell-text leading-relaxed whitespace-pre-wrap">
          {mail.body}
        </div>
      </div>
      <div className="border-t border-shell-border bg-shell-panel2 px-3 py-1 flex justify-end">
        <button
          onClick={() => deleteMail(mail.id)}
          className="shell-button !text-shell-danger text-[10px]"
        >
          🗑 DELETE
        </button>
      </div>
    </div>
  );
}

const FILTER_OPTIONS: { label: string; value: MailCategory | "all" }[] = [
  { label: "All", value: "all" },
  { label: "💰 Sales", value: "sales" },
  { label: "😡 Complaints", value: "complaint" },
  { label: "🤖 Agent", value: "agent" },
  { label: "💾 System", value: "system" },
  { label: "🗑️ Spam", value: "spam" },
];

export function ShellMail() {
  const mails = useGameStore((s) => s.mails);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<MailCategory | "all">("all");

  const filtered = filter === "all"
    ? mails
    : mails.filter((m) => m.category === filter);

  // Show newest first
  const sorted = [...filtered].reverse();

  const selectedMail = mails.find((m) => m.id === selectedId) ?? null;
  const unreadCount = mails.filter((m) => !m.read).length;

  return (
    <>
      {/* Filter bar */}
      <div className="px-2 py-1 border-b border-shell-border bg-shell-panel2 flex gap-1 flex-wrap">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`px-2 py-0.5 font-mono text-[10px] rounded ${
              filter === opt.value
                ? "bg-shell-border text-shell-cyan"
                : "text-shell-dim hover:text-shell-text"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Split pane */}
      <div className="flex-1 overflow-hidden flex">
        {/* Mail list */}
        <div className="w-[45%] border-r border-shell-border overflow-y-auto log-scroll">
          {sorted.length === 0 ? (
            <div className="text-shell-dim font-mono text-xs p-3">
              // Inbox empty. Enjoy the silence.
            </div>
          ) : (
            sorted.map((m) => (
              <MailRow
                key={m.id}
                mail={m}
                selected={m.id === selectedId}
                onSelect={() => setSelectedId(m.id)}
              />
            ))
          )}
        </div>

        {/* Detail pane */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedMail ? (
            <MailDetail mail={selectedMail} />
          ) : (
            <div className="flex-1 flex items-center justify-center text-shell-dim font-mono text-xs">
              // Select a message to read
            </div>
          )}
        </div>
      </div>

      {/* Status bar */}
      <div className="border-t-2 border-shell-border bg-shell-panel2 px-3 py-1 font-mono text-xs text-shell-dim flex justify-between">
        <span>
          📬 {mails.length} message{mails.length !== 1 ? "s" : ""} · {unreadCount} unread
        </span>
        <span>SHELL.MAIL v0.1</span>
      </div>
    </>
  );
}
