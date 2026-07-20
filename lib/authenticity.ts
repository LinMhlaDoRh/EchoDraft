export type AuthenticityResult = {
  score: number;
  label: "Strong" | "Review" | "Generic";
  flags: string[];
};

/** Deduplicated generic-AI phrase list used for local scoring. */
const GENERIC_PHRASES = [
  "in today's fast-paced world",
  "unlock the power of",
  "game-changer",
  "game changer",
  "delve into",
  "revolutionize",
  "ever-evolving landscape",
  "it is important to note",
  "in conclusion",
  "leverage synergies",
  "transformative journey",
  "at the end of the day",
  "take it to the next level",
  "cutting-edge",
  "seamlessly integrate",
] as const;

function uniqueFlags(flags: string[]): string[] {
  return [...new Set(flags)];
}

export function analyzeAuthenticity(content: string): AuthenticityResult {
  const lower = content.toLowerCase();
  const flags: string[] = [];

  for (const phrase of GENERIC_PHRASES) {
    if (lower.includes(phrase)) flags.push(`Generic phrase: “${phrase}”`);
  }

  const words = content.trim().split(/\s+/).filter(Boolean);
  const sentences = content
    .split(/[.!?]+/)
    .map((item) => item.trim())
    .filter(Boolean);
  const avgSentenceWords = sentences.length ? words.length / sentences.length : words.length;

  if (avgSentenceWords > 28) flags.push("Several sentences may feel overly long");
  if ((content.match(/!/g) || []).length > 6) {
    flags.push("Heavy exclamation-mark use may feel automated");
  }
  if (words.length > 40 && !/[?]/.test(content)) {
    flags.push("Consider adding a natural question or direct reader cue");
  }

  // Soft signal: very high comma density can indicate run-on AI prose.
  const commaCount = (content.match(/,/g) || []).length;
  if (words.length > 60 && commaCount / words.length > 0.12) {
    flags.push("Dense comma usage may reduce natural rhythm");
  }

  const unique = uniqueFlags(flags);
  // Allow scores down to 10 so heavily generic copy is not misleadingly “Strong”.
  const score = Math.max(10, Math.min(100, 100 - unique.length * 14));
  const label: AuthenticityResult["label"] =
    score >= 86 ? "Strong" : score >= 65 ? "Review" : "Generic";

  return { score, label, flags: unique };
}
