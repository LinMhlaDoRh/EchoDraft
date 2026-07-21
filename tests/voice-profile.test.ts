import {
  callGeminiForVoiceProfile,
  extractJsonFromText,
  MAX_CHARS,
} from "../lib/gemini";

const samples = [
  "Hey friends I’ve been thinking about how we all pretend to have it together online. The truth? Most of us are winging it. And that’s okay.",
  "Three things I learned this week: 1) sleep is non-negotiable, 2) your audience can smell authenticity, and 3) done is better than perfect.",
  "Stop writing like you’re pitching a VC. Write like you’re explaining it to the person next to you at a coffee shop. That’s the post that actually connects.",
];

/** Mirrors the validation logic in app/api/build-voice-profile/route.ts */
function validateSamples(raw: unknown): { ok: true; samples: string[] } | { ok: false; status: number; error: string } {
  const samples = Array.isArray(raw)
    ? raw.filter((s: unknown) => typeof s === "string" && s.trim().length > 0)
    : [];

  if (samples.length < 3) {
    return { ok: false, status: 400, error: "Please provide at least 3 writing samples." };
  }
  if (samples.length > 5) {
    return { ok: false, status: 400, error: "Please provide at most 5 writing samples." };
  }
  const tooLong = samples.findIndex((s: string) => s.length > MAX_CHARS);
  if (tooLong !== -1) {
    return {
      ok: false,
      status: 400,
      error: `Sample ${tooLong + 1} exceeds the ${MAX_CHARS}-character limit. Please shorten it and try again.`,
    };
  }
  return { ok: true, samples };
}

async function run() {
  console.log("Running voice profile tests...\n");

  // Test 1: mock profile without API key
  console.log("Test 1: callGeminiForVoiceProfile with no API key returns mock profile");
  const profile = await callGeminiForVoiceProfile(samples, undefined);
  assert(typeof profile.tone === "string" && profile.tone.length > 0, "tone should be a non-empty string");
  assert(typeof profile.vocabulary === "string" && profile.vocabulary.length > 0, "vocabulary should be a non-empty string");
  assert(typeof profile.sentence_rhythm === "string" && profile.sentence_rhythm.length > 0, "sentence_rhythm should be a non-empty string");
  assert(Array.isArray(profile.dos) && profile.dos.length > 0, "dos should be a non-empty array");
  assert(Array.isArray(profile.donts) && profile.donts.length > 0, "donts should be a non-empty array");
  console.log("  ✓ passed\n");

  // Test 2: JSON extraction helper
  console.log("Test 2: extractJsonFromText handles markdown wrapping");
  const wrapped = `Here is the profile:\n\n\`\`\`json\n{"tone":"friendly","vocabulary":"simple","sentence_rhythm":"short","dos":["be honest"],"donts":["be generic"]}\n\`\`\``;
  const extracted = extractJsonFromText(wrapped) as Record<string, unknown>;
  assert(extracted.tone === "friendly", "extracted tone should be 'friendly'");
  console.log("  ✓ passed\n");

  // Test 3: validation rejects <3 samples
  console.log("Test 3: API route validation rejects <3 samples");
  const tooFew = validateSamples(["only one sample"]);
  assert(!tooFew.ok && tooFew.status === 400, "should reject fewer than 3 samples with 400");
  console.log("  ✓ passed\n");

  // Test 4: MAX_CHARS guard
  console.log(`Test 4: API route validation rejects samples longer than ${MAX_CHARS} chars`);
  const oversized = "x".repeat(MAX_CHARS + 1);
  const tooLong = validateSamples([samples[0], samples[1], oversized]);
  assert(!tooLong.ok && tooLong.status === 400, "should reject oversized sample with 400");
  assert(tooLong.ok === false && tooLong.error.includes(String(MAX_CHARS)), "error should mention MAX_CHARS");
  console.log("  ✓ passed\n");

  // Test 5: valid samples pass validation
  console.log("Test 5: valid samples pass validation");
  const ok = validateSamples(samples);
  assert(ok.ok === true && ok.samples.length === 3, "valid samples should pass");
  console.log("  ✓ passed\n");

  // Test 6: MAX_CHARS constant is exported and equals 2000
  console.log("Test 6: MAX_CHARS is 2000");
  assert(MAX_CHARS === 2000, "MAX_CHARS should be 2000");
  console.log("  ✓ passed\n");

  console.log("All voice profile tests passed.");
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error("Assertion failed:", message);
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
