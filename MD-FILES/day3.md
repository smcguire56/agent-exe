# AGENT.EXE — DAY 3 ADDITIONS: Systems Refactor

## These prompts should be run BEFORE the Day 3 build plan milestones.
## They fix core systems so everything else builds on solid foundations.

---

## Refactor 1: Split Heat and Temperature + Rename Heat to Suspicion (30 mins)

Say to Claude Code:

```
Big refactor: right now "heat" and "temperature" are confused. 
They need to be TWO separate systems. Also rename "heat" to "suspicion" 
because it's not about warmth — it's about attracting attention, 
like GTA's wanted stars.

**SUSPICION (was "heat") — ⭐ in the top bar**
This is your "wanted level." How much attention your shady operation 
is attracting from the outside world.

Display it as STARS like GTA, not a percentage:
- 0-20%: ☆☆☆☆☆ (0 stars) — Ghost. Nobody knows you exist.
- 20-40%: ★☆☆☆☆ (1 star) — "Someone on Reddit mentioned your store name."
- 40-55%: ★★☆☆☆ (2 stars) — "A consumer blog is investigating your reviews."  
- 55-70%: ★★★☆☆ (3 stars) — "You've received an official inquiry. That's not great."
- 70-85%: ★★★★☆ (4 stars) — "Authorities are actively monitoring your operation."
- 85-100%: ★★★★★ (5 stars) — "They're coming. Do something. NOW."

Suspicion sources (same as old heat sources):
- Customer complaints, selling grey products, agent errors, high refund rate

Suspicion reduction:
- Selling legal products cleanly (-small amount)
- Good reviews (-small amount)
- Time passing (-0.3 per tick, same as current decay)
- Laying low (not selling grey products for a while)

At 5 stars: game over as before.

Rename ALL references in the codebase:
- heat → suspicion (in state, in systems, in events, in messages)
- "Heat" in UI → "Suspicion" or the star display
- Heat meter → Star meter
- All event messages that reference "heat" → reference "suspicion" or "attention"

Update the top bar to show:
💰 $709  ⚡ CPU 35%  🌡️ 42°C  ⭐ ★★☆☆☆

Log messages should reference the new theme:
- OLD: "WARNING: Heat level increasing"
- NEW: "⭐ Someone is asking questions about your business..."
- OLD: "Heat critical!"  
- NEW: "⭐⭐⭐⭐⭐ INCOMING INVESTIGATION. THIS IS NOT A DRILL."

Each star gained should fire a specific escalation message:
- 1 star: "SYSTEM: Minor attention detected. A Reddit thread. Probably nothing."
- 2 stars: "SYSTEM: A consumer watchdog blog just posted about a store matching your description."
- 3 stars: "SYSTEM: Official inquiry received. ShellMail has the details. Stay calm."
- 4 stars: "SYSTEM: Active monitoring detected on your network. They're watching."
- 5 stars: "SYSTEM: ██████ INCOMING ██████ — You had a good run."
```

---

## Refactor 2: Temperature as a Real System (30 mins)

