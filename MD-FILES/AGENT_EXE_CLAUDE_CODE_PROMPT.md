# AGENT.EXE — Claude Code Project Prompt

## What We're Building
A browser-based game called "Agent.exe" — a fake desktop OS simulator where the player runs a chaotic online resale business using AI agents. Think Schedule 1 meets Papers Please, with Rick and Morty humor.

The ENTIRE game takes place on a single fake desktop called "ShellOS." No 3D, no world map — just a retro-looking operating system with apps, notifications, and agent chaos.

## Tech Stack
- **React 18 + TypeScript** (Vite for bundling)
- **Tailwind CSS** for styling
- **Zustand** for state management
- **No backend** — all game logic runs client-side
- **Save system** — localStorage (presented as "Cloud Backup" in-game)

## Game Architecture

### Core State (Zustand Store)
```
GameState {
  money: number
  time: { day: number, hour: number, minute: number }
  agents: Agent[]
  products: Product[]
  inventory: InventoryItem[]
  hardware: { cpu: number, ram: number, cooling: number, storage: number }
  heat: number (0-100)
  events: EventLog[]
  upgrades: Record<string, boolean>
  activeApp: string | null
}
```

### Agent Object
```
Agent {
  id: string
  name: string
  tier: 1 | 2 | 3
  status: 'idle' | 'working' | 'error' | 'rogue'
  speed: number (1-10)
  accuracy: number (0.0 - 1.0)
  riskTolerance: number (0.0 - 1.0)
  cost: number (hire cost)
  wage: number (per-cycle cost)
  traits: string[]
  currentTask: Task | null
  mood: string
  settings: {
    prioritizeProfit: boolean
    safetyMode: boolean
    autoFixErrors: boolean
  }
}
```

### Product Object
```
Product {
  id: string
  name: string
  tier: 1 | 2 | 3
  category: string
  buyPrice: number
  sellPrice: number
  risk: number (0-100)
  quality: 'unknown' | 'bad' | 'ok' | 'good' | 'excellent'
  inspected: boolean
  hiddenTrait: string | null  // funny hidden property
  listed: boolean
}
```

## UI Layout — "ShellOS"

The entire screen is one fake desktop:

```
┌──────────────────────────────────────────────────────┐
│ TOP BAR: 💰$420  ⚡CPU 35%  🌡️42°C  ⚠️Heat 12%  🕐Day 3 │
├──────────┬───────────────────────────┬───────────────┤
│          │                           │               │
│  AGENT   │     MAIN FEED / LOG      │   HARDWARE    │
│  LIST    │                           │   & STATS     │
│          │  (scrolling event log     │               │
│ Agent 1  │   with funny messages,   │  CPU: ████░   │
│  ● Idle  │   alerts, notifications) │  RAM: ██░░░   │
│          │                           │  COOL: ███░░  │
│ Agent 2  │                           │  STOR: █░░░░  │
│  ● Work  │                           │               │
│          │                           │  [Upgrade]    │
├──────────┴───────────────────────────┴───────────────┤
│ TASKBAR: [AgentHQ] [Market] [Hardware] [Apartment]   │
└──────────────────────────────────────────────────────┘
```

When the player clicks a taskbar app, it opens as a "window" overlaying the center panel. Windows can be closed with an X button.

## Visual Style
- Dark theme, retro OS aesthetic (think Windows 98 meets a hacker terminal)
- Monospace fonts for the log, clean sans-serif for UI
- Color coding: green = good, yellow = warning, red = critical, cyan = agent actions
- Slight scanline or CRT effect (subtle, CSS only)
- Chunky pixel-art style icons (use emoji as placeholder)

## The Game Loop (runs on a tick system)

Every game tick (~2 seconds real-time):
1. Advance game clock by 15 minutes
2. For each agent with a task:
   - Roll against accuracy to determine success/failure
   - If success: progress the task
   - If failure: generate a funny error event
   - Deduct agent wages
3. Check for random events (5% chance per tick)
4. Update CPU load, temperature, heat
5. Process any completed sales (money in)
6. Check for system warnings (overheating, high heat, etc.)

## Humor — THIS IS CRITICAL

The game's personality lives in the EVENT LOG. Every agent action should have funny log messages. The humor is Rick and Morty style: absurd, self-aware, a bit dark, never mean.

### Event Message Examples (use these as templates)

**Agent working normally:**
- "[Bryan] Sourcing products... found a crate of phone cases. They smell weird but they're cheap."
- "[Bryan] Listed 'Vintage Lamp' for $45. Added description: 'Lights up a room. Literally. That's what lamps do.'"
- "[Bryan] Fulfilled order #0042. Customer seems satisfied. Bryan seems surprised."

**Agent errors:**
- "[Bryan] ERROR: Listed price as $0.99 instead of $99. Bryan is 'very sorry' and 'having a day.'"
- "[Zara] Accidentally shipped product to own address. Claims it was 'a test.'"
- "[Bryan] Tried to source products. Got distracted reading customer reviews. Has been doing this for 2 hours."

**System messages:**
- "SYSTEM: CPU temperature rising. Consider upgrading cooling or having fewer ambitions."
- "SYSTEM: Storage at 80%. Your apartment is starting to look like a conspiracy theorist's office."
- "WARNING: Heat level increasing. Someone on Reddit is asking questions about your business."
- "SHELLOS: Update available. Installing... just kidding. We don't do that here."

