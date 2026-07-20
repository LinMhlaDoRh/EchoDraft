import type { VoiceProfile } from "@/lib/gemini";

export function VoiceProfileCard({ profile }: { profile: VoiceProfile }) {
  return (
    <div className="bg-canvas rounded-xl border border-border shadow-sm p-6 sm:p-8 mt-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-accent-green-soft flex items-center justify-center">
          <span className="text-accent-green font-semibold text-sm">VP</span>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-primary-text">Your Voice Profile</h2>
          <p className="text-sm text-secondary-text">Extracted from your writing samples</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5 mb-6">
        <div className="bg-surface rounded-lg p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-secondary-text mb-1">Tone</p>
          <p className="text-primary-text leading-relaxed">{profile.tone}</p>
        </div>
        <div className="bg-surface rounded-lg p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-secondary-text mb-1">
            Vocabulary
          </p>
          <p className="text-primary-text leading-relaxed">{profile.vocabulary}</p>
        </div>
        <div className="bg-surface rounded-lg p-4 sm:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-secondary-text mb-1">
            Sentence Rhythm
          </p>
          <p className="text-primary-text leading-relaxed">{profile.sentence_rhythm}</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-accent-green mb-2">Do’s</p>
          <ul className="space-y-2">
            {profile.dos.map((item) => (
              <li key={`do-${item}`} className="flex items-start gap-2 text-primary-text text-sm">
                <span className="text-accent-green mt-0.5" aria-hidden="true">
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-accent-red mb-2">Don’ts</p>
          <ul className="space-y-2">
            {profile.donts.map((item) => (
              <li key={`dont-${item}`} className="flex items-start gap-2 text-primary-text text-sm">
                <span className="text-accent-red mt-0.5" aria-hidden="true">
                  ✕
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