```
Now make TEMPERATURE a real, functional system. Temperature is about 
your HARDWARE overheating — completely separate from suspicion.

Temperature is shown as °C in the top bar: 🌡️ 42°C

**How temperature works:**
- Base idle temp: 30°C
- Each active agent adds heat: +5°C per working agent per tick
- Each idle agent adds: +1°C per idle agent (still running on the system)
- Overclocking (future feature): doubles temperature gain

**Cooling reduces temperature:**
- Lv1 cooling: dissipates 3°C per tick (barely keeps up with 1 agent)
- Lv2 cooling: dissipates 6°C per tick 
- Lv3 cooling: dissipates 10°C per tick
- Lv4 cooling: dissipates 15°C per tick
- Lv5 cooling: dissipates 22°C per tick

**Temperature thresholds and effects:**

0-50°C — NORMAL
- Everything works fine
- Display: green temperature text

50-70°C — WARM  
- Display: yellow temperature text
- Log: "SYSTEM: CPU fan spinning up. Bryan comments that it's 'a bit toasty in here.'"
- 5% chance per tick of minor UI stutter (brief CSS flicker on the event log)

70-85°C — HOT
- Display: orange temperature text, slight pulse animation
- Agents work 15% slower (thermal throttling)
- 10% chance per tick of random agent task failing
- Log: "⚠️ THERMAL WARNING: Performance degraded. Consider upgrading cooling."
- Log: "[Bryan] 'Is it just me or is the room actually melting?'"
- Desktop starts showing very subtle visual heat distortion (CSS filter)

85-95°C — CRITICAL
- Display: red temperature text, faster pulse
- Agents work 30% slower
- 20% chance per tick of agent task failing  
- Random application "crashes" — a window briefly closes and reopens
- Log: "🔥 CRITICAL TEMPERATURE: System unstable!"
- Log: "[Bryan] 'I can smell the motherboard. That's not good, right?'"
- Screen develops visible glitch artifacts (random pixel displacement CSS)

95-100°C — MELTDOWN
- Display: flashing red
- FULL SCREEN FREEZE for 3-5 seconds — game appears to crash
- Then "ShellOS Recovery Mode" message appears
- All agent tasks cancelled, agents reset to idle
- One random hardware component "damaged" — temporarily drops one level 
  for the next 50 ticks (then auto-repairs)
- Log: "💀 SYSTEM CRASH — Emergency shutdown triggered"
- Log: "SHELLOS: Rebooting... please don't do that again."
- Log: "[Bryan] '...are we dead? Is this the afterlife? Oh wait we're back.'"
- Temperature resets to 40°C after crash
- 10-tick cooldown before agents can be assigned again

This creates a REAL tension:
- More agents = more money but more temperature
- Without cooling upgrades, you physically can't run many agents
- Overheating doesn't end the game (that's suspicion's job) 
  but it disrupts your operation and costs you time/money
- The screen freeze at 95°C will GENUINELY surprise players the first time

**Temperature in the Command Ship view (for later):**
- Normal: cool blue/cyan lighting
- Warm: lights shift to warm white
- Hot: amber/orange tint on the bridge
- Critical: red emergency lighting
- Meltdown: screen goes black, then recovery sequence
```

---

## Refactor 3: Agent Mood & Purpose System (30 mins)

```
Add a MOOD system to agents. Agents find purpose in working and making 
money. If they sit idle too long, they get depressed. This creates 
pressure to keep agents busy (which conflicts with temperature management).

**Mood levels:**
Each agent has a mood value: 0-100

- 80-100: THRIVING 😄
  - +10% speed, +5% accuracy
  - Log messages are enthusiastic and funny
  - Ship view: agent has a subtle glow, bouncy movement
  
- 60-79: CONTENT 🙂
  - No bonuses or penalties (default starting mood)
  - Normal behavior
  
- 40-59: BORED 😐
  - No stat changes yet, but log messages get passive-aggressive
  - "[Bryan] completed task. Whatever. It's fine."
  - "[Bryan] is idle. He's been idle for a while. He's fine. Everything's fine."
  - Ship view: agent moves slower, slumps at desk
  
- 20-39: SAD 😢
  - -10% speed, -5% accuracy
  - Log messages get existential
  - "[Bryan] 'What's the point of sourcing products if we're all just... code?'"
  - "[Bryan] listed a product. The description is just the word 'why' repeated."
  - "[Bryan] stared at the wall for 15 minutes. Nobody noticed."
  - Ship view: agent sits on the floor sometimes, moves very slowly, 
    grey color overlay on their sprite
    
- 0-19: DEPRESSED 😞
  - -25% speed, -15% accuracy
  - Agent occasionally REFUSES tasks (20% chance)
  - "[Bryan] was assigned a task. Bryan has declined. Bryan 'needs a minute.'"
  - "[Bryan] 'I used to think I was good at this. I used to think a lot of things.'"
  - "[Bryan] has written a resignation letter. He's not sending it. Yet."
  - Ship view: agent barely moves, sits in corner of room, 
    rain cloud emoji occasionally appears above them

**Mood changes:**

Mood INCREASES from:
- Completing a task successfully: +5 mood
- Making a sale: +3 mood  
- Making a BIG sale (>$100 profit): +8 mood
- Being assigned a task when idle: +2 mood (they feel needed!)
- Compliment events (random): +10 mood
  - "You told Bryan he's doing a good job. Bryan will remember this forever."

Mood DECREASES from:
- Being idle: -2 mood per tick when idle (this is the main driver!)
- Task failure: -5 mood
- Customer complaint about THEIR product: -8 mood
- Getting an error when they tried hard: -3 mood
- Being idle while other agents are working: -3 mood per tick 
  (they feel left out!)

**Mood affects log message tone:**

The same event gets different messages based on mood:

SALE COMPLETED:
- Thriving: "[Bryan] SOLD IT! $45 profit! Bryan is on FIRE today! (metaphorically)"
- Content: "[Bryan] sold a phone case for $45. Solid work."
- Bored: "[Bryan] sold a phone case. $45. Yep."
- Sad: "[Bryan] sold a phone case for $45. He feels nothing."
- Depressed: "[Bryan] sold a phone case. $45. 'Money can't buy purpose.'"

TASK ASSIGNED:
- Thriving: "[Bryan] 'ON IT! Let's GO!' — Bryan is sourcing products"
- Content: "[Bryan] sourcing products. No complaints."
- Bored: "[Bryan] 'Fine, I guess I'll source products.' — Bryan is working"
- Sad: "[Bryan] slowly opens his laptop. Begins sourcing. Sighs."
- Depressed: "[Bryan] stares at the task for 30 seconds. Eventually starts working. 'At least it's something.'"

**Mood display:**

In the Agent Panel (left sidebar), show mood emoji next to each agent:
Bryan 😄 ● Working

In AgentHQ detail view, show:
Mood: ████████░░ 82% — THRIVING 😄

In the Command Ship view (when built), mood affects:
- Sprite color saturation (happy = vibrant, sad = desaturated)
- Movement speed and animation
- Idle behaviors (happy agents dance more, sad agents mope)

**Key design tension this creates:**

The player now has THREE competing pressures:
1. MORE agents working = more money = agents stay happy
2. MORE agents working = higher temperature = system crashes
3. COOLING upgrades let you run more agents safely
4. But IDLE agents get sad and become less effective

This means the player can't just hire max agents and leave some idle 
as "backups." Every agent needs a job or they spiral. 
But too many working agents overheats the system.

The sweet spot shifts as you upgrade cooling.
This is the core strategic tension of the mid-game.
```

