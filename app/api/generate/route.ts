import { NextRequest, NextResponse } from "next/server";
import { guardApiRequest, jsonError, readJsonBody } from "@/lib/api-security";
import {
  DEFAULT_GEMINI_MODEL,
  generateAllPlatformPosts,
  validateGenerateInput,
} from "@/lib/generation";

export async function POST(request: NextRequest) {
  const blocked = await guardApiRequest(request);
  if (blocked) return blocked;

  try {
    const bodyResult = await readJsonBody(request);
    if (!bodyResult.ok) return bodyResult.response;

    const validation = validateGenerateInput(bodyResult.value as never);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const result = await generateAllPlatformPosts(
      validation.value,
      process.env.GEMINI_API_KEY,
      process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL
    );
    return NextResponse.json(result);
  } catch (error) {
    return jsonError(error, 500, "Internal server error");
  }
}
