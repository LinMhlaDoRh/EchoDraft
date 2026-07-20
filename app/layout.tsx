import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "EchoDraft Multi-Platform Voice-Matched Content",
  description:
    "Capture your writing voice, then generate and refine native drafts for LinkedIn, X, Instagram, YouTube, and email without losing what makes you sound like you.",
  applicationName: "EchoDraft",
  openGraph: {
    title: "EchoDraft Multi-Platform Voice-Matched Content",
    description:
      "Generate five platform-native drafts from one pillar piece, score authenticity locally, and tweak only what needs work.",
    type: "website",
    siteName: "EchoDraft",
  },
  twitter: {
    card: "summary",
    title: "EchoDraft Multi-Platform Voice-Matched Content",
    description:
      "Generate five platform-native drafts from one pillar piece, score authenticity locally, and tweak only what needs work.",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Read nonce set by middleware so Next can apply it to framework scripts.
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html lang="en">
      <head>
        {/* Next App Router also consumes x-nonce from middleware automatically.
            Keeping an explicit meta is unnecessary; nonce is for script tags. */}
        {nonce ? <meta property="csp-nonce" content={nonce} /> : null}
      </head>
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
