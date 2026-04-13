# AGENT.EXE — DAY 2 BUILD PLAN

## Part 1: Deploy to GitHub Pages (30 mins)

Do this FIRST so you have a live link to share. Every feature you add today goes live with a push.

### Step 1: Create the GitHub repo

Open Claude Code and say:

```
Initialize a git repo in this project if there isn't one already. 
Create a .gitignore for a Vite React project (node_modules, dist, .env, etc) and any passwords or API keys that may exist.
Commit everything with the message "Day 1 complete — first playable"
```

### Step 2: Push to GitHub

Go to github.com → New Repository → name it `agent-exe` → DON'T add a README → Create

Then tell Claude Code:

```
Add the GitHub remote origin for my repo at: 
https://github.com/YOUR_USERNAME/agent-exe.git
Push the main branch to origin.
```

### Step 3: Configure Vite for GitHub Pages

Tell Claude Code:

```
Configure this Vite project for GitHub Pages deployment:
1. In vite.config.ts, set base to '/agent-exe/' (the repo name)
2. Create a GitHub Actions workflow file at .github/workflows/deploy.yml 
   that builds the Vite project and deploys to GitHub Pages on every push to main.
   Use the standard GitHub Pages actions (actions/configure-pages, 
   actions/upload-pages-artifact, actions/deploy-pages).
3. Commit and push everything.
```

### Step 4: Enable GitHub Pages

1. Go to your repo on GitHub → Settings → Pages
2. Under "Source" select **GitHub Actions**
3. Wait 2-3 minutes for the first deploy
4. Your game is live at: `https://YOUR_USERNAME.github.io/agent-exe/`

### Step 5: Verify

Open the URL. Play your game. Send the link to a friend. You're a game developer now.

From this point on, every time you push to main, the site auto-updates.

After each milestone today, tell Claude Code:
```
Commit with message "[whatever you just built]" and push to main.
```

---

## Part 2: Day 2 Features

Now the fun part. You've got the core loop — today we add DEPTH and JUICE.

### Priority order. Work through these in sequence. Stop whenever you want — each one stands alone.

---

### Milestone 8: App Window System (45 mins)

Right now everything is panels. Let's make it feel like a real OS.

Say to Claude Code:

```
Add a window system to ShellOS. When I click an app on the taskbar, 
it opens as a draggable window overlaying the center area. 
Each window has:
- A title bar with the app name and a close [X] button
- A slightly different background from the desktop
- A subtle drop shadow
- Z-index stacking (clicking a window brings it to front)

Don't make them resizable — just draggable and closable.
The windows should feel like a janky OS from 2005.

Migrate AgentHQ, Market, and Hardware into window-based apps.
The center event log should always be visible behind the windows.
```

---

### Milestone 9: Agent Hire Screen (30 mins)

```
Create an Agent Hire screen inside the AgentHQ window. Show a list of 
available agents to hire. Each listing shows:
- Name (random from the Tier 1 pool)
- Random 2 personality traits from this list: 
  Perfectionist, Lazy, Paranoid, Sycophant, Creative, Competitive, Loyal, Kleptomaniac
- Speed and Accuracy stats (randomized within tier range)
- Hire cost
- A one-line bio that's funny based on their traits

Example bios:
- "Bryan (Perfectionist, Loyal): Will triple-check everything. Will also cry if you yell at him."
- "Todd (Lazy, Creative): Does the minimum. But that minimum is surprisingly inventive."
- "Pam (Paranoid, Competitive): Thinks everyone is out to get her. Outperforms them anyway."
- "Geoff (Sycophant, Kleptomaniac): Agrees with everything you say. Also, check your inventory."

Refresh the available agents every 10 in-game days.
Agents can only be hired if you have a free CPU slot.
```

---

### Milestone 10: Product Inspection & Quality (30 mins)

