export const PERSONALITY_TRAITS = [
  "Perfectionist",
  "Lazy",
  "Paranoid",
  "Sycophant",
  "Creative",
  "Competitive",
  "Loyal",
  "Kleptomaniac",
] as const;

export type PersonalityTrait = (typeof PERSONALITY_TRAITS)[number];

/** Map of trait → one-liner fragments used to build agent bios. */
const BIO_FRAGMENTS: Record<PersonalityTrait, string[]> = {
  Perfectionist: [
    "Will triple-check everything.",
    "Refuses to submit until it's 'perfect.' It never is.",
    "Re-alphabetized the warehouse. Twice.",
  ],
  Lazy: [
    "Does the bare minimum.",
    "Will find the shortcut. Always.",
    "Once napped inside a shipping box.",
  ],
  Paranoid: [
    "Thinks everyone is out to get them.",
    "Installed three locks on the supply closet.",
    "Checks reviews for government keywords.",
  ],
  Sycophant: [
    "Agrees with everything you say.",
    "Calls you 'boss' unprompted.",
    "Their last Yelp review was five stars for a dumpster.",
  ],
  Creative: [
    "Surprisingly inventive.",
    "Wrote product descriptions in haiku once.",
    "Improvises solutions nobody asked for.",
  ],
  Competitive: [
    "Outperforms everyone. Tells everyone.",
    "Keeps a personal leaderboard.",
    "Sprints to the breakroom fridge.",
  ],
  Loyal: [
    "Will never leave. Ever.",
    "Has a tattoo of the company logo. There is no logo.",
    "Cried when you said 'good job.'",
  ],
  Kleptomaniac: [
    "Check your inventory.",
    "Pockets are suspiciously bulgy.",
    "Once 'lost' an entire pallet. Found it in their car.",
  ],
};

const MOOD_POOL = [
  "ready to disappoint",
  "cautiously optimistic",
  "mildly suspicious",
  "aggressively chill",
  "legally distinct from happy",
  "pondering the void",
  "overclocked",
  "brewing coffee internally",
];

import { randomFrom } from "../systems/gameTick";

export function pickTraits(count: number): PersonalityTrait[] {
  const pool = [...PERSONALITY_TRAITS];
  const picked: PersonalityTrait[] = [];
  for (let i = 0; i < count && pool.length > 0; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(idx, 1)[0]);
  }
  return picked;
}

export function generateBio(name: string, traits: PersonalityTrait[]): string {
  const parts = traits.map((t) => randomFrom(BIO_FRAGMENTS[t]));
  return `${name} (${traits.join(", ")}): ${parts.join(" ")}`;
}

export function randomMood(): string {
  return randomFrom(MOOD_POOL);
}
