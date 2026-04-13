import type { Agent } from "../types";

function hashString(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h) + s.charCodeAt(i);
  return Math.abs(h);
}

const SKIN_TONES = ["#f4c8a0", "#e6b088", "#c88a5c", "#8b5e3c", "#f8dfc2", "#a67148"];
const HAIR_COLORS = ["#1a1208", "#3a2010", "#6b3a1a", "#c89a50", "#222222", "#4a2a18", "#8a5a30"];

function getLook(agent: Agent) {
  const h = hashString(agent.name);
  const hue = h % 360;
  return {
    skin: SKIN_TONES[h % SKIN_TONES.length],
    hair: HAIR_COLORS[(h >> 4) % HAIR_COLORS.length],
    tie: `hsl(${hue}, 75%, 58%)`,
    tieDark: `hsl(${hue}, 70%, 38%)`,
  };
}

type Expression = "happy" | "content" | "neutral" | "sad" | "depressed" | "shocked" | "angry";

function getExpression(agent: Agent): Expression {
  if (agent.status === "error") return "shocked";
  if (agent.status === "rogue") return "angry";
  const m = agent.mood;
  if (m >= 75) return "happy";
  if (m >= 50) return "content";
  if (m >= 25) return "neutral";
  if (m >= 10) return "sad";
  return "depressed";
}

interface FaceProps {
  expression: Expression;
}

function Face({ expression }: FaceProps) {
  // Eye and mouth shapes per expression. All coordinates in the 100x100 viewBox.
  switch (expression) {
    case "happy":
      return (
        <>
          <circle cx="43" cy="26" r="1.6" fill="#000" />
          <circle cx="57" cy="26" r="1.6" fill="#000" />
          <path d="M 42 32 Q 50 38 58 32" fill="none" stroke="#000" strokeWidth="1.6" strokeLinecap="round" />
        </>
      );
    case "content":
      return (
        <>
          <circle cx="43" cy="26" r="1.5" fill="#000" />
          <circle cx="57" cy="26" r="1.5" fill="#000" />
          <path d="M 43 32 Q 50 35 57 32" fill="none" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
        </>
      );
    case "neutral":
      return (
        <>
          <circle cx="43" cy="26" r="1.4" fill="#000" />
          <circle cx="57" cy="26" r="1.4" fill="#000" />
          <line x1="44" y1="33" x2="56" y2="33" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
        </>
      );
    case "sad":
      return (
        <>
          <circle cx="43" cy="27" r="1.4" fill="#000" />
          <circle cx="57" cy="27" r="1.4" fill="#000" />
          <path d="M 42 35 Q 50 30 58 35" fill="none" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
        </>
      );
    case "depressed":
      return (
        <>
          <line x1="40" y1="27" x2="46" y2="27" stroke="#000" strokeWidth="1.6" strokeLinecap="round" />
          <line x1="54" y1="27" x2="60" y2="27" stroke="#000" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M 41 36 Q 50 30 59 36" fill="none" stroke="#000" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="43" cy="32" r="1" fill="#6ab8ff" opacity="0.8" />
        </>
      );
    case "shocked":
      return (
        <>
          <path d="M 40 24 L 46 28 M 46 24 L 40 28" stroke="#ff3860" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M 54 24 L 60 28 M 60 24 L 54 28" stroke="#ff3860" strokeWidth="1.8" strokeLinecap="round" />
          <ellipse cx="50" cy="34" rx="3" ry="2.2" fill="#000" />
        </>
      );
    case "angry":
      return (
        <>
          <path d="M 40 24 L 46 27" stroke="#000" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M 60 24 L 54 27" stroke="#000" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="43" cy="28" r="1.4" fill="#ff3860" />
          <circle cx="57" cy="28" r="1.4" fill="#ff3860" />
          <path d="M 42 34 L 46 33 L 50 35 L 54 33 L 58 34" fill="none" stroke="#000" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </>
      );
  }
}

interface CrewmateSpriteProps {
  agent: Agent;
  size?: number;
}