```
Add a product inspection system. When an agent sources a product, 
its quality is 'unknown' by default. In the Market window, 
each inventory item shows:
- Product name
- Quality: "???" if uninspected
- A button row: [Quick Inspect $5] [Deep Inspect $20] [Sell Blind]

Quick Inspect: reveals quality as Bad/OK/Good (takes 1 tick, costs $5)
Deep Inspect: reveals exact sell price range AND the hidden trait (takes 3 ticks, costs $20)
Sell Blind: list immediately — could be worth a lot, could trigger a customer complaint

Hidden traits from the prompt file should appear in the event log when a 
customer receives an uninspected bad item. Like:
"📦 Customer reports: 'This phone case arrived warm for no reason. I'm scared.'"

Good quality items sell for 1.5x-2x the base price.
Bad quality items have a 40% chance of complaint (+heat).
```

---

### Milestone 11: Agent Personality Effects (30 mins)

```
Make agent personality traits actually affect gameplay:

- Perfectionist: +15% accuracy, -20% speed
- Lazy: -30% speed on tasks over 3 ticks, but +10% speed on short tasks
- Paranoid: 10% chance per tick to flag a product as "suspicious" (adds log message, delays task)
- Sycophant: copies the behavior settings of whatever agent was hired before them
- Creative: product descriptions in the log are more elaborate and funny, +10% sell price
- Competitive: +20% speed if another agent completed a task in the last 5 ticks
- Loyal: doesn't leave if you reduce wages, slowly gains +1% accuracy per 10 days
- Kleptomaniac: 3% chance per sale that the product "disappears" (funny log message, no revenue)

Show trait effects in the agent detail view in AgentHQ.
When a trait triggers, the log message should reference it.
Like: "[Geoff] sold a USB cable. Wait... where's the USB cable? Geoff?"
Or: "[Pam] has flagged 'Scented Candle' as suspicious. Her reasoning: 'It's TOO scented.'"
```

---

### Milestone 12: ShellMail — Email App (45 mins)

```
Add a new app called ShellMail. It's a fake email client on the taskbar.
It should look like a basic email inbox with:
- Sender name
- Subject line  
- Preview text
- Unread indicator (bold)
- Click to open full email

Generate 1-2 emails per in-game day from these categories:

CUSTOMER COMPLAINTS (tied to actual sold products):
- "Subject: Re: Order #[number] — What Did You Send Me"
- "Subject: This Is Not What I Ordered (But It Might Be Better?)"
- "Subject: URGENT — Your Product Is Making Noises"

SUPPLIER OFFERS (new product opportunities):
- "Subject: EXCLUSIVE: Premium Phone Cases (Fell Off A Truck)"
- "Subject: Bulk Deal — 500 Motivational Posters, Slight Water Damage"
- From: "definitely-not-a-scam@suppliers.biz" Subject: "FREE INVENTORY NO CATCH"

SPAM (just for flavor):
- "Subject: You've Won A Boat!" (reference to KEVIN's future purchase)
- "Subject: Enlarge Your... Business Portfolio"
- "Subject: Your ShellOS License Expires In 0 Days" 

AGENT EMAILS (agents emailing you internally):
- From: Bryan — "Subject: Quick Question (Sorry)" 
  Body: "Hi, sorry to bother you, sorry. Is it okay if I take 15 minutes to reorganize the inventory? Sorry. Also sorry for saying sorry. - Bryan"
- From: Zara — "Subject: Opportunity" 
  Body: "Found a bulk deal. Don't ask where. Yes or no?"

Add a notification badge on the ShellMail taskbar icon showing unread count.
Some emails should have actionable buttons (Accept Deal / Decline, etc).
```

---

### Milestone 13: Sound & Juice (30 mins)

