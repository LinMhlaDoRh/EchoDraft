import type { VoiceProfile } from "../lib/gemini";
import { analyzeAuthenticity } from "../lib/authenticity";
import { buildAllPlatformsPrompt, DEFAULT_GEMINI_MODEL } from "../lib/generation";
import { buildRefinePrompt, refinePlatformOutput, validateRefineInput } from "../lib/refinement";
import { toSafeClientError } from "../lib/api-security";
import {
  buildContentSecurityPolicy,
  createSessionValue,
  verifySessionValue,
} from "../lib/session";
import { NextRequest } from "next/server";
import { authorizeApiRequest } from "../lib/api-security";

const voiceProfile: VoiceProfile = {
  tone: "direct, warm",
  vocabulary: "plain English",
  sentence_rhythm: "short punchy sentences",
  dos: ["lead with the point"],
  donts: ["avoid jargon"],
};
const pillarText = "One strong idea can travel when its structure changes for each platform.";

function assert(v: unknown, m: string): asserts v {
  if (!v) throw new Error(m);
}

async function run() {
  console.log("Running authenticity and refinement tests...");
  const strong = analyzeAuthenticity("Say the useful thing first. Would you use this tomorrow?");
  const generic = analyzeAuthenticity(
    "In today's fast-paced world, unlock the power of this game-changer. In conclusion, it will revolutionize your transformative journey!"
  );
  assert(strong.score > generic.score && generic.flags.length >= 3, "generic language should score lower");
  assert(generic.score < 35, "heavily generic content should score below the old 35 floor");

  const prompt = buildAllPlatformsPrompt({ pillarText, voiceProfile });
  assert(
    prompt.includes("VOICE MATCH PRIORITY") && prompt.includes("hard writing constraint"),
    "batch prompt should enforce voice lock"
  );

  const request = {
    platform: "linkedin" as const,
    tweak: "make it punchier",
    currentOutput: "Current post",
    pillarText,
    voiceProfile,
  };
  assert(validateRefineInput(request).ok, "valid refinement should pass");
  assert(!validateRefineInput({ ...request, tweak: "" }).ok, "empty tweak should fail");
  assert(buildRefinePrompt(request).includes("Never do: avoid jargon"), "refine prompt should include voice donts");

  const mock = await refinePlatformOutput(request, undefined);
  assert(
    mock.mode === "mock" && String(mock.output).includes("Mock tweak applied"),
    "no key should use mock refinement"
  );

  const originalFetch = globalThis.fetch;
  let calls = 0;
  let url = "";
  let init: RequestInit | undefined;
  globalThis.fetch = async (input, options) => {
    calls++;
    url = String(input);
    init = options;
    return new Response(
      JSON.stringify({ candidates: [{ content: { parts: [{ text: "Punchier revised post" }] } }] }),
      { status: 200 }
    );
  };
  try {
    const result = await refinePlatformOutput(request, "fake-key", DEFAULT_GEMINI_MODEL);
    assert(
      result.mode === "ai" && result.output === "Punchier revised post",
      "AI refinement should return revised output"
    );
    assert(calls === 1, "one card tweak should make one provider call");
    assert(!url.includes("fake-key"), "key must not be in URL");
    assert(new Headers(init?.headers).get("x-goog-api-key") === "fake-key", "key should remain in header");
  } finally {
    globalThis.fetch = originalFetch;
  }

  // H-02: raw upstream errors must be sanitized for clients
  const leaked = toSafeClientError(
    new Error('Gemini API error (500): {"error":{"message":"internal project xyz"}}')
  );
  assert(!leaked.includes("project xyz"), "safe error must not leak upstream body");
  assert(!leaked.includes("Gemini API error"), "safe error must not echo raw Gemini prefix");

  // N-03: nonce CSP must not include unsafe-inline/unsafe-eval on scripts
  const csp = buildContentSecurityPolicy("test-nonce-value");
  assert(csp.includes("nonce-test-nonce-value"), "CSP should embed nonce");
  assert(!/script-src[^;]*unsafe-inline/.test(csp), "script-src must not allow unsafe-inline");
  assert(!/script-src[^;]*unsafe-eval/.test(csp), "script-src must not allow unsafe-eval");
  assert(csp.includes("strict-dynamic"), "CSP should use strict-dynamic with nonce");

  // N-01 / N-02: session cookie auth + production token requirements
  const secret = "unit-test-session-secret-32chars!!";
  const session = await createSessionValue(secret);
  assert(await verifySessionValue(session, secret), "fresh session should verify");
  assert(!(await verifySessionValue(session, "wrong-secret")), "wrong secret must fail");
  assert(!(await verifySessionValue("not.a.session", secret)), "malformed session must fail");

  const env = process.env as Record<string, string | undefined>;
  const prevEnv = {
    NODE_ENV: env.NODE_ENV,
    TOKEN: env.ECHODRAFT_API_TOKEN,
    SESSION: env.ECHODRAFT_SESSION_SECRET,
  };

  try {
    env.NODE_ENV = "production";
    delete env.ECHODRAFT_API_TOKEN;
    delete env.ECHODRAFT_SESSION_SECRET;

    const misconfigured = await authorizeApiRequest(
      new NextRequest("http://localhost:3000/api/generate", { method: "POST" })
    );
    assert(!misconfigured.ok && misconfigured.status === 503, "prod without token must 503");

    env.ECHODRAFT_API_TOKEN = "prod-token-value";

    const spoofedOrigin = await authorizeApiRequest(
      new NextRequest("http://localhost:3000/api/generate", {
        method: "POST",
        headers: {
          origin: "http://localhost:3000",
          host: "localhost:3000",
        },
      })
    );
    assert(!spoofedOrigin.ok && spoofedOrigin.status === 401, "Origin alone must not authorize in prod");

    const withToken = await authorizeApiRequest(
      new NextRequest("http://localhost:3000/api/generate", {
        method: "POST",
        headers: { "x-echodraft-token": "prod-token-value" },
      })
    );
    assert(withToken.ok && withToken.via === "token", "valid API token must authorize");

    const badToken = await authorizeApiRequest(
      new NextRequest("http://localhost:3000/api/generate", {
        method: "POST",
        headers: { "x-echodraft-token": "wrong" },
      })
    );
    assert(!badToken.ok && badToken.status === 401, "invalid token must 401");

    const cookieSession = await createSessionValue("prod-token-value");
    const withCookie = await authorizeApiRequest(
      new NextRequest("http://localhost:3000/api/generate", {
        method: "POST",
        headers: { cookie: `echodraft_session=${cookieSession}` },
      })
    );
    assert(withCookie.ok && withCookie.via === "session", "signed session cookie must authorize browser");
  } finally {
    if (prevEnv.NODE_ENV === undefined) delete env.NODE_ENV;
    else env.NODE_ENV = prevEnv.NODE_ENV;
    if (prevEnv.TOKEN === undefined) delete env.ECHODRAFT_API_TOKEN;
    else env.ECHODRAFT_API_TOKEN = prevEnv.TOKEN;
    if (prevEnv.SESSION === undefined) delete env.ECHODRAFT_SESSION_SECRET;
    else env.ECHODRAFT_SESSION_SECRET = prevEnv.SESSION;
  }

  console.log("All authenticity and refinement tests passed without external API calls.");
}
run().catch((error) => {
  console.error(error);
  process.exit(1);
});
