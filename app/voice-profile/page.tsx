"use client";

import { useEffect, useId, useRef, useState } from "react";
import { VoiceProfileCard } from "@/components/VoiceProfileCard";
import { MAX_CHARS, type VoiceProfile } from "@/lib/gemini";
import { sanitizeVoiceProfile } from "@/lib/generation";
import { FiPlus, FiTrash2, FiRefreshCw, FiAlertCircle, FiCheck } from "react-icons/fi";

type SampleField = {
  id: string;
  text: string;
};

const STORAGE_KEY = "echodraft_voice_profile";

function createSampleId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `sample-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function createEmptySample(): SampleField {
  return { id: createSampleId(), text: "" };
}

export default function VoiceProfilePage() {
  const formId = useId();
  const [samples, setSamples] = useState<SampleField[]>(() => [createEmptySample()]);
  const [profile, setProfile] = useState<VoiceProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = sanitizeVoiceProfile(JSON.parse(saved));
        if (parsed) setProfile(parsed);
        else localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const updateSample = (id: string, value: string) => {
    setSamples((prev) =>
      prev.map((sample) =>
        sample.id === id ? { ...sample, text: value.slice(0, MAX_CHARS) } : sample
      )
    );
  };

  const addSample = () => {
    setSamples((prev) => (prev.length < 5 ? [...prev, createEmptySample()] : prev));
  };

  const removeSample = (id: string) => {
    setSamples((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((sample) => sample.id !== id);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loadingRef.current || loading) return;
    setError(null);

    const nonEmpty = samples.map((s) => s.text.trim()).filter(Boolean);
    if (nonEmpty.length < 3) {
      setError("Please paste at least 3 writing samples so we can capture your voice.");
      return;
    }

    const tooLong = nonEmpty.findIndex((s) => s.length > MAX_CHARS);
    if (tooLong !== -1) {
      setError(`Sample ${tooLong + 1} exceeds the ${MAX_CHARS}-character limit. Please shorten it.`);
      return;
    }

    loadingRef.current = true;
    setLoading(true);
    try {
      const res = await fetch("/api/build-voice-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ samples: nonEmpty }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || `Request failed with status ${res.status}`);
      }

      const safe = sanitizeVoiceProfile(data.voiceProfile);
      if (!safe) {
        throw new Error("The AI returned an unexpected shape. Please try again.");
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(safe));
      setProfile(safe);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  };

  const clearProfile = () => {
    localStorage.removeItem(STORAGE_KEY);
    setProfile(null);
    setSamples([createEmptySample()]);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary-text tracking-tight mb-3">
          Build Your Voice Profile
        </h1>
        <p className="text-secondary-text text-lg leading-relaxed">
          Paste 3–5 samples of your writing. EchoDraft will extract the tone, vocabulary, and rhythm
          that make your voice yours.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-canvas rounded-xl border border-border shadow-sm p-6 sm:p-8"
      >
        <div className="space-y-4">
          {samples.map((sample, index) => (
            <div key={sample.id}>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor={`${formId}-${sample.id}`}
                  className="text-sm font-semibold text-primary-text"
                >
                  Sample {index + 1}
                </label>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-secondary-text tabular-nums">
                    {sample.text.length}/{MAX_CHARS}
                  </span>
                  {samples.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSample(sample.id)}
                      className="text-secondary-text hover:text-accent-red transition-colors"
                      aria-label={`Remove sample ${index + 1}`}
                    >
                      <FiTrash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>
              <textarea
                id={`${formId}-${sample.id}`}
                value={sample.text}
                onChange={(e) => updateSample(sample.id, e.target.value)}
                maxLength={MAX_CHARS}
                placeholder="Paste a paragraph you’ve written — a post, email, or caption..."
                className="w-full min-h-[140px] p-4 rounded-lg bg-surface border border-border text-primary-text placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent resize-y transition-shadow"
              />
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6">
          <button
            type="button"
            onClick={addSample}
            disabled={samples.length >= 5}
            className="inline-flex items-center gap-2 text-sm font-medium text-accent-blue hover:text-accent-blue/80 disabled:text-secondary-text disabled:cursor-not-allowed transition-colors"
          >
            <FiPlus className="w-4 h-4" aria-hidden="true" />
            Add another sample {samples.length >= 5 && "(max 5)"}
          </button>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 bg-accent-blue text-white font-semibold px-6 py-3 rounded-lg hover:bg-accent-blue/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors min-w-[200px] min-h-11"
          >
            {loading ? (
              <>
                <FiRefreshCw className="w-4 h-4 animate-spin" aria-hidden="true" />
                Analyzing…
              </>
            ) : (
              "Build My Voice Profile"
            )}
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-6 flex items-start gap-3 rounded-lg bg-accent-red-soft p-4 text-accent-red"
          >
            <FiAlertCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-sm">{error}</p>
          </div>
        )}
      </form>

      {profile && (
        <>
          <div aria-live="polite" className="sr-only">
            Voice profile saved.
          </div>
          <VoiceProfileCard profile={profile} />
          <div className="mt-6 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-accent-green">
              <FiCheck className="w-4 h-4" aria-hidden="true" />
              <span>Saved on this device</span>
            </div>
            <button
              type="button"
              onClick={clearProfile}
              className="text-secondary-text hover:text-accent-red transition-colors"
            >
              Clear profile
            </button>
          </div>
        </>
      )}
    </div>
  );
}
