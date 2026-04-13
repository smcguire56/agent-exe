# AGENT.EXE — DAY 3 BUILD PLAN

## Today's Two Big Pillars
1. **Hardware upgrades that actually DO things** (no more TODOs)
2. **The Command Ship** — replace the apartment with a top-down Among Us style ship view

---

## Part 1: Hardware Upgrades (1-1.5 hours)

### Milestone 16: Make All Hardware Functional (45 mins)

Right now your upgrades are placeholders. Let's make them real.

Say to Claude Code:

```
Read the hardware upgrade system in the store. Currently CPU works 
(unlocks agent slots) but RAM, Cooling, and Storage are TODOs. 
Let's make them all functional:

**CPU** (already works — agent slots):
- Lv1: 2 slots ($0 — starting)  
- Lv2: 3 slots ($1,000)
- Lv3: 4 slots ($3,000)
- Lv4: 6 slots ($8,000)
- Lv5: 8 slots ($20,000) — flavor text: "Classified military surplus. Don't ask."

**RAM** (concurrent tasks per agent):
- Lv1: 1 task at a time per agent ($0 — starting)
- Lv2: agents work 25% faster on all tasks ($750)
- Lv3: agents work 50% faster ($2,000)
- Lv4: agents can multitask — run 2 tasks simultaneously ($6,000)
- Lv5: agents work 75% faster + multitask ($15,000) — flavor text: "Is this even RAM anymore? It's warm to the touch."

Implementation: RAM level applies a speed multiplier to task tick countdown.
At Lv4+, agents can have TWO currentTasks instead of one.

**Cooling** (reduces heat gain):
- Lv1: no reduction ($0 — starting). Fan noise comment in UI.
- Lv2: -20% heat from all sources ($500) — "The fan sounds slightly less like a dying animal."
- Lv3: -40% heat from all sources ($1,500) — "Liquid cooling installed. It gurgles sometimes."
- Lv4: -60% heat from all sources ($4,000) — "Cryo unit. The desk is frosting over."
- Lv5: -80% heat from all sources ($12,000) — "Suspicious cooling unit. Where did this come from? Why is it humming a tune?"

Implementation: multiply all heat gains by (1 - coolingReduction) before applying.

**Storage** (max inventory capacity):
- Lv1: 20 items ($0 — starting)
- Lv2: 50 items ($400) — "Added a shelf. Revolutionary."
- Lv3: 100 items ($1,200) — "Second shelf. Engineering at its finest."
- Lv4: 250 items ($3,500) — "Cargo bay extension. Things are getting serious."
- Lv5: 500 items ($10,000) — "The warehouse. You can hear echoes in here."

Implementation: if inventory >= max, agents can't source new products. 
Show "STORAGE FULL" warning in log. 
Show current/max in the stats panel like "📦 12/20".

For each upgrade, show:
- Current level and what it does
- Next level cost, what it unlocks, and the flavor text
- A progress bar or visual indicator
- Greyed out "MAX" when fully upgraded

Keep the "NOTE: the fan is making 'the sound.' Again." flavor — 
update it per cooling level.
```

### Milestone 17: Hardware Panel Polish (20 mins)

```
Polish the hardware/stats panel on the right side:

Show each component as a mini-card:
┌─ CPU ──────────────┐
│ Level 2/5          │
│ Agent Slots: 2/3   │
│ ████████░░ 60%     │
│ ⬆ Upgrade: $3,000  │
└────────────────────┘

Add a "System Status" section at the top that shows:
- Overall system health based on all component levels
- A funny system status message that changes:
  - All Lv1: "Running on hopes and prayers"
  - Mixed: "Held together with duct tape and optimism"  
  - All Lv3+: "Actually kind of impressive"
  - All Lv5: "This machine should not exist. Yet here we are."

When upgrading, play a brief "installing" moment in the event log:
- "SYSTEM: Installing CPU upgrade... [████████░░] 80%..."
- "SYSTEM: Installation complete. Your agents can feel the difference. Bryan is emotional about it."
- "SYSTEM: RAM upgrade installed. Everything feels faster. Suspiciously faster."
- "SYSTEM: Cooling upgrade installed. Temperature dropping. Bryan says it's 'nippy.'"
```

---

## Part 2: The Command Ship (2-2.5 hours)

This is the big feature. Replace "Apartment" with a top-down ship view where you can SEE your agents.

### Milestone 18: The Ship Layout — Static View (45 mins)

