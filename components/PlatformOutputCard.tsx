"use client";

import { useId, useState, type ReactNode } from "react";
import { FiAlertTriangle, FiCheck, FiCopy, FiRefreshCw, FiSliders } from "react-icons/fi";
import type { AuthenticityResult } from "@/lib/authenticity";
import { MAX_TWEAK_CHARS } from "@/lib/refinement";

type Props = {
  title: string;
  subtitle: string;
  content: string;
  icon: ReactNode;
  authenticity: AuthenticityResult;
  onRegenerate: (tweak: string) => Promise<void>;
  accentClass?: string;
};

export function PlatformOutputCard({
  title,
  subtitle,
  content,
  icon,
  authenticity,
  onRegenerate,
  accentClass = "bg-accent-blue-soft text-accent-blue",
}: Props) {
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [tweak, setTweak] = useState("");
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const titleId = useId();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const refine = async () => {
    if (working) return;
    if (!tweak.trim()) return setError("Enter a tweak first.");
    setWorking(true);
    setError(null);
    try {
      await onRegenerate(tweak.trim());
      setEditing(false);
      setTweak("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not regenerate this draft.");
    } finally {
      setWorking(false);
    }
  };

  const scoreClass =
    authenticity.label === "Strong"
      ? "bg-accent-green-soft text-accent-green"
      : authenticity.label === "Review"
        ? "bg-accent-orange-soft text-accent-orange"
        : "bg-accent-red-soft text-accent-red";

  return (
    <section className="bg-canvas rounded-xl border border-border shadow-sm overflow-hidden" aria-labelledby={titleId}>
      <div className="flex items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center ${accentClass}`} aria-hidden="true">
            {icon}
          </div>
          <div className="min-w-0">
            <h2 id={titleId} className="font-semibold">
              {title}
            </h2>
            <p className="text-xs text-secondary-text truncate">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            className="min-h-11 inline-flex items-center gap-2 rounded-lg border border-border px-3 text-sm font-medium hover:bg-surface"
          >
            <FiSliders aria-hidden="true" />
            <span className="hidden sm:inline">Tweak</span>
          </button>
          <button
            type="button"
            onClick={copy}
            className="min-h-11 inline-flex items-center gap-2 rounded-lg border border-border px-3 text-sm font-medium hover:bg-surface"
          >
            {copied ? <FiCheck className="text-accent-green" aria-hidden="true" /> : <FiCopy aria-hidden="true" />}
            <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>
      </div>

      {editing && (
        <div className="border-b border-border bg-surface p-4">
          <label className="text-sm font-semibold">Regenerate with a tweak</label>
          <div className="mt-2 flex flex-col sm:flex-row gap-2">
            <input
              value={tweak}
              maxLength={MAX_TWEAK_CHARS}
              onChange={(e) => setTweak(e.target.value)}
              placeholder="Make it punchier, shorter, or more casual…"
              className="min-h-11 flex-1 rounded-lg border border-border bg-white px-3 focus:outline-none focus:ring-2 focus:ring-accent-blue"
            />
            <button
              type="button"
              onClick={refine}
              disabled={working || !tweak.trim()}
              className="min-h-11 rounded-lg bg-accent-blue text-white px-4 font-semibold disabled:opacity-50"
            >
              {working ? (
                <span className="inline-flex items-center gap-2">
                  <FiRefreshCw className="animate-spin" aria-hidden="true" />
                  Rewriting…
                </span>
              ) : (
                "Apply tweak"
              )}
            </button>
          </div>
          {error && (
            <p className="mt-2 text-sm text-accent-red" role="alert">
              {error}
            </p>
          )}
        </div>
      )}

      <div className="p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className={`rounded-md px-2 py-1 text-xs font-semibold ${scoreClass}`}>
            Authenticity {authenticity.score}/100 · {authenticity.label}
          </span>
          {authenticity.flags.length > 0 && (
            <span className="inline-flex items-center gap-1 text-xs text-secondary-text">
              <FiAlertTriangle aria-hidden="true" /> {authenticity.flags.length} suggestion
              {authenticity.flags.length === 1 ? "" : "s"}
            </span>
          )}
        </div>
        {authenticity.flags.length > 0 && (
          <details className="mb-4 text-sm">
            <summary className="cursor-pointer text-secondary-text">Review authenticity suggestions</summary>
            <ul className="mt-2 list-disc pl-5 text-secondary-text">
              {authenticity.flags.map((flag, index) => (
                <li key={`${index}-${flag}`}>{flag}</li>
              ))}
            </ul>
          </details>
        )}
        {/* Render as plain text only never dangerouslySetInnerHTML. */}
        <p className="whitespace-pre-wrap leading-7">{content}</p>
      </div>
    </section>
  );
}