export function CrewmateSprite({ agent, size = 46 }: CrewmateSpriteProps) {
  const look = getLook(agent);
  const expression = getExpression(agent);

  const wrapperAnim =
    agent.status === "working"
      ? "animate-crew-work"
      : agent.status === "idle"
        ? "animate-crew-breath"
        : agent.status === "error"
          ? "animate-crew-glitch"
          : "animate-crew-rogue";

  return (
    <div
      className={`inline-block ${wrapperAnim}`}
      style={{ width: size, height: size, transformOrigin: "50% 100%" }}
    >
      <svg viewBox="0 0 100 100" width={size} height={size} style={{ overflow: "visible" }}>
        {/* shadow */}
        <ellipse cx="50" cy="96" rx="22" ry="2.2" fill="rgba(0,0,0,0.55)" />

        {/* legs (suit pants) */}
        <rect x="38" y="78" width="9" height="16" rx="1" fill="#15151c" stroke="#000" strokeWidth="1.5" />
        <rect x="53" y="78" width="9" height="16" rx="1" fill="#15151c" stroke="#000" strokeWidth="1.5" />

        {/* shoes */}
        <ellipse cx="42" cy="95" rx="5" ry="1.8" fill="#000" />
        <ellipse cx="58" cy="95" rx="5" ry="1.8" fill="#000" />

        {/* suit jacket — trapezoid */}
        <path
          d="M 26 46 Q 28 44 32 43 L 44 42 L 50 46 L 56 42 L 68 43 Q 72 44 74 46 L 76 80 L 24 80 Z"
          fill="#1c1c26"
          stroke="#000"
          strokeWidth="2"
        />

        {/* lapel shading */}
        <path d="M 32 43 L 44 42 L 50 54 L 44 56 Z" fill="#0e0e14" stroke="#000" strokeWidth="1.2" />
        <path d="M 68 43 L 56 42 L 50 54 L 56 56 Z" fill="#0e0e14" stroke="#000" strokeWidth="1.2" />

        {/* shirt triangle */}
        <polygon points="44,42 56,42 50,54" fill="#f4f4f6" stroke="#000" strokeWidth="1.2" />

        {/* tie (agent color) */}
        <polygon
          points="47,48 53,48 54,52 55,72 50,76 45,72 46,52"
          fill={look.tie}
          stroke="#000"
          strokeWidth="1.3"
        />
        <polygon points="47,48 53,48 50,54" fill={look.tieDark} stroke="#000" strokeWidth="1" />

        {/* neck */}
        <rect x="45" y="36" width="10" height="7" fill={look.skin} stroke="#000" strokeWidth="1.5" />

        {/* head */}
        <circle cx="50" cy="24" r="15" fill={look.skin} stroke="#000" strokeWidth="2" />

        {/* ears */}
        <ellipse cx="35" cy="25" rx="2" ry="3" fill={look.skin} stroke="#000" strokeWidth="1.3" />
        <ellipse cx="65" cy="25" rx="2" ry="3" fill={look.skin} stroke="#000" strokeWidth="1.3" />

        {/* hair */}
        <path
          d="M 35 20 Q 35 9 50 9 Q 65 9 65 20 Q 64 15 58 14 Q 52 13 48 15 Q 42 14 38 17 Q 36 18 35 20 Z"
          fill={look.hair}
          stroke="#000"
          strokeWidth="1.4"
        />

        {/* face */}
        <Face expression={expression} />

        {/* Tier 2: sunglasses overlay */}
        {agent.tier === 2 && (
          <>
            <rect x="38" y="22" width="10" height="5" rx="1" fill="#000" stroke="#000" strokeWidth="1" />
            <rect x="52" y="22" width="10" height="5" rx="1" fill="#000" stroke="#000" strokeWidth="1" />
            <line x1="48" y1="24" x2="52" y2="24" stroke="#000" strokeWidth="1.5" />
            <line x1="42" y1="23" x2="45" y2="22" stroke="#fff" strokeWidth="0.8" opacity="0.6" />
            <line x1="56" y1="23" x2="59" y2="22" stroke="#fff" strokeWidth="0.8" opacity="0.6" />
          </>
        )}

        {/* Tier 3: earpiece + coiled wire */}
        {agent.tier === 3 && (
          <>
            <circle cx="66" cy="24" r="1.8" fill="#222" stroke="#000" strokeWidth="0.8" />
            <path
              d="M 67 25 Q 70 28 68 32 Q 66 36 69 40"
              fill="none"
              stroke="#444"
              strokeWidth="1"
            />
          </>
        )}

        {/* status indicator glow (corner dot) */}
        {agent.status === "working" && (
          <circle cx="82" cy="50" r="2.5" fill="#39ff14">
            <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" />
          </circle>
        )}
        {agent.status === "error" && (
          <circle cx="82" cy="50" r="2.5" fill="#ff3860">
            <animate attributeName="opacity" values="1;0.2;1" dur="0.4s" repeatCount="indefinite" />
          </circle>
        )}
        {agent.status === "rogue" && (
          <circle cx="82" cy="50" r="2.5" fill="#ff6b00" />
        )}
      </svg>
    </div>
  );
}
