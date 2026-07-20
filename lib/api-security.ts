import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE_NAME,
  getApiToken,
  getSessionSecret,
  isProduction,
  verifySessionValue,
} from "@/lib/session";

export { SESSION_COOKIE_NAME, buildContentSecurityPolicy, createCspNonce, createSessionValue, getApiToken, getSessionSecret, isProduction, sessionCookieOptions, verifySessionValue } from "@/lib/session";

/** Max JSON body size accepted by API routes (bytes). */
export const MAX_BODY_BYTES = 256 * 1024; // 256 KB

function rateLimitMax(): number {
  const n = Number(process.env.ECHODRAFT_RATE_LIMIT_MAX || 20);
  return Number.isFinite(n) && n > 0 ? n : 20;
}

function rateLimitWindowMs(): number {
  const n = Number(process.env.ECHODRAFT_RATE_LIMIT_WINDOW_MS || 60_000);
  return Number.isFinite(n) && n > 0 ? n : 60_000;
}

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

function clientKey(request: NextRequest): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]?.trim() || "unknown";
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "local";
}

export function checkRateLimit(request: NextRequest): { ok: true } | { ok: false; retryAfterSec: number } {
  const key = clientKey(request);
  const now = Date.now();
  const windowMs = rateLimitWindowMs();
  const max = rateLimitMax();
  let bucket = buckets.get(key);
  if (!bucket || now >= bucket.resetAt) {
    bucket = { count: 0, resetAt: now + windowMs };
    buckets.set(key, bucket);
  }
  bucket.count += 1;
  if (bucket.count > max) {
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) };
  }
  if (buckets.size > 5000) {
    for (const [k, b] of buckets) {
      if (now >= b.resetAt) buckets.delete(k);
    }
  }
  return { ok: true };
}

function providedApiToken(request: NextRequest): string {
  return (
    request.headers.get("x-echodraft-token")?.trim() ||
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim() ||
    ""
  );
}

function timingSafeStringEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

/**
 * Authorization for API routes:
 *
 * Production (fail-closed):
 * - ECHODRAFT_API_TOKEN is REQUIRED. Missing config → 503.
 * - Accept either:
 *   1) Matching API token header (programmatic / automation), or
 *   2) Valid signed httpOnly session cookie issued by middleware after a real page load.
 * - Origin/Referer alone is NEVER sufficient (spoofable by server-side clients).
 *
 * Development:
 * - If token configured: token OR valid session cookie.
 * - If no token: allow local tooling.
 *
 * Note: in-process rate limiting still resets on serverless cold starts.
 * Token/session auth is the durable cost-control guard; rate limit is defense-in-depth only.
 */
export async function authorizeApiRequest(
  request: NextRequest
): Promise<{ ok: true; via: "token" | "session" | "dev" } | { ok: false; status: number; error: string }> {
  const configuredToken = getApiToken();
  const sessionSecret = getSessionSecret();
  const provided = providedApiToken(request);
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const prod = isProduction();

  if (prod && !configuredToken) {
    return {
      ok: false,
      status: 503,
      error: "Server misconfigured: ECHODRAFT_API_TOKEN must be set in production.",
    };
  }

  // 1) Explicit API token bypass-proof for automation.
  if (configuredToken && provided && timingSafeStringEqual(provided, configuredToken)) {
    return { ok: true, via: "token" };
  }

  // 2) Signed browser session cookie (not forgeable via Origin spoofing).
  if (sessionSecret && (await verifySessionValue(sessionCookie, sessionSecret))) {
    return { ok: true, via: "session" };
  }

  if (prod) {
    if (provided) {
      return { ok: false, status: 401, error: "Unauthorized. Provide a valid API token." };
    }
    return {
      ok: false,
      status: 401,
      error: "Unauthorized. Load the app in a browser (session cookie) or send x-echodraft-token.",
    };
  }

  // Dev without token: keep local DX unblocked.
  if (!configuredToken) {
    return { ok: true, via: "dev" };
  }

  return {
    ok: false,
    status: 401,
    error: "Unauthorized. Provide a valid API token or open the app to receive a session cookie.",
  };
}

export async function readJsonBody<T = unknown>(
  request: NextRequest
): Promise<{ ok: true; value: T } | { ok: false; response: NextResponse }> {
  const raw = request.headers.get("content-length");
  if (raw && Number(raw) > MAX_BODY_BYTES) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Request body too large." }, { status: 413 }),
    };
  }

  const buf = await request.arrayBuffer();
  if (buf.byteLength > MAX_BODY_BYTES) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Request body too large." }, { status: 413 }),
    };
  }

  try {
    const text = new TextDecoder().decode(buf);
    if (!text.trim()) {
      return {
        ok: false,
        response: NextResponse.json({ error: "Request body is required." }, { status: 400 }),
      };
    }
    return { ok: true, value: JSON.parse(text) as T };
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: "Invalid JSON body." }, { status: 400 }),
    };
  }
}

/** Map unknown errors to a safe client-facing message. */
export function toSafeClientError(
  error: unknown,
  fallback = "Something went wrong. Please try again."
): string {
  if (!(error instanceof Error) || !error.message) return fallback;
  const msg = error.message;

  const safePrefixes = [
    "Please provide",
    "Pillar content",
    "A valid voice profile",
    "Gemini authentication failed",
    "Gemini rate limit",
    "Gemini rejected",
    "Gemini returned",
    "Generation failed",
    "Generation response",
    "Refinement",
    "Enter a tweak",
    "Tweak exceeds",
    "Invalid",
    "Unauthorized",
    "Forbidden",
    "Request body",
    "Sample ",
    "Too many requests",
    "Server misconfigured",
  ];
  if (safePrefixes.some((p) => msg.startsWith(p))) return msg;

  if (/gemini api error/i.test(msg) || /generativelanguage/i.test(msg) || /api key/i.test(msg)) {
    return fallback;
  }
  if (msg.length <= 180 && !msg.includes("{") && !msg.includes("<")) return msg;
  return fallback;
}

export async function guardApiRequest(request: NextRequest): Promise<NextResponse | null> {
  const auth = await authorizeApiRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const rate = checkRateLimit(request);
  if (!rate.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please wait and try again." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSec) } }
    );
  }
  return null;
}

export function jsonError(error: unknown, status = 500, fallback?: string): NextResponse {
  return NextResponse.json({ error: toSafeClientError(error, fallback) }, { status });
}