```
Replace the Apartment app with a new app called "Command Ship" (or "The Bridge").
When opened, it shows a top-down view of a spaceship/command center.

Use a canvas element OR styled divs (whichever is simpler to vibe code).
The ship should look like an Among Us style top-down layout:

For now, create ONE room — "The Bridge" (main operations room):

┌─────────────────────────────────────┐
│           THE BRIDGE                │
│                                     │
│   ┌──────┐          ┌──────┐       │
│   │ Desk │          │ Desk │       │
│   │  1   │          │  2   │       │
│   └──────┘          └──────┘       │
│                                     │
│        ┌──────────────┐            │
│        │   Server     │            │
│        │   Rack       │            │
│        └──────────────┘            │
│                                     │
│   ┌──────┐          ┌──────┐       │
│   │ Desk │          │ Desk │       │
│   └──────┘          └──────┘       │
│                                     │
└──────────────────────────────────────┘

The room should have:
- A dark floor with subtle grid lines (spaceship feel)
- Desks/workstations represented as simple rectangles
- A server rack in the center
- Walls with a slightly lighter border
- A color scheme: dark greys, cyan/teal accents, like a sci-fi command center
- The room label at the top

Each desk corresponds to an agent slot (tied to CPU level).
Empty desks show as dim/inactive. Occupied desks glow slightly.
```

### Milestone 19: Animated Agent Sprites (45 mins)

This is where the magic happens. Agents appear as little characters on the ship.

```
Add animated agent sprites to the Command Ship view. Each hired agent 
appears as a small character (think Among Us crewmate style — simple, 
round, colored).

Each agent gets a unique color:
- Bryan: Blue
- Todd: Green  
- Pam: Yellow
- Geoff: Red
- Desk Unit 4: Grey
- Tier 2 agents: Brighter/neon versions of these colors

The sprites are simple CSS/div-based characters (circle body, smaller circle head, 
or even simpler: a colored circle with eyes and a name label underneath).

AGENT STATES AND ANIMATIONS:

**Working (sourcing/listing/selling):**
- Agent sits at their desk
- Small bouncing animation (like typing)
- A tiny laptop/screen graphic on the desk glows
- Small floating text above them cycles: "sourcing...", "listing...", "selling..."
- Occasional emoji floats up: 📦 💰 📋

**Idle:**
- Agent wanders around the room slowly (random gentle movement within the bridge)
- Every 5-10 seconds, do a random idle animation:
  - Dancing (side to side wobble)
  - Sleeping (ZZZ text floats up, agent dims slightly)
  - Looking at phone (small rectangle appears)
  - Stretching (brief size pulse)
  - Sitting on the floor
  - Following another agent around

**Error state:**
- Agent turns red briefly
- ❌ or ⚠️ floats above them
- They visually "panic" — shake animation for 2 seconds
- Then return to desk looking dejected (slightly smaller/dimmer)

**Rogue (Tier 2+ initiative):**
- Agent leaves their desk
- Walks to the server rack
- A "?" or "..." floats above them
- Mischievous animation (slight glow change)

Keep the movement smooth but simple — CSS transitions, not complex animation.
Agents should smoothly walk (translate) between positions, not teleport.
Walking speed should be slow and cute, like Among Us lobby movement.
```

### Milestone 20: Agent Interaction in Ship View (30 mins)

```
Make the ship view interactive and informative:

**Click an agent** in the ship view to:
- Highlight them with a selection ring
- Show a small popup tooltip with:
  - Name and tier
  - Current task (or "Idle — [what they're doing]" like "Idle — Dancing" or "Idle — Napping")
  - Traits
  - Quick action buttons: [Assign Task] [View Details]

**Hover over a desk** to see:
- "Agent: Bryan" or "Empty — unlock more CPU slots"

**Ship ambient details:**
- Subtle blinking lights on the server rack
- A small "hull integrity" or "ship status" indicator that mirrors heat
  (high heat = warning lights on the ship walls)
- When CPU is overloaded, the server rack starts glowing red and pulsing
- Small particle effects: floating dust motes or very faint star movement 
  through a "window" at the top of the bridge

**Agent-to-agent interactions (visual only, for flavor):**
- When two idle agents are near each other, they occasionally "face" each other 
  (like they're chatting)
- Competitive agents visibly work faster at their desks (faster bounce animation)
- Lazy agents take longer idle breaks away from desk
- Paranoid agents occasionally look around (rotation animation)
```

