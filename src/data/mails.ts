import type { MailCategory } from "../types";
import { randomFrom } from "../systems/gameTick";

export interface MailTemplate {
  from: string;
  subject: string;
  body: string;
  category: MailCategory;
}

const SALE_MAILS: MailTemplate[] = [
  {
    from: "ShellOS Payments",
    subject: "Payment received!",
    body: "A customer has paid for their order. The money is real. Probably. We'll let you know if it bounces.",
    category: "sales",
  },
  {
    from: "Marketplace Bot",
    subject: "Another one sold",
    body: "Item shipped. Customer seems happy. This won't last.",
    category: "sales",
  },
  {
    from: "ShellOS Analytics",
    subject: "Sales update",
    body: "Your conversion rate is technically above zero. Congratulations.",
    category: "sales",
  },
];

const COMPLAINT_MAILS: MailTemplate[] = [
  {
    from: "Angry Customer",
    subject: "RE: RE: RE: My Order???",
    body: "I ordered one (1) item and received zero (0) items that match the description. The box smelled like betrayal. I want a refund or I'm calling someone. I don't know who. But someone.",
    category: "complaint",
  },
  {
    from: "Disappointed Buyer",
    subject: "This is not what I ordered",
    body: "The listing said 'gently used.' This has been AGGRESSIVELY used. By what, I cannot say.",
    category: "complaint",
  },
  {
    from: "Karen T.",
    subject: "I WILL be speaking to your manager",
    body: "I don't know who runs this operation but I have QUESTIONS. The item arrived in a bag inside a bag inside a slightly larger bag. None of them were the right bag.",
    category: "complaint",
  },
  {
    from: "Concerned Citizen",
    subject: "Is this legal?",
    body: "Genuine question. I showed my purchase to a lawyer friend and they made a face I've never seen before. Please advise.",
    category: "complaint",
  },
];

const AGENT_MAILS: MailTemplate[] = [
  {
    from: "Bryan",
    subject: "Quick question",
    body: "Hey boss. Quick question. Actually, several questions. I wrote them down but then I lost the paper. Can we meet? Actually, can we not meet? I'll figure it out. Maybe.",
    category: "agent",
  },
  {
    from: "Pam",
    subject: "Efficiency report",
    body: "I've optimized my workflow by 200%. The other agents could learn a thing or two. Attached: a graph I made. There is no attachment feature. Just imagine the graph.",
    category: "agent",
  },
  {
    from: "HR Department",
    subject: "Workplace incident report",
    body: "We are writing to inform you of a minor workplace incident. An agent was found reorganizing the inventory 'for vibes.' No products were harmed. Emotionally, we are unsure.",
    category: "agent",
  },
];

const SPAM_MAILS: MailTemplate[] = [
  {
    from: "Prince of Walmartia",
    subject: "URGENT BUSINESS OPPORTUNITY",
    body: "Dear esteemed seller, I am a prince from a country that definitely exists. I have $47 million in unclaimed dropship revenue. All I need is your bank details and your mother's maiden name. This is 100% legitimate.",
    category: "spam",
  },
  {
    from: "TotallyNotAScam LLC",
    subject: "You've been selected!",
    body: "Congratulations! You've been randomly selected to receive 10,000 units of 'mystery product.' Shipping is free. Returns are not. Terms and conditions are written in a font size visible only to ants.",
    category: "spam",
  },
  {
    from: "Crypto Bro",
    subject: "bro you NEED to see this",
    body: "bro i just launched a new coin called $SHELF. it's like bitcoin but for shelving units. we're up 4000% this week. (we launched this week.) not financial advice but also yes it is. get in NOW.",
    category: "spam",
  },
  {
    from: "Definitely Real Reviews",
    subject: "Boost your ratings FAST",
    body: "We provide 5-star reviews from REAL people (and some very advanced parrots). 100 reviews for $50. All reviews will say 'great product, changed my life.' The parrots say 'BAWK' but we edit that out.",
    category: "spam",
  },
  {
    from: "WarehouseGhost69",
    subject: "i live in your warehouse",
    body: "hi. i've been living in your warehouse for three weeks. it's nice. the scented candles are a lovely touch. please don't check section B-7. unrelated: do you have wifi?",
    category: "spam",
  },
];

const SYSTEM_MAILS: MailTemplate[] = [
  {
    from: "ShellOS",
    subject: "System notice",
    body: "This is an automated message. Your system is running within acceptable parameters. 'Acceptable' is doing a lot of heavy lifting in that sentence.",
    category: "system",
  },
  {
    from: "ShellOS Compliance",
    subject: "Regulatory reminder",
    body: "Friendly reminder: we are operating in a legal grey area. The area is getting greyer. Please ensure all product descriptions are 'technically not lies.'",
    category: "system",
  },
];

const ALL_POOLS = {
  sales: SALE_MAILS,
  complaint: COMPLAINT_MAILS,
  agent: AGENT_MAILS,
  spam: SPAM_MAILS,
  system: SYSTEM_MAILS,
};

export function randomMail(category: MailCategory): MailTemplate {
  return randomFrom(ALL_POOLS[category]);
}

/** Pick a random mail category with weighted probabilities. */
export function randomMailCategory(): MailCategory {
  const roll = Math.random();
  if (roll < 0.25) return "spam";
  if (roll < 0.45) return "system";
  if (roll < 0.60) return "agent";
  if (roll < 0.80) return "sales";
  return "complaint";
}

/** Generate a contextual mail for a specific game event. */
export function saleMailTemplate(productName: string, price: number): MailTemplate {
  return {
    from: "ShellOS Payments",
    subject: `Sale: "${productName}" — $${price}`,
    body: `Your listing "${productName}" has sold for $${price}. The money has been deposited into your account. Spend it wisely. (You won't.)`,
    category: "sales",
  };
}

export function complaintMailTemplate(productName: string): MailTemplate {
  const tmpl = randomFrom(COMPLAINT_MAILS);
  return {
    ...tmpl,
    subject: `RE: "${productName}" — ${tmpl.subject}`,
  };
}
