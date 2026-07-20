"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  FiAlertCircle,
  FiDownload,
  FiInstagram,
  FiLinkedin,
  FiMail,
  FiRefreshCw,
  FiSliders,
  FiTwitter,
  FiYoutube,
} from "react-icons/fi";
import { PlatformOutputCard } from "@/components/PlatformOutputCard";
import { analyzeAuthenticity } from "@/lib/authenticity";
import type { VoiceProfile } from "@/lib/gemini";
import {
  formatAllOutputs,
  formatXThread,
  MAX_PILLAR_CHARS,
  normalizePlatformOutputs,
  platformOutputKey,
  sanitizeVoiceProfile,
  type PlatformId,
  type PlatformOutputs,
} from "@/lib/generation";

const PROFILE_KEY = "echodraft_voice_profile";

export default function Home() {
  const [pillarText, setPillarText] = useState("");
  const [voiceProfile, setVoiceProfile] = useState<VoiceProfile | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [outputs, setOutputs] = useState<PlatformOutputs | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(PROFILE_KEY);
      if (saved) {
        const parsed = sanitizeVoiceProfile(JSON.parse(saved));
        if (parsed) setVoiceProfile(parsed);
        else localStorage.removeItem(PROFILE_KEY);
      }
    } catch {
      localStorage.removeItem(PROFILE_KEY);
    } finally {
      setLoaded(true);
    }
  }, []);

  const generate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (loadingRef.current || loading) return;

    setError(null);
    setOutputs(null);

    if (!voiceProfile) return setError("Build your voice profile first.");
    if (!pillarText.trim()) return setError("Paste your pillar content before generating.");

    loadingRef.current = true;
    setLoading(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pillarText, voiceProfile }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || `Request failed with status ${response.status}`);
      setOutputs(normalizePlatformOutputs(data.outputs));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed. Please try again.");
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  };

  const regenerate = async (platform: PlatformId, tweak: string) => {
    if (!outputs || !voiceProfile) throw new Error("Generate the initial drafts first.");
    const key = platformOutputKey(platform);
    const response = await fetch("/api/regenerate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        platform,
        tweak,
        currentOutput: outputs[key],
        pillarText,
        voiceProfile,
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Could not regenerate this draft.");
    setOutputs((previous) => (previous ? { ...previous, [key]: data.output } : previous));
  };

  const exportAll = () => {
    if (!outputs) return;
    const url = URL.createObjectURL(
      new Blob([formatAllOutputs(outputs)], { type: "text/plain;charset=utf-8" })
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "echodraft-platform-outputs.txt";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <div className="max-w-3xl mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
          Five native drafts. Tuned until they sound like you.
        </h1>
        <p className="text-secondary-text text-lg">
          Paste one pillar piece and get platform-ready drafts for LinkedIn, X, Instagram, YouTube,
          and email — each checked for authenticity and easy to refine.
        </p>
      </div>

      {loaded && !voiceProfile && (
        <section className="rounded-xl border border-accent-orange bg-accent-orange-soft p-5 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex gap-3">
            <FiAlertCircle className="text-accent-orange mt-1" aria-hidden="true" />
            <div>
              <h2 className="font-semibold">Build your voice profile first</h2>
              <p className="text-sm text-secondary-text">Your voice traits drive every draft.</p>
            </div>
          </div>
          <Link
            href="/voice-profile"
            className="min-h-11 inline-flex items-center justify-center rounded-lg bg-primary-text text-white px-4 font-semibold text-sm"
          >
            Build voice profile
          </Link>
        </section>
      )}

      <div className="grid lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,.55fr)] gap-6 items-start">
        <form onSubmit={generate} className="bg-canvas rounded-xl border border-border shadow-sm p-6 sm:p-8">
          <div className="flex justify-between gap-4 mb-2">
            <label htmlFor="pillar" className="font-semibold">
              Pillar content
            </label>
            <span className="text-xs text-secondary-text tabular-nums">
              {pillarText.length}/{MAX_PILLAR_CHARS}
            </span>
          </div>
          <p className="text-sm text-secondary-text mb-4">Paste a blog post, transcript, or long caption.</p>
          <textarea
            id="pillar"
            value={pillarText}
            maxLength={MAX_PILLAR_CHARS}
            onChange={(e) => setPillarText(e.target.value.slice(0, MAX_PILLAR_CHARS))}
            placeholder="Paste your pillar content…"
            className="w-full min-h-[320px] p-4 rounded-lg bg-surface border border-border focus:outline-none focus:ring-2 focus:ring-accent-blue resize-y"
          />
          {error && (
            <div role="alert" className="mt-4 flex gap-3 rounded-lg bg-accent-red-soft p-4 text-accent-red">
              <FiAlertCircle className="shrink-0 mt-1" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium">{error}</p>
                <p className="text-xs mt-1 opacity-80">
                  Your pillar text is still here. Check the message and try again.
                </p>
              </div>
            </div>
          )}
          <button
            type="submit"
            disabled={!voiceProfile || !pillarText.trim() || loading}
            className="mt-6 w-full min-h-12 inline-flex items-center justify-center gap-2 bg-accent-blue text-white font-semibold rounded-lg disabled:opacity-50"
          >
            {loading ? (
              <>
                <FiRefreshCw className="animate-spin" aria-hidden="true" />
                Matching voice across five formats…
              </>
            ) : (
              "Generate all 5 platforms"
            )}
          </button>
        </form>

        <aside className="space-y-4">
          <div className="bg-canvas rounded-xl border border-border p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary-text mb-2">
              Voice profile
            </p>
            {voiceProfile ? (
              <>
                <p className="font-medium">{voiceProfile.tone}</p>
                <p className="mt-2 text-sm text-secondary-text">{voiceProfile.sentence_rhythm}</p>
                <Link href="/voice-profile" className="inline-block mt-3 text-sm font-medium text-accent-blue">
                  Edit profile
                </Link>
              </>
            ) : (
              <p className="text-sm text-secondary-text">No saved profile found.</p>
            )}
          </div>
          <div className="bg-accent-blue-soft rounded-xl p-5 flex gap-3">
            <FiSliders className="text-accent-blue shrink-0 mt-1" aria-hidden="true" />
            <div>
              <p className="font-semibold">Refine any draft</p>
              <p className="text-sm text-secondary-text mt-1">
                Open Tweak on a card, describe the change you want, and only that draft updates.
              </p>
            </div>
          </div>
        </aside>
      </div>

      {loading && (
        <section className="mt-10" aria-label="Generating drafts" aria-busy="true">
          <div className="h-7 w-64 rounded bg-surface-2 animate-pulse mb-5" />
          <div className="grid xl:grid-cols-2 gap-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-64 rounded-xl border border-border bg-canvas p-6">
                <div className="h-5 w-40 rounded bg-surface-2 animate-pulse" />
                <div className="mt-8 space-y-3">
                  {[1, 2, 3, 4].map((n) => (
                    <div
                      key={n}
                      className="h-4 rounded bg-surface-2 animate-pulse"
                      style={{ width: `${92 - n * 7}%` }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {outputs ? "Platform drafts are ready." : loading ? "Generating platform drafts." : ""}
      </div>

      {outputs && (
        <section className="mt-10" aria-label="Generated platform drafts">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5">
            <div>
              <h2 className="text-2xl font-bold">Your platform-ready drafts</h2>
              <p className="text-sm text-secondary-text mt-1">
                Copy any draft, or open Tweak to refine one without touching the others.
              </p>
            </div>
            <button
              type="button"
              onClick={exportAll}
              className="min-h-11 inline-flex items-center justify-center gap-2 rounded-lg bg-primary-text text-white px-4 text-sm font-semibold"
            >
              <FiDownload aria-hidden="true" />
              Export all (.txt)
            </button>
          </div>

          <div className="grid xl:grid-cols-2 gap-6 items-start">
            <PlatformOutputCard
              title="LinkedIn post"
              subtitle="Professional, human, 1,200–1,500 characters"
              content={outputs.linkedin}
              icon={<FiLinkedin />}
              authenticity={analyzeAuthenticity(outputs.linkedin)}
              onRegenerate={(t) => regenerate("linkedin", t)}
            />
            <PlatformOutputCard
              title="X thread"
              subtitle={`${outputs.xThread.length} numbered posts · max 280 characters each`}
              content={formatXThread(outputs.xThread)}
              icon={<FiTwitter />}
              accentClass="bg-primary-text text-white"
              authenticity={analyzeAuthenticity(formatXThread(outputs.xThread))}
              onRegenerate={(t) => regenerate("x", t)}
            />
            <PlatformOutputCard
              title="Instagram caption"
              subtitle="Conversational, emoji-aware, hashtag-ready"
              content={outputs.instagram}
              icon={<FiInstagram />}
              accentClass="bg-accent-red-soft text-accent-red"
              authenticity={analyzeAuthenticity(outputs.instagram)}
              onRegenerate={(t) => regenerate("instagram", t)}
            />
            <PlatformOutputCard
              title="YouTube description"
              subtitle="Keyword-rich with timestamps and links"
              content={outputs.youtube}
              icon={<FiYoutube />}
              accentClass="bg-accent-red-soft text-accent-red"
              authenticity={analyzeAuthenticity(outputs.youtube)}
              onRegenerate={(t) => regenerate("youtube", t)}
            />
            <PlatformOutputCard
              title="Email newsletter"
              subtitle="Subject, personal opener, and CTA"
              content={outputs.newsletter}
              icon={<FiMail />}
              authenticity={analyzeAuthenticity(outputs.newsletter)}
              onRegenerate={(t) => regenerate("newsletter", t)}
            />
          </div>
        </section>
      )}
    </div>
  );
}
