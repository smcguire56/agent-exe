import type { EventLevel } from "../types";

export interface EventTemplate {
  id: string;
  level: EventLevel;
  icon: string;
  message: string;
  effect?: { money?: number; suspicion?: number };
  /** If set, at least one agent with this name must be hired for the event to fire */
  requiresAgent?: string;
}

export const RANDOM_EVENTS: EventTemplate[] = [
  {
    id: "review_candle",
    level: "info",
    icon: "📦",
    message:
      "A customer left a 1-star review: 'This candle smells like my uncle's regret. 10/10 would not recommend.'",
  },
  {
    id: "totally_legit",
    level: "info",
    icon: "📧",
    message:
      "New email from 'Totally Legit Suppliers Inc.' — Subject: 'DEAL OF A LIFETIME (not a scam)'",
  },
  {
    id: "the_bryan",
    level: "warning",
    icon: "⚠️",
    message:
      "Bryan has changed his display name to 'The Bryan'. No one approved this.",
    requiresAgent: "Bryan",
  },
  {
    id: "cursed_package",
    level: "warning",
    icon: "🔥",
    message:
      "A package was returned labeled 'CURSED.' Customer provided no further explanation.",
  },
  {
    id: "viral_tiktok",
    level: "good",
    icon: "📈",
    message:
      "A TikTok mocking your store went viral. Ironically, sales are up. A tip jar appeared on your desk.",
    effect: { money: 75 },
  },
  {
    id: "found_twenty",
    level: "good",
    icon: "💵",
    message:
      "Found $20 in the couch. Pam claims she put it there 'for emergencies.' There are no emergencies.",
    effect: { money: 20 },
  },
  {
    id: "reddit_thread",
    level: "warning",
    icon: "👁️",
    message:
      "A new thread on r/scams mentions your store by name. Top comment: 'I think I know this guy IRL.'",
  },
  {
    id: "neighbor_knocks",
    level: "info",
    icon: "🚪",
    message:
      "Your neighbor knocked to ask 'what the humming is.' You said 'raccoons.' They did not look convinced.",
  },
  {
    id: "bryan_nap",
    level: "info",
    icon: "😴",
    message:
      "Bryan is napping inside a cardboard box. He filed it as 'field research.'",
    requiresAgent: "Bryan",
  },
  {
    id: "pam_crypto",
    level: "warning",
    icon: "🪙",
    message:
      "Pam invested the petty cash into a coin called $SHREK. You cannot find any mention of it online.",
    effect: { money: -15 },
    requiresAgent: "Pam",
  },
  {
    id: "mystery_box",
    level: "good",
    icon: "🎁",
    message:
      "A mystery box arrived on the doorstep. Inside: forty identical rubber ducks. You list them immediately.",
    effect: { money: 40 },
  },
  {
    id: "fan_mail",
    level: "good",
    icon: "💌",
    message:
      "You received fan mail. The fan is a twelve-year-old who thinks you're 'a cool dropshipping dad.'",
  },
  {
    id: "totally_legit_2",
    level: "info",
    icon: "📧",
    message:
      "'Totally Legit Suppliers Inc.' has followed up. Subject now reads: 'pls respond (still not a scam)'",
  },
  {
    id: "pam_karaoke",
    level: "info",
    icon: "🎤",
    message:
      "Pam is doing karaoke at her desk. She has not been assigned a task in nine minutes.",
    requiresAgent: "Pam",
  },
  {
    id: "bsod_fake",
    level: "system",
    icon: "💀",
    message:
      "SHELLOS flashed a blue screen reading 'JUST KIDDING ❤'. No one is laughing.",
  },
  {
    id: "health_inspector",
    level: "warning",
    icon: "🧑‍⚖️",
    message:
      "A man in a polo shirt walked past your door twice. He was writing things down.",
  },
  {
    id: "review_5star",
    level: "good",
    icon: "⭐",
    message:
      "A 5-star review just rolled in: 'arrived in 3 weeks, wrong color, perfect.' Customer seemed genuine.",
    effect: { money: 30 },
  },
  {
    id: "landlord_text",
    level: "warning",
    icon: "📱",
    message:
      "Your landlord texted: 'hey are u running a warehouse in there.' You have not replied.",
  },
  {
    id: "ram_dream",
    level: "info",
    icon: "💭",
    message:
      "One of the RAM sticks is definitely dreaming. You can hear it.",
  },
  {
    id: "bryan_motivation",
    level: "info",
    icon: "📖",
    message:
      "Bryan is reading a motivational book titled 'Pivot: A Verb, A Lifestyle, A Lawsuit Risk.'",
    requiresAgent: "Bryan",
  },
  {
    id: "customer_photo",
    level: "warning",
    icon: "📸",
    message:
      "A customer posted an unboxing video. Your return address is clearly visible in frame.",
  },
];

