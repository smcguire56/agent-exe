// ── Mood constants ───────────────────────────────────────────────

export const MOOD_START = 70;          // Starting mood for new hires (CONTENT)
export const MOOD_IDLE_DECAY = 1;      // Lost per tick while idle
export const MOOD_IDLE_LONELY = 1;     // Extra lost if others are working
export const MOOD_TASK_ASSIGN = 3;     // Gained when assigned a task
export const MOOD_TASK_SUCCESS = 8;    // Gained on successful task completion
export const MOOD_TASK_FAIL = 4;       // Lost on task failure
export const MOOD_SALE_BOOST = 5;      // Gained when any sale happens
export const MOOD_BIG_SALE_BOOST = 12; // Gained on a big sale (>$100)
export const MOOD_BIG_SALE_THRESHOLD = 100;
export const MOOD_DEPRESSED_REFUSE_CHANCE = 0.20; // Legacy — kept for compatibility

// Tiered refusal chance: agents with low mood push back on tasks more often.
export function getRefuseChance(mood: number): number {
  if (mood >= 40) return 0;
  if (mood >= 25) return 0.20;
  if (mood >= 10) return 0.45;
  return 0.70;
}
export const MOOD_IDLE_CHATTER_CHANCE = 0.04; // Chance per tick of idle mood chatter

// ── Mood levels ──────────────────────────────────────────────────

export type MoodLevel = "thriving" | "content" | "bored" | "sad" | "depressed";

export function getMoodLevel(mood: number): MoodLevel {
  if (mood >= 80) return "thriving";
  if (mood >= 60) return "content";
  if (mood >= 40) return "bored";
  if (mood >= 20) return "sad";
  return "depressed";
}

export function getMoodEmoji(mood: number): string {
  switch (getMoodLevel(mood)) {
    case "thriving":  return "😄";
    case "content":   return "🙂";
    case "bored":     return "😐";
    case "sad":       return "😢";
    case "depressed": return "😞";
  }
}

export function getMoodLabel(mood: number): string {
  switch (getMoodLevel(mood)) {
    case "thriving":  return "THRIVING";
    case "content":   return "CONTENT";
    case "bored":     return "BORED";
    case "sad":       return "SAD";
    case "depressed": return "DEPRESSED";
  }
}

export function clampMood(mood: number): number {
  return Math.min(100, Math.max(0, Math.round(mood)));
}

// ── Mood stat multipliers ────────────────────────────────────────

export function getMoodSpeedMult(mood: number): number {
  switch (getMoodLevel(mood)) {
    case "thriving":  return 1.10;
    case "content":   return 1.00;
    case "bored":     return 1.00;
    case "sad":       return 0.90;
    case "depressed": return 0.75;
  }
}

export function getMoodAccuracyMult(mood: number): number {
  switch (getMoodLevel(mood)) {
    case "thriving":  return 1.05;
    case "content":   return 1.00;
    case "bored":     return 1.00;
    case "sad":       return 0.95;
    case "depressed": return 0.85;
  }
}

// ── Task assignment messages by mood ────────────────────────────

const ASSIGN_MESSAGES: Record<MoodLevel, string[]> = {
  thriving: [
    "'ON IT! Let's GO!' — is sourcing products",
    "'YES! Finally! I've been waiting for this!' — sprints to work",
    "'ABSOLUTELY. Consider it done.' — already started",
  ],
  content: [
    "is sourcing products. No complaints.",
    "acknowledged the task. Is working.",
    "got to work. Professionally.",
  ],
  bored: [
    "'Fine, I guess I'll source products.' — is working",
    "'Sure. Whatever.' — begins task with visible disinterest",
    "'I mean... okay.' — technically working",
  ],
  sad: [
    "slowly opens their laptop. Begins sourcing. Sighs.",
    "'Okay.' — stares at the task for a moment. Starts working.",
    "begins the task. Doesn't look up.",
  ],
  depressed: [
    "stares at the task for 30 seconds. Eventually starts. 'At least it's something.'",
    "'I'll do it.' — long pause — 'I'll do it.'",
    "reluctantly begins working. 'Fine.'",
  ],
};

export function getAssignMessage(_name: string, mood: number): string {
  const level = getMoodLevel(mood);
  const pool = ASSIGN_MESSAGES[level];
  return pool[Math.floor(Math.random() * pool.length)];
}

// ── Task completion messages by mood ─────────────────────────────

const COMPLETE_MESSAGES: Record<MoodLevel, string[]> = {
  thriving: [
    "NAILED IT! Check the inventory!",
    "Another one! The velocity is IMMACULATE.",
    "Done and done. Someone tell the board.",
  ],
  content: [
    "Task complete. Solid work.",
    "Done. Moving on.",
    "Finished. As expected.",
  ],
  bored: [
    "Done. Whatever.",
    "Completed the task. As assigned. Wow.",
    "...done.",
  ],
  sad: [
    "Done. They feel nothing.",
    "Task complete. The void remains.",
    "Finished. Didn't help.",
  ],
  depressed: [
    "Done. 'Money can't buy purpose.'",
    "Task complete. 'What even is completion.'",
    "'I finished it.' — long silence.",
  ],
};

export function getCompleteMessage(_name: string, mood: number): string {
  const level = getMoodLevel(mood);
  const pool = COMPLETE_MESSAGES[level];
  return pool[Math.floor(Math.random() * pool.length)];
}

// ── Task refusal message (depressed only) ────────────────────────

const REFUSE_MESSAGES = [
  "was assigned a task. Has declined. 'Needs a minute.'",
  "looked at the task. Looked away. 'Not right now.'",
  "is not in a state to work right now. The task will wait.",
  "'I know I should. I just... not yet.' — remains idle",
];

export function getRefuseMessage(_name: string): string {
  return REFUSE_MESSAGES[Math.floor(Math.random() * REFUSE_MESSAGES.length)];
}

// ── Idle mood chatter ────────────────────────────────────────────

const IDLE_CHATTER: Partial<Record<MoodLevel, string[]>> = {
  bored: [
    "is idle. Has been idle for a while. Is fine. Everything's fine.",
    "reorganized their desktop icons. Again.",
    "drafted and deleted the same message three times.",
    "'Is there anything to do?' — there is. They haven't asked.",
  ],
  sad: [
    "'What's the point of sourcing products if we're all just... code?'",
    "stared at the wall for 15 minutes. Nobody noticed.",
    "looked up the definition of 'purpose.' Closed the tab.",
    "is idle. Their status light is on. The rest is uncertain.",
  ],
  depressed: [
    "'I used to think I was good at this. I used to think a lot of things.'",
    "has written a resignation letter. Not sending it. Yet.",
    "opened a task. Closed it. Opened it again. Closed it.",
    "is present. Technically.",
  ],
};

export function getIdleChatterMessage(_name: string, mood: number): string | null {
  const level = getMoodLevel(mood);
  const pool = IDLE_CHATTER[level];
  if (!pool) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}
