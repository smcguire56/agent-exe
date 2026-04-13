import { useRef, useCallback, useState, type ReactNode } from "react";
import { useGameStore } from "../store/gameStore";

interface AppWindowProps {
  appId: string;
  title: string;
  icon: string;
  children: ReactNode;
  defaultPos?: { x: number; y: number };
  width?: number;
  height?: number;
}

export function AppWindow({
  appId,
  title,
  icon,
  children,
  defaultPos = { x: 80, y: 30 },
  width = 600,
  height = 420,
}: AppWindowProps) {
  const closeWindow = useGameStore((s) => s.closeWindow);
  const focusWindow = useGameStore((s) => s.focusWindow);
  const windowZOrder = useGameStore((s) => s.windowZOrder);

  const zIndex = 10 + windowZOrder.indexOf(appId);

  const [pos, setPos] = useState(defaultPos);
  const [size, setSize] = useState({ w: width, h: height });
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });
  const resizing = useRef(false);
  const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0 });

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      dragging.current = true;
      offset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      focusWindow(appId);
    },
    [pos, appId, focusWindow],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return;
      setPos({
        x: e.clientX - offset.current.x,
        y: e.clientY - offset.current.y,
      });
    },
    [],
  );

  const onPointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  const onResizeDown = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      resizing.current = true;
      resizeStart.current = { x: e.clientX, y: e.clientY, w: size.w, h: size.h };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      focusWindow(appId);
    },
    [size, appId, focusWindow],
  );

  const onResizeMove = useCallback((e: React.PointerEvent) => {
    if (!resizing.current) return;
    const dx = e.clientX - resizeStart.current.x;
    const dy = e.clientY - resizeStart.current.y;
    setSize({
      w: Math.max(320, resizeStart.current.w + dx),
      h: Math.max(200, resizeStart.current.h + dy),
    });
  }, []);

  const onResizeUp = useCallback(() => {
    resizing.current = false;
  }, []);

  return (
    <div
      className="absolute shell-panel flex flex-col"
      style={{
        left: pos.x,
        top: pos.y,
        width: size.w,
        height: size.h,
        zIndex,
        boxShadow: "6px 6px 0 rgba(0,0,0,0.5), 3px 3px 0 rgba(0,0,0,0.3)",
      }}
      onPointerDown={() => focusWindow(appId)}
    >
      {/* Title bar — draggable */}
      <div
        className="shell-title flex items-center justify-between cursor-grab active:cursor-grabbing select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <span>
          {icon} {title}
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => closeWindow(appId)}
            className="shell-button !py-0 !px-2 !text-shell-danger"
          >
            X
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col bg-shell-bg">
        {children}
      </div>

      {/* Resize handle (bottom-right corner) */}
      <div
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
        title="Drag to resize"
        onPointerDown={onResizeDown}
        onPointerMove={onResizeMove}
        onPointerUp={onResizeUp}
        style={{
          background:
            "linear-gradient(135deg, transparent 0%, transparent 55%, #3a4554 55%, #3a4554 65%, transparent 65%, transparent 75%, #3a4554 75%, #3a4554 85%, transparent 85%)",
        }}
      />
    </div>
  );
}