export const HIGH_SUSPICION_WARNINGS: EventTemplate[] = [
  {
    id: "suspicion_subpoena",
    level: "danger",
    icon: "🚨",
    message:
      "An envelope slides under the door. It just says 'WE KNOW.' Pam thinks it's a prank. Pam is wrong.",
  },
  {
    id: "suspicion_helicopter",
    level: "danger",
    icon: "🚁",
    message:
      "There is a helicopter. You do not know whose helicopter. You suspect it knows whose.",
  },
  {
    id: "suspicion_investigation",
    level: "danger",
    icon: "🔍",
    message:
      "Someone on a forum is building a spreadsheet of your listings. They have a tab labeled 'patterns.'",
  },
  {
    id: "suspicion_van",
    level: "danger",
    icon: "🚐",
    message:
      "An unmarked van has been parked across the street for four hours. Bryan waved at it. It waved back.",
  },
  {
    id: "suspicion_bryan_panic",
    level: "danger",
    icon: "😰",
    message:
      "Bryan just asked if he's 'legally allowed to cry at work.' You don't know how to answer.",
  },
  {
    id: "suspicion_news",
    level: "danger",
    icon: "📺",
    message:
      "Local news ran a segment on 'sketchy online storefronts.' Your logo was blurred but not enough.",
  },
  {
    id: "suspicion_shadow",
    level: "danger",
    icon: "👤",
    message:
      "There is a man standing across the street. He has been standing there. He is not moving.",
  },
];

export const GAME_OVER_MESSAGES: string[] = [
  "The feds kicked the door in. Bryan offered them LaCroix. Pam tried to sell them a knockoff watch. The raid was, by all accounts, extremely awkward.",
  "Suspicion hit 100. The apartment is now a crime scene podcast. Pam is already being interviewed for it.",
  "A subreddit crowdfunded a lawyer. The lawyer crowdfunded a documentary. You are the documentary.",
  "Three men in windbreakers that say 'NOT FBI' have arrived. They have questions about 'the candles.'",
  "Bryan has turned state's witness in exchange for immunity and one (1) bean bag chair. You can't even be mad.",
  "Your apartment was declared a 'hazard of vibes' by the city. Everything is being boxed up. Pam is boxing herself up too.",
  "The internet has figured it out. All of it. Someone made a TVTropes page. It is six pages long and growing.",
];

export const SYSTEM_QUIPS: string[] = [
  "SHELLOS: Update available. Installing... just kidding. We don't do that here.",
  "SYSTEM: CPU fan spinning up. Probably fine. Definitely fine.",
  "SYSTEM: Storage at 80%. Your apartment is starting to look like a conspiracy theorist's office.",
  "⭐ Someone is asking questions about your business...",
];

/** Escalation messages fired when suspicion crosses a new star threshold */
export const SUSPICION_ESCALATION_MESSAGES: Record<number, string> = {
  1: "SYSTEM: Minor attention detected. A Reddit thread. Probably nothing.",
  2: "SYSTEM: A consumer watchdog blog just posted about a store matching your description.",
  3: "SYSTEM: Official inquiry received. ShellMail has the details. Stay calm.",
  4: "SYSTEM: Active monitoring detected on your network. They're watching.",
  5: "SYSTEM: ██████ INCOMING ██████ — You had a good run.",
};
