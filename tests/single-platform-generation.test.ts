import type { VoiceProfile } from "../lib/gemini";
import {
  buildAllPlatformsPrompt,
  generateAllPlatformPosts,
  isVoiceProfile,
  MAX_PILLAR_CHARS,
  sanitizeVoiceProfile,
  validateGenerateInput,
} from "../lib/generation";

const voiceProfile: VoiceProfile = {
  tone: "conversational, direct, and warm",
  vocabulary: "plain English, avoids jargon, uses concrete examples",
  sentence_rhythm: "short punchy sentences with occasional longer reflections",
  dos: ["lead with the point", "use natural questions"],
  donts: ["avoid corporate jargon", "avoid generic hype"],
};

const pillarText =
  "Creators are told to post everywhere, but copying one message across platforms rarely works. Each platform rewards a different hook, pace, and structure. AI can help with adaptation, but only if it preserves the creator's recognizable voice rather than flattening it into generic content.";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    console.error("Assertion failed:", message);
    process.exit(1);
  }
}

async function run() {
  console.log("Running generation tests...\n");

  console.log("Test 1: valid voice profile is recognized");
  assert(isVoiceProfile(voiceProfile), "voice profile should be valid");
  assert(!isVoiceProfile({ tone: "warm" }), "partial voice profile should be invalid");
  console.log("  ✓ passed\n");

  console.log("Test 2: empty pillar content is rejected");
  const empty = validateGenerateInput({ pillarText: "   ", voiceProfile });
  assert(!empty.ok && empty.error.includes("required"), "empty pillar should be rejected");
  console.log("  ✓ passed\n");

  console.log("Test 3: missing voice profile is rejected");
  const missingProfile = validateGenerateInput({ pillarText });
  assert(
    !missingProfile.ok && missingProfile.error.toLowerCase().includes("voice profile"),
    "missing profile should be rejected"
  );
  console.log("  ✓ passed\n");

  console.log(`Test 4: pillar content longer than ${MAX_PILLAR_CHARS} chars is rejected`);
  const tooLong = validateGenerateInput({
    pillarText: "x".repeat(MAX_PILLAR_CHARS + 1),
    voiceProfile,
  });
  assert(
    !tooLong.ok && tooLong.error.includes(String(MAX_PILLAR_CHARS)),
    "oversized pillar should be rejected"
  );
  console.log("  ✓ passed\n");

  console.log("Test 5: batch prompt includes platform rules and voice profile");
  const prompt = buildAllPlatformsPrompt({ pillarText, voiceProfile });
  assert(prompt.includes("linkedin:"), "prompt should include LinkedIn rules");
  assert(prompt.includes(voiceProfile.tone), "prompt should include voice profile");
  assert(prompt.includes(pillarText), "prompt should include pillar content");
  assert(prompt.includes("max 3 hashtags"), "prompt should cap hashtags");
  console.log("  ✓ passed\n");

  console.log("Test 6: no API key uses deterministic local mock");
  const result = await generateAllPlatformPosts({ pillarText, voiceProfile }, undefined);
  assert(result.mode === "mock", "missing key should select mock mode");
  assert(result.outputs.linkedin.length > 100, "mock LinkedIn output should be populated");
  assert(result.outputs.linkedin !== pillarText, "output should adapt rather than copy the source");
  assert(result.outputs.linkedin.includes("?"), "mock should include a CTA/question");
  console.log("  ✓ passed\n");

  console.log("Test 7: source contains no API key query-string usage");
  const source = await import("node:fs/promises").then((fs) =>
    fs.readFile(new URL("../lib/generation.ts", import.meta.url), "utf8")
  );
  assert(!source.includes("?key="), "API key must not be placed in query string");
  assert(source.includes('"x-goog-api-key"'), "API key should be sent in header");
  console.log("  ✓ passed\n");

  console.log("Test 8: oversized voice profile fields are rejected / sanitized");
  const huge = {
    ...voiceProfile,
    tone: "x".repeat(2000),
  };
  assert(!isVoiceProfile(huge), "oversized tone should fail isVoiceProfile");
  const sanitizedHuge = sanitizeVoiceProfile(huge);
  assert(sanitizedHuge !== null, "sanitize should clamp oversized fields into a valid profile");
  assert(sanitizedHuge.tone.length <= 500, "sanitize should clamp tone to max field length");
  assert(isVoiceProfile(sanitizedHuge), "clamped profile should pass isVoiceProfile");
  assert(sanitizeVoiceProfile({ tone: "" }) === null, "empty tone should sanitize to null");
  const clamped = sanitizeVoiceProfile({
    tone: "  warm and direct  ",
    vocabulary: "plain",
    sentence_rhythm: "short",
    dos: ["a", "b"],
    donts: ["c"],
  });
  assert(clamped !== null && clamped.tone === "warm and direct", "sanitize should trim fields");
  console.log("  ✓ passed\n");

  console.log("All generation tests passed without making external API calls.");
}

run().catch((error) => {
  console.error("Test failed:", error);
  process.exit(1);
});