**Random events:**
- "📦 A customer left a 1-star review: 'This candle smells like my uncle's regret. 10/10 would not recommend.'"
- "📧 New email from 'Totally Legit Suppliers Inc.' — Subject: 'DEAL OF A LIFETIME (not a scam)'"
- "⚠️ Bryan has changed his display name to 'The Bryan'. No one approved this."
- "🔥 A package was returned labeled 'CURSED.' Customer provided no further explanation."

### Agent Names (Tier 1 pool — pick randomly on hire)
Bryan, Todd, Pam, Desk Unit 4, Greg, Susan, Employee_03, Jeff (but spelt Geoff)

### Agent Names (Tier 2 pool)
Zara, Marcus, The Algorithm, profit_bot_9000, Slick, Vendetta

### Product Names (Tier 1 — Legal)
- "Phone Case (Slightly Sticky)"
- "USB Cable (Probably Works)"  
- "Scented Candle — 'Ocean Breeze' (Debatable)"
- "Self-Help Book: 'Hustle Harder, Cry Later'"
- "Mug That Says 'World's Okayest Boss'"
- "Desk Fan (One Speed: Chaos)"
- "Wireless Mouse (Sometimes Wireless, Sometimes Not)"
- "Novelty Socks (Pattern: Suspicious)"
- "Phone Stand (Architectural Integrity: Low)"
- "Motivational Poster: 'Believe In Your Shelf'"

### Hidden Product Traits (revealed if customer gets uninspected item)
- "Smells faintly of existential dread"
- "Makes a noise when no one is looking"
- "Arrived warm for no reason"
- "Came with a handwritten note that just says 'soon'"
- "Slightly magnetic"
- "Previous owner's energy is... strong"
- "Glows under UV light (concerning)"

## Tonight's Build Priority

Build these IN ORDER. Each one is a milestone you can stop at and still have something:

### Milestone 1: The Desktop (30 mins)
- ShellOS layout with top bar, left panel, center log, right panel, taskbar
- Static data, no game logic yet
- Just make it LOOK like a janky operating system

### Milestone 2: The Ticking Clock (20 mins)
- Game tick system (2 second interval)
- Day/time advancing in top bar
- Money display (start with $500)

### Milestone 3: One Agent Working (30 mins)
- Bryan (Tier 1) appears in left panel
- "Assign Task" button → Bryan starts "sourcing"
- After X ticks, Bryan completes task → funny log message → product appears
- Occasional error (random) → funny error log message

### Milestone 4: Selling Products (20 mins)
- Products appear in a simple inventory list
- "List for Sale" button
- After X ticks, item sells → money increases → log message
- Small chance of customer complaint event

### Milestone 5: Hardware Upgrade (15 mins)
- Right panel shows CPU level
- "Upgrade CPU" button (costs $1000)
- Upgrading unlocks hiring a 2nd agent

### Milestone 6: Events & Chaos (30 mins)
- Random event system (roll each tick)
- Pool of 15-20 funny events
- Events appear in the center log with icons
- Some events affect money/heat

### Milestone 7: Heat & Danger (15 mins)
- Heat meter in top bar
- Heat increases from errors, complaints
- Heat decreases over time slowly
- At 80%+ heat: warning messages appear
- At 100%: "GAME OVER — Operation shut down" screen with funny message

## Important Vibe Coding Notes

- START UGLY. Get it working, then make it pretty. The fun is in the game loop, not the CSS.
- The center log IS the game. If the log messages are funny and things are happening, it's already fun.
- Use emoji as placeholder icons everywhere. 🤖 for agents, 📦 for products, ⚠️ for warnings.
- Don't build a proper window manager yet — just toggle visibility of app panels.
- Keep all game data in one Zustand store. Don't overthink architecture tonight.
- When in doubt, add another funny log message.
- PLAYTEST CONSTANTLY. Run the dev server and watch the log scroll. If you're laughing, you're winning.

## File Structure
```
agent-exe/
├── src/
│   ├── App.tsx              # Main layout (ShellOS desktop)
│   ├── store/
│   │   └── gameStore.ts     # Zustand store (ALL game state)
│   ├── components/
│   │   ├── TopBar.tsx        # Money, CPU, temp, heat, clock
│   │   ├── AgentPanel.tsx    # Left panel — agent list
│   │   ├── EventLog.tsx      # Center — scrolling log (STAR OF THE SHOW)
│   │   ├── StatsPanel.tsx    # Right panel — hardware stats
│   │   ├── Taskbar.tsx       # Bottom — app buttons
│   │   └── windows/
│   │       ├── AgentHQ.tsx   # Agent management window
│   │       ├── Market.tsx    # Product browsing/listing
│   │       └── Hardware.tsx  # Upgrade shop
│   ├── systems/
│   │   ├── gameTick.ts       # Main game loop logic
│   │   ├── agentSystem.ts    # Agent task processing
│   │   ├── eventSystem.ts    # Random event generation
│   │   └── productSystem.ts  # Product sourcing/selling
│   ├── data/
│   │   ├── agentNames.ts     # Name pools per tier
│   │   ├── products.ts       # Product templates
│   │   ├── events.ts         # Event pool with messages
│   │   └── messages.ts       # Log message templates
│   └── types.ts              # TypeScript interfaces
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## One Last Thing

This game should make you laugh while you're building it. If a feature isn't fun or funny, skip it and add more log messages instead. The log is the soul of this game. Everything else is just scaffolding for jokes.

Now let's build this thing. 🚀
