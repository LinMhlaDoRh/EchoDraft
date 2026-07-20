import { NextRequest, NextResponse } from "next/server";
import { guardApiRequest, jsonError, readJsonBody } from "@/lib/api-security";
import { callGeminiForVoiceProfile, DEFAULT_VOICE_MODEL, MAX_CHARS } from "@/lib/gemini";
import { sanitizeVoiceProfile } from "@/lib/generation";

export async function POST(request: NextRequest) {
  const blocked = await guardApiRequest(request);
  if (blocked) return blocked;

  try {
    const bodyResult = await readJsonBody<{ samples?: unknown }>(request);
    if (!bodyResult.ok) return bodyResult.response;

    const samples = Array.isArray(bodyResult.value?.samples)
      ? bodyResult.value.samples.filter((s: unknown) => typeof s === "string" && s.trim())
      : [];

    if (samples.length < 3) {
      return NextResponse.json(
        { error: "Please provide at least 3 writing samples." },
        { status: 400 }
      );
    }
    if (samples.length > 5) {
      return NextResponse.json(
        { error: "Please provide at most 5 writing samples." },
        { status: 400 }
      );
    }
    const tooLong = samples.findIndex((s: string) => s.length > MAX_CHARS);
    if (tooLong !== -1) {
      return NextResponse.json(
        { error: `Sample ${tooLong + 1} exceeds the ${MAX_CHARS}-character limit.` },
        { status: 400 }
      );
    }

    const rawProfile = await callGeminiForVoiceProfile(
      samples,
      process.env.GEMINI_API_KEY,
      process.env.GEMINI_MODEL || DEFAULT_VOICE_MODEL
    );
    const voiceProfile = sanitizeVoiceProfile(rawProfile) ?? rawProfile;
    return NextResponse.json({ voiceProfile });
  } catch (error) {
    return jsonError(error, 500, "Internal server error");
  }
}
