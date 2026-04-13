# TONIGHT'S BUILD PLAN — Agent.exe First Playable

## Before You Start (10 mins)

1. Install Node.js if you don't have it: https://nodejs.org
2. Open your terminal
3. DON'T install Unity. This is a web game.

## Getting Started with Claude Code

Open your terminal and say:

```
claude
```

Then paste this as your first message:

---

Read the file AGENT_EXE_CLAUDE_CODE_PROMPT.md — this is our game design bible. 
Set up a new React + TypeScript + Vite project called "agent-exe" with Tailwind CSS and Zustand. 
Create the file structure described in the prompt file. 
Then build Milestone 1: the ShellOS desktop layout with all panels visible and placeholder content. 
Make it look like a retro operating system — dark theme, monospace fonts in the log area, chunky feel. 
Use emoji as placeholder icons. Start the dev server when done so I can see it.

---

## The Session Flow

You'll work through 7 milestones. After each one, PLAY IT in your browser. 
If it makes you smile → move to the next milestone.
If something feels off → tell Claude Code to fix it before moving on.

### After Milestone 1 (desktop looks good), say:

"Build Milestone 2: Add the game tick system. Every 2 seconds, advance the clock by 15 mins. 
Show the time and day in the top bar. Start the player with $500. 
Make the event log show a message every few ticks like 'SYSTEM: Awaiting instructions...' 
or 'SHELLOS: Welcome back. Your empire awaits. (It's very small.)'"

### After Milestone 2 (clock is ticking), say:

"Build Milestone 3: Add Bryan, a Tier 1 agent. He appears in the left panel. 
I can click him to assign a 'Source Products' task. 
After 3-5 ticks he finishes and a product appears in inventory. 
80% chance of success with a funny log message. 
20% chance of error with a funnier log message. 
Use the humor examples from the prompt file."

### After Milestone 3 (Bryan is working), say:

limit reached, so far: 
Update Product type with ticksToSell field

Add SALE_MESSAGES + COMPLAINT_MESSAGES message pools

Build productSystem.ts with processProduct logic

Add listProduct, hireAgent, upgradeCpu store actions; wire products into tick

Build out Market window with Inventory + Listings sections

Build out Hardware window with real CPU upgrade

Wire HIRE AGENT button in AgentPanel with capacity gating

Add Milestone 4 + 5 e2e tests

Run all tests and verify
You've hit your limit · resets Apr 9, 3am (Europe/Dublin)

"Build Milestone 4: Add selling. I can click a product to 'List for Sale'. 
After 2-4 ticks it sells. Money increases by the profit margin. 
Log shows sale messages. 5% chance a customer complains — 
funny complaint appears in log and heat increases by 5."

### After Milestone 4 (money loop works), say:

"Build Milestone 5: Add the hardware panel on the right. 
Show CPU, RAM, Cooling as progress bars. 
Add an 'Upgrade CPU' button that costs $1000. 
When upgraded, I can hire a second agent (random name from the Tier 1 pool). 
Make hiring cost $100."

### After Milestone 5 (2 agents possible), say:

"Build Milestone 6: Add the random event system. 
Every tick there's a 5% chance of a random event. 
Create a pool of 20 events — mix of funny system messages, 
customer reviews, weird emails, agent personality moments. 
Some should affect money (+/- small amounts), some affect heat. 
Make the log colorful — green for sales, yellow for warnings, 
red for errors, cyan for agent actions."

### After Milestone 6 (events are firing), say:

"Build Milestone 7: Make heat matter. Heat meter in the top bar fills up. 
At 50% heat: warning messages start appearing. 
At 80%: agents slow down, more errors. 
At 100%: game over screen — 'OPERATION SHUT DOWN' with a funny message 
and total money earned. Add a 'Try Again' button that resets the game. 
Heat slowly decreases by 1 every few ticks when you're not causing trouble."

## After All 7 Milestones

You have a playable game. It'll be rough but it should be FUN. 

From here you can keep going or save it for tomorrow:
- "Add an app window system — clicking taskbar buttons opens overlay panels"
- "Add a second monitor upgrade that widens the play area"  
- "Add Tier 2 agents with higher stats but they occasionally go rogue"
- "Add a save system using localStorage"
- "Make the desktop get cluttered with files as days pass"

## Tips for Smooth Vibe Coding

- **If Claude Code hits your rate limit:** Take a break. Play what you've built. Write down ideas for tomorrow.
- **If something breaks:** Say "The game crashes when [X]. Fix it." Claude Code is good at debugging.
- **If it's not funny enough:** Say "The log messages are too generic. Rewrite them to be more absurd and Rick-and-Morty. Here's the vibe: [paste an example you like]"
- **If the UI is ugly:** Say "Make this look more like a retro operating system. Darker, chunkier, more personality."
- **Save often:** Ask Claude Code to "commit this to git with message [whatever milestone you just finished]"

## You're Done When

You're watching Bryan fumble through selling phone cases, 
the log is making you laugh, money is going up, 
and you feel the itch to add "just one more thing."

That's a game. Ship it tomorrow on itch.io if you want. 

Good luck tonight. 🎮
