import { useEffect, type ReactNode } from "react";

interface DialogProps {
  open: boolean;
  title: string;
  titleIcon?: string;
  titleIconColor?: string;
  onClose: () => void;
  onEnter?: () => void;
  children: ReactNode;
  width?: number;
}

export function Dialog({
  open,
  title,
  titleIcon,
  titleIconColor = "text-shell-cyan",
  onClose,
  onEnter,
  children,
  width = 360,
}: DialogProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Enter" && onEnter) onEnter();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose, onEnter]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="shell-panel shadow-2xl font-mono"
        style={{ width }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shell-title flex items-center gap-2">
          {titleIcon && <span className={titleIconColor}>{titleIcon}</span>}
          <span>{title}</span>
        </div>
        {children}
      </div>
    </div>
  );
}

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "CONFIRM",
  cancelLabel = "CANCEL",
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirmColor = variant === "danger" ? "!text-shell-danger" : "!text-shell-warn";
  const iconColor = variant === "danger" ? "text-shell-danger" : "text-shell-warn";

  return (
    <Dialog
      open={open}
      title={title}
      titleIcon="⚠"
      titleIconColor={iconColor}
      onClose={onCancel}
      onEnter={onConfirm}
    >
      <div className="p-4">
        <div className="text-shell-text text-xs mb-2 leading-relaxed">
          {message}
        </div>
        <div className="text-shell-dim text-[10px] italic mb-4">
          // This action cannot be undone.
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="shell-button !text-shell-dim text-xs px-3"
            autoFocus
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`shell-button ${confirmColor} text-xs px-3`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
