import type { VoiceProfile } from "../lib/gemini";
import {
  clampTweet,
  DEFAULT_GEMINI_MODEL,
  formatAllOutputs,
  formatXThread,
  generateAllPlatformPosts,
  MAX_TWEET_CHARS,
  normalizePlatformOutputs,
} from "../lib/generation";

const voiceProfile: VoiceProfile = {
  tone: "conversational, direct, warm",
  vocabulary: "plain English",
  sentence_rhythm: "short punchy sentences",
  dos: ["lead with point"],
  donts: ["avoid jargon"],
};
const pillarText =
  "Creators are told to post everywhere, but copying one message across platforms rarely works. Each platform rewards a different hook, pace, and structure. Voice should stay recognizable.";

function assert(value: unknown, message: string): asserts value {
  if (!value) throw new Error(message);
}

async function run() {
  console.log("Running multi-platform generation tests...");
  const mock = await generateAllPlatformPosts({ pillarText, voiceProfile }, undefined);
  const o = mock.outputs;
  assert(mock.mode === "mock", "missing key must use mock");
  assert([o.linkedin, o.instagram, o.youtube, o.newsletter].every((x) => x.length > 40), "all outputs populated");
  assert(o.xThread.length >= 3 && o.xThread.length <= 5, "X has 3-5 posts");
  assert(o.xThread.every((x) => x.length <= MAX_TWEET_CHARS), "X posts <=280");
  assert(formatXThread(o.xThread).startsWith(`1/${o.xThread.length}`), "X is numbered");
  assert((o.instagram.trim().split("\n").at(-1)?.match(/#/g) || []).length >= 5, "Instagram hashtags");
  assert(o.youtube.includes("TIMESTAMPS") && o.youtube.includes("LINKS"), "YouTube sections");
  assert(o.newsletter.startsWith("Subject:"), "newsletter subject");
  assert(formatAllOutputs(o).includes("===== EMAIL NEWSLETTER ====="), "export contains labels");
  const clamped = normalizePlatformOutputs({ ...o, xThread: ["x".repeat(400), "two", "three"] });
  assert(clamped.xThread[0].length === 280, "normalizer clamps tweets");

  // L-07: clampTweet boundary conditions
  const exact = "a".repeat(280);
  assert(clampTweet(exact) === exact, "exactly 280 chars must not be truncated");
  assert(clampTweet(exact + "z").length === 280, "281 chars must clamp to 280");
  assert(clampTweet(exact + "z").endsWith("…"), "overflow should end with ellipsis");

  const originalFetch = globalThis.fetch;
  let calls = 0;
  let url = "";
  let init: RequestInit | undefined;
  globalThis.fetch = async (input, options) => {
    calls++;
    url = String(input);
    init = options;
    return new Response(
      JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify(o) }] } }] }),
      { status: 200 }
    );
  };
  try {
    const result = await generateAllPlatformPosts(
      { pillarText, voiceProfile },
      "fake-key",
      DEFAULT_GEMINI_MODEL
    );
    assert(result.mode === "ai", "key path returns ai mode");
    assert(calls === 1, "exactly one batched provider call");
    assert(!url.includes("fake-key"), "key absent from URL");
    assert(new Headers(init?.headers).get("x-goog-api-key") === "fake-key", "key in header");
    const body = JSON.parse(String(init?.body));
    assert(body.generationConfig.responseMimeType === "application/json", "structured JSON requested");
  } finally {
    globalThis.fetch = originalFetch;
  }
  console.log("All multi-platform generation tests passed without external API calls.");
}
run().catch((e) => {
  console.error(e);
  process.exit(1);
});