---

## Refactor 4: Top Bar Update (15 mins)

```
Update the top bar to clearly show all systems:

💰 $709  ⚡ CPU 3/4  🌡️ 42°C  ⭐ ★★☆☆☆  🕐 Day 5 14:30

Where:
- 💰 = money (flash green on increase, red on decrease)
- ⚡ CPU = active agents / max agents (not a percentage)
- 🌡️ = temperature in °C (color changes by threshold: green/yellow/orange/red)
- ⭐ = suspicion stars (filled/empty stars, pulse animation when increasing)
- 🕐 = day and time

Remove the old heat percentage. Temperature and suspicion replace it.

The top bar should have a subtle gradient background that shifts:
- Normal: dark grey
- High temp: slight warm tint
- High suspicion: slight red tint  
- Both high: oh no
```

---

## Order of Operations for Today

1. **Run Refactors 1-4 first** (these prompts, ~1.5 hours)
2. **Then run Day 3 milestones 16-22** from the Day 3 Build Plan
   - But NOTE: in Milestone 16, skip the Cooling implementation since 
     Refactor 2 already handles it. Just make sure the upgrade costs 
     and levels from Milestone 16 align with the dissipation rates 
     in Refactor 2.
   - And in Milestone 22 (Ship Reacts to Game State), use the new 
     temperature thresholds for visual changes instead of heat.

3. **Commit and push after each refactor:**
```
Commit with message "Refactor: [description]" and push to main
```

---

## What This All Adds Up To

After today, the player is juggling:

| System | Threat | Solution |
|--------|--------|----------|
| Suspicion ⭐ | Selling shady stuff, complaints | Sell legal, lay low |
| Temperature 🌡️ | Too many agents, no cooling | Upgrade cooling, manage workload |
| Agent Mood 😄😢 | Idle agents spiral into depression | Keep everyone busy (but that raises temp!) |
| Money 💰 | Everything costs money | Sell more (but that raises suspicion!) |

Every solution creates a new problem. That's the game.

Bryan isn't just a worker anymore — he's a little dude on a spaceship 
who gets SAD when you don't give him anything to do, and who literally 
catches fire when you give him TOO MUCH to do. 

Players are going to get emotionally attached to Bryan. 
That's how you know you've made a game.

Good luck, Captain. 🚀