### Milestone 21: Ship Status Dashboard (20 mins)

```
Add a small dashboard overlay inside the Command Ship view. 
It sits in the corner of the ship view, like a heads-up display:

┌─ BRIDGE STATUS ────────────┐
│ Crew: 2/3                  │
│ Active Tasks: 2            │
│ Ship Integrity: 88%        │
│ Storage Bay: 12/50 📦      │
│ ◉ Systems Nominal          │
└────────────────────────────┘

"Ship Integrity" = inverse of heat (100 - heat%).
When integrity drops below 50%, the status changes:
- "◉ Systems Nominal" → "⚠ Systems Degraded" (yellow)
- Below 25%: "🔴 CRITICAL — Hull Breach Imminent" (red, pulsing)

This reframes the heat system in the ship metaphor.
The ship dashboard updates in real-time with the game tick.
```

---

## Part 3: Connecting It All (30 mins)

### Milestone 22: Ship Reacts to Game State (30 mins)

```
Make the Command Ship view a living reflection of the game state:

**Hardware upgrades are visible on the ship:**
- CPU upgrade: more desks appear in the bridge
- RAM upgrade: a new blinking module appears on the server rack
- Cooling upgrade: visible cooling unit appears (fan at Lv2, 
  blue liquid pipes at Lv3, frost effect at Lv4, mysterious device at Lv5)
- Storage upgrade: cargo containers/shelves appear along the walls, 
  filling up proportionally to inventory usage

**Heat/integrity affects the ship visually:**
- 0-25% heat: normal lighting, calm
- 25-50%: occasional flicker of lights
- 50-75%: amber warning lights on walls, slight screen shake
- 75-90%: red lights, alarms, agents move more frantically
- 90-100%: full emergency — everything red, agents panicking, 
  "HULL BREACH" warning flashing

**When an agent completes a sale:**
- Brief green flash on their desk
- Small 💰 particle floats up from them

**When an agent errors:**
- Their workstation sparks briefly (orange particle)
- Nearby agents visually react (turn to look)

This makes the ship view the emotional core of the game — 
you're not just reading a log, you're watching your crew 
succeed and fail in real-time.
```

---

## Day 3 Summary & Deploy

After each milestone, remember:
```
Commit with message "Milestone [X]: [description]" and push to main
```

### End of Day 3 Target:
- ✅ All 4 hardware upgrades fully functional with 5 levels each
- ✅ Command Ship view with the Bridge room
- ✅ Animated agent sprites with state-based behavior
- ✅ Agents visibly working, idling, erroring, going rogue
- ✅ Interactive — click agents, see tooltips
- ✅ Ship reflects game state (hardware, heat, inventory)
- ✅ Visual feedback for events (sales, errors, warnings)

---

## Day 4 Preview: The Expansion

Now that you have the ship infrastructure, Day 4 can add:

**New Rooms (one per session):**
- **The Lab** — Research room. Agents here research new product categories and upgrades.
- **The Studio** — Content creation room. An agent here becomes a TikTok AI influencer, 
  generating passive income and heat. Visual: ring light, camera, agent doing poses.
- **The Academy** — Course creation room. An agent here builds and sells an e-commerce course. 
  Slow passive income that grows over time. Visual: whiteboard, desk with notes.
- **The Vault** — Storage room. Visual representation of your inventory. 
  Boxes stack up as you accumulate products.
- **The Captain's Quarters** — Unlock with Tier 3 agent. The commanding agent sits here 
  and manages the others. Auto-assigns idle agents. Can override your decisions.

**Room unlocks tied to progression:**
- The Bridge: free (starting room)
- The Vault: Storage Lv3 ($1,200)
- The Studio: $5,000 + Tier 2 agent required
- The Lab: $8,000 + all hardware Lv2
- The Academy: $15,000 + Tier 2 agent with "Creative" trait
- Captain's Quarters: $50,000 + hire a Tier 3 agent

**Commanding Agent (Tier 3 preview):**
- KEVIN sits in the Captain's Quarters
- Has a bigger sprite, maybe a hat or glow
- Visible giving "orders" to other agents (walks to them, speech bubble appears)
- Sometimes overrides your task assignments (you see it happen on the ship)
- Occasionally found in rooms they shouldn't be in

This is your endgame vision. Each room is a new gameplay system 
with its own visual life on the ship. The game becomes about 
building and staffing your vessel.

Good luck today, Captain. 🚀