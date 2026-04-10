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

/** Pick a random mail category (only ambient types — sales/complaints are contextual). */
export function randomMailCategory(): MailCategory {
  const roll = Math.random();
  if (roll < 0.45) return "spam";
  if (roll < 0.75) return "system";
  return "agent";
}

/** Generate a contextual sale mail based on product quality and inspection status. */
export function saleMailTemplate(
  productName: string,
  price: number,
  quality: string,
  inspected: boolean,
  tier: number,
): MailTemplate {
  // Quality-specific buyer reactions
  const qualityReactions: Record<string, string[]> = {
    excellent: [
      `Customer is THRILLED with "${productName}." Left a 5-star review: "This changed my life. I'm not being dramatic."`,
      `Buyer says "${productName}" exceeded expectations. They want to know if you have more. You don't. Lie anyway.`,
      `"${productName}" sold for $${price}. Customer described it as "the highlight of my week." Their week must be rough.`,
    ],
    good: [
      `"${productName}" sold for $${price}. Customer says it's "exactly what I needed." Inspection paid off.`,
      `Buyer happy with "${productName}." 4 stars. One star deducted because "the packaging was boring."`,
      `Solid sale: "${productName}" at $${price}. Customer wrote "would buy again." They won't. But still.`,
    ],
    ok: [
      `"${productName}" sold for $${price}. Customer says it "works, I guess." Ringing endorsement.`,
      `Sale complete: "${productName}" at $${price}. Buyer described it as "adequate." We'll take it.`,
      `"${productName}" moved for $${price}. Customer review: "It's a thing. I have it now." Three stars.`,
    ],
    bad: [
      `"${productName}" sold for $${price}. Customer hasn't complained yet. Give it time.`,
      `Sold "${productName}" for $${price}. Buyer's initial reaction: "...huh." Not great. Not actionable.`,
      `"${productName}" at $${price}. Customer asked if the return policy is "flexible." It is not.`,
    ],
    unknown: [
      `Blind sale: "${productName}" for $${price}. No idea what quality they got. That's the fun part. For us.`,
      `"${productName}" sold uninspected for $${price}. Rolling the dice on customer satisfaction. Bold strategy.`,
      `Sold "${productName}" blind at $${price}. If they complain, we'll pretend we never got the email.`,
    ],
  };

  const pool = qualityReactions[quality] ?? qualityReactions.unknown;
  const body = randomFrom(pool);

  const greyTag = tier >= 2 ? " [GREY MARKET]" : "";
  const inspectTag = inspected ? ` [${quality.toUpperCase()}]` : " [UNINSPECTED]";

  return {
    from: inspected ? "ShellOS Payments" : "ShellOS Payments (Blind Sale)",
    subject: `Sale: "${productName}"${inspectTag}${greyTag} — $${price}`,
    body,
    category: "sales",
  };
}

/** Generate a contextual complaint mail based on product quality and inspection status. */
export function complaintMailTemplate(
  productName: string,
  quality: string,
  inspected: boolean,
  tier: number,
): MailTemplate {
  // Blind sale complaints are worse and funnier
  if (!inspected) {
    const blindComplaints = [
      {
        from: "Furious Customer",
        subject: `RE: "${productName}" — You didn't even CHECK this?`,
        body: `I can tell you didn't inspect this before shipping. How can I tell? Because NO ONE who looked at this would have thought "yes, this is fit for sale." I want a refund and a personal apology. In that order.`,
      },
      {
        from: "Betrayed Buyer",
        subject: `"${productName}" — BLIND SALE REGRET`,
        body: `You sold me "${productName}" without even inspecting it first. I know because the quality is "${quality}" and there's NO WAY you knew that and still charged me. My trust is broken. So is the product.`,
      },
      {
        from: "Anonymous Reviewer",
        subject: `1 STAR: "${productName}" was clearly uninspected`,
        body: `Review: "Seller clearly did not look at this item before listing it. It arrived in a condition I can only describe as 'ambitious.' Would not recommend. Would actively un-recommend. -1 stars if possible."`,
      },
    ];
    return { ...randomFrom(blindComplaints), category: "complaint" };
  }

  // Inspected but bad quality — you knew what you were doing
  if (quality === "bad") {
    const badComplaints = [
      {
        from: "Suspicious Customer",
        subject: `RE: "${productName}" — You KNEW this was bad`,
        body: `I noticed this item was inspected and listed anyway despite being BAD quality. Bold. I respect the hustle. I still want a refund though. And maybe an explanation.`,
      },
      {
        from: "Disappointed Regular",
        subject: `"${productName}" — Bad quality, sold anyway`,
        body: `Look, I get that margins are tight. But selling a product you INSPECTED and KNEW was bad? That's not "entrepreneurship," that's just a scam with extra steps. Reported.`,
      },
    ];
    return { ...randomFrom(badComplaints), category: "complaint" };
  }

  // Grey market complaints are spicier
  if (tier >= 2) {
    const greyComplaints = [
      {
        from: "Alarmed Customer",
        subject: `RE: "${productName}" — Is this... legal?`,
        body: `This "${productName}" feels distinctly unofficial. The label says "Guochi" instead of "Gucci" and the serial number is just the word "serial" written in Sharpie. I have questions. Many questions.`,
      },
      {
        from: "Concerned Buyer",
        subject: `"${productName}" — Grey market alert`,
        body: `My friend who works in customs took one look at this and started laughing. Then stopped laughing. Then made a phone call. I think we're both in trouble now.`,
      },
    ];
    return { ...randomFrom(greyComplaints), category: "complaint" };
  }

  // Generic complaint for inspected ok/good items (rare but possible)
  const tmpl = randomFrom(COMPLAINT_MAILS);
  return {
    ...tmpl,
    subject: `RE: "${productName}" — ${tmpl.subject}`,
  };
}