```
Add sound effects and visual polish:

SOUNDS (use the Web Audio API to generate simple synth sounds, no audio files needed):
- Soft "ding" on sale completed
- Low "buzz" on error  
- Typing/clicking sounds when agents complete tasks
- Alert chime on high heat warning
- Cash register "ka-ching" on big sales
- Startup sound when the game loads (short, retro)

Add a mute button in the top bar.

VISUAL JUICE:
- Event log entries slide in from the right with a subtle animation
- Money flashes green briefly when it increases
- Heat meter pulses red when above 50%
- Agent status dots pulse when working (like a breathing animation)
- Subtle CRT scanline overlay on the entire desktop (very faint, CSS only)
- Screen very slightly shakes on system warnings
- When an agent errors, their panel briefly flashes red
```

---

### Milestone 14: Save System (20 mins)

```
Add a save/load system using localStorage.

- Auto-save every 30 in-game days
- Manual save button in a "System" menu on the taskbar (presented as "Backup to Cloud")
- On game load, check for existing save and show:
  "SHELLOS: Previous session detected. Resume operation? [Continue] [New Game]"
- Save all game state: money, agents, inventory, heat, day, hardware levels, emails

Add funny save/load messages:
- "Backing up to the cloud... (it's actually just your browser)"
- "Session restored. Your agents missed you. (Bryan definitely cried.)"
- "Save corrupted. Just kidding. Everything's fine. Probably."
```

---

### Milestone 15: Tier 2 Agent & Grey Products (45 mins)

```
This is the big one. Add the next tier of gameplay.

TIER 2 AGENTS (unlock when player reaches $5,000 total earned):
- Show a notification: "SHELLOS: New agent class detected. 
  Competency level: concerning. Access granted."
- Tier 2 names: Zara, Marcus, The Algorithm, profit_bot_9000, Slick, Vendetta
- Higher stats: speed 5-8, accuracy 0.8-0.9
- Cost: $500-$2000 to hire
- NEW BEHAVIOR: 15% chance per task to "take initiative" — 
  does something you didn't ask for. Usually profitable. Sometimes not.
- Their log messages are cockier and more competent sounding.

Example messages:
- "[Zara] sourced products. Got a better deal than you would have. You're welcome."
- "[Marcus] noticed you listed that lamp too cheap. Relisted at 2x. Don't worry about it."
- "[The Algorithm] has optimized your inventory layout. It won't explain how."
- "[profit_bot_9000] TASK COMPLETE. PROFIT MARGIN: ACCEPTABLE. EMOTIONS: N/A."

GREY PRODUCTS (unlock alongside Tier 2 agents):
- "Inspired" Designer Sunglasses ($15-50 profit, medium risk)
- Mystery Supplement: "GRINDMAX Pro" ($20-60 profit, medium risk)
- Dropship Special: "Artisan Hand-Crafted" AliExpress Item ($25-80 profit, medium risk)
- Refurbished Tech: "Like New*" Headphones ($30-100 profit, higher risk)

Grey products generate 2x heat on complaints.
They need a Tier 2+ agent to source them.
Add them to the Market window with a subtle yellow/amber tint.
```

---

## End of Day 2 Target

By the end of today you should have:
- ✅ Game deployed and live on GitHub Pages
- ✅ Draggable windows that feel like a real OS
- ✅ Agent hiring with personalities that matter
- ✅ Product inspection decisions
- ✅ An email system full of comedy
- ✅ Sound effects and visual polish
- ✅ Save/load so progress isn't lost  
- ✅ Tier 2 agents and grey products (if you get here)

That's a REAL game. Something you could post on r/webgames and get feedback on.

---

## Deploy Reminder

After finishing each milestone:
```
Commit with message "Milestone [X]: [what you built]" and push to main
```

Your live site updates automatically in ~2 minutes.

---

## Day 3 Preview (for when you're lying in bed thinking about the game)

- Tier 3 agents (KEVIN enters the chat)
- DarkTerminal app
- Inspection events and consequences
- Event chains (The Rubber Duck Incident)
- Multiple endings
- Desktop clutter system
- Overclock mode with visual effects
- The apartment upgrade path

You're building something good. Keep going. 🎮
