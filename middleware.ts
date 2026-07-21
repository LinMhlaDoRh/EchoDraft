import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE_NAME,
  buildContentSecurityPolicy,
  createCspNonce,
  createSessionValue,
  getSessionSecret,
  isProduction,
  sessionCookieOptions,
  verifySessionValue,
} from "@/lib/session";

/**
 * Edge middleware:
 * - Issues signed httpOnly session cookies for browser page loads
 * - Applies nonce-based CSP without unsafe-inline/unsafe-eval on scripts
 * - Blocks disallowed CORS preflight for API routes
 */
export async function middleware(request: NextRequest) {
  const prod = isProduction();
  const nonce = createCspNonce();
  const csp = buildContentSecurityPolicy(nonce);

  // Handle CORS preflight for API routes only allow same-origin.
  if (request.method === "OPTIONS" && request.nextUrl.pathname.startsWith("/api/")) {
    const origin = request.headers.get("origin");
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
    let allowed = false;
    if (origin && host) {
      try {
        allowed = new URL(origin).host.toLowerCase() === host.toLowerCase();
      } catch {
        allowed = false;
      }
    }
    if (!allowed) {
      return new NextResponse(null, { status: 403 });
    }
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": origin!,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, x-echodraft-token, Authorization",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Max-Age": "86400",
        Vary: "Origin",
        ...baseSecurityHeaders(csp, prod),
      },
    });
  }

  // Pass nonce to the App Router so Next can attach it to framework scripts.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  // Some Next versions also read CSP from the request for inline script nonces.
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  applySecurityHeaders(response, csp, prod);

  // Issue / refresh signed browser session on document navigations (not on API).
  // Cookie is httpOnly + SameSite=strict JS never sees secrets.
  if (!request.nextUrl.pathname.startsWith("/api/")) {
    const secret = getSessionSecret();
    if (secret) {
      const existing = request.cookies.get(SESSION_COOKIE_NAME)?.value;
      if (!(await verifySessionValue(existing, secret))) {
        response.cookies.set(
          SESSION_COOKIE_NAME,
          await createSessionValue(secret),
          sessionCookieOptions(prod)
        );
      }
    } else if (prod) {
      response.headers.set("X-EchoDraft-Config", "missing-ECHODRAFT_API_TOKEN");
    }
  }

  if (request.nextUrl.pathname.startsWith("/api/")) {
    const origin = request.headers.get("origin");
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
    if (origin && host) {
      try {
        if (new URL(origin).host.toLowerCase() === host.toLowerCase()) {
          response.headers.set("Access-Control-Allow-Origin", origin);
          response.headers.set("Access-Control-Allow-Credentials", "true");
          response.headers.set("Vary", "Origin");
        }
      } catch {
        // ignore invalid origin
      }
    }
  }

  return response;
}

function baseSecurityHeaders(csp: string, prod: boolean): Record<string, string> {
  const headers: Record<string, string> = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "X-DNS-Prefetch-Control": "off",
    "Content-Security-Policy": csp,
  };
  if (prod) {
    headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains; preload";
  }
  return headers;
}

function applySecurityHeaders(response: NextResponse, csp: string, prod: boolean) {
  const headers = baseSecurityHeaders(csp, prod);
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
