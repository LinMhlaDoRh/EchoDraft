/**
 * Edge-safe signed session helpers (Web Crypto only).
 * Used by middleware (Edge) and API route guards (Node).
 * Auth must not rely on a spoofable Origin header alone.
 */

export const SESSION_COOKIE_NAME = "echodraft_session";

/** Session cookie lifetime (seconds). */
export const SESSION_TTL_SEC = 60 * 60 * 12; // 12 hours

export function getApiToken(): string | null {
  const token = process.env.ECHODRAFT_API_TOKEN?.trim();
  return token || null;
}

/** Signing secret for browser session cookies. Prefers dedicated secret, falls back to API token. */
export function getSessionSecret(): string | null {
  const dedicated = process.env.ECHODRAFT_SESSION_SECRET?.trim();
  if (dedicated) return dedicated;
  return getApiToken();
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

export function sessionCookieOptions(isProd: boolean) {
  return {
    httpOnly: true as const,
    secure: isProd,
    sameSite: "strict" as const,
    path: "/",
    maxAge: SESSION_TTL_SEC,
  };
}

function toBase64Url(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";
  for (let i = 0; i < arr.length; i++) binary += String.fromCharCode(arr[i]!);
  // btoa is available in Edge and Node 18+
  const b64 = btoa(binary);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string): Uint8Array | null {
  try {
    const padded = value.replace(/-/g, "+").replace(/_/g, "/");
    const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
    const binary = atob(padded + pad);
    const out = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
    return out;
  } catch {
    return null;
  }
}

async function importHmacKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

async function signPayload(payload: string, secret: string): Promise<string> {
  const key = await importHmacKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return toBase64Url(sig);
}

async function verifyPayload(payload: string, sig: string, secret: string): Promise<boolean> {
  const key = await importHmacKey(secret);
  const sigBytes = fromBase64Url(sig);
  if (!sigBytes) return false;
  // subtle.verify expects an ArrayBufferView / BufferSource
  return crypto.subtle.verify("HMAC", key, sigBytes, new TextEncoder().encode(payload));
}

function randomNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return toBase64Url(bytes);
}

/** Create a signed session value: `exp.nonce.sig` */
export async function createSessionValue(secret: string, nowMs = Date.now()): Promise<string> {
  const exp = Math.floor(nowMs / 1000) + SESSION_TTL_SEC;
  const nonce = randomNonce();
  const payload = `${exp}.${nonce}`;
  const sig = await signPayload(payload, secret);
  return `${payload}.${sig}`;
}

export async function verifySessionValue(
  value: string | undefined | null,
  secret: string,
  nowMs = Date.now()
): Promise<boolean> {
  if (!value) return false;
  const parts = value.split(".");
  if (parts.length !== 3) return false;
  const [expStr, nonce, sig] = parts;
  if (!expStr || !nonce || !sig) return false;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp * 1000 < nowMs) return false;
  const payload = `${expStr}.${nonce}`;
  return verifyPayload(payload, sig, secret);
}

/** Build CSP. With nonce, script-src drops unsafe-inline / unsafe-eval. */
export function buildContentSecurityPolicy(nonce?: string): string {
  const scriptSrc = nonce
    ? `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`
    : "script-src 'self'";

  return [
    "default-src 'self'",
    scriptSrc,
    // Tailwind utility CSS may rely on inline style attributes in the DOM.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}

export function createCspNonce(): string {
  return randomNonce();
}
