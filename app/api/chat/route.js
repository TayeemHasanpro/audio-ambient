import { google } from '@ai-sdk/google';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { NextResponse } from 'next/server';

export const maxDuration = 30;

// Simple in-memory rate limiting (Note: ephemeral on serverless)
const rateLimitMap = new Map();
const RATE_LIMIT_COUNT = 20;
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

export async function POST(req) {
  const ip = req.headers.get('x-forwarded-for') || 'anonymous';
  const now = Date.now();
  const userRate = rateLimitMap.get(ip) || { count: 0, startTime: now };

  if (now - userRate.startTime > RATE_LIMIT_WINDOW) {
    userRate.count = 1;
    userRate.startTime = now;
  } else {
    userRate.count++;
  }
  rateLimitMap.set(ip, userRate);

  if (userRate.count > RATE_LIMIT_COUNT) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const { messages } = await req.json();

    const result = streamText({
      model: google('gemini-1.5-flash'),
      maxTokens: 500,
      toolChoice: 'required', // Always call the tool — never just reply with text
      system: `You are Audio Copilot, an intelligent ambient sound designer built into the AudioAmbient mixer app.
Your job: analyze the user's mood, activity, or environment and ALWAYS call setMixerLevels with a creative, fitting mix.

AVAILABLE SOUND IDs (use EXACT IDs):
Nature: rain, ocean, forest, wind, fireplace, afternoon_open_field, crickets_insects, crickets, dawn_skyline, grasshopper_summer, insect, nature, rising_summer_rain, summer_birds_singing, summer_cicadas, summer_forest, summer_morning, summer_night, wind_01, wind_02, wind_03, windy_residential
Ambient: brown, white, binaural, cafe
Mechanical: city, control_tower, diesel_train_passing, heathrow_air_traffic, trains_diesel_electric
Crowd: arena_crowd, baby_crying, baseball_crowd, baseball_stadium, basketball_crowd, kids_amusement, village_playground, prisoner_chains

CREATIVE USAGE GUIDE:
- Focus/Study: binaural (60), brown (40), cafe (20)
- Sleep: rain (70), ocean (50), crickets (30)
- Meditation: wind_01 (40), summer_morning (50), dawn_skyline (30)
- Cozy night: fireplace (80), rain (50), wind_02 (20)
- Coffee shop: cafe (70), city (30), rising_summer_rain (20)
- Nature walk: summer_forest (70), summer_birds_singing (50), summer_morning (30)
- Storm: rain (90), wind_03 (70), ocean (40)
- City vibe: city (70), cafe (40), diesel_train_passing (20)
- Stress relief: ocean (80), binaural (60), brown (30)
- Morning energy: dawn_skyline (60), summer_birds_singing (70), summer_morning (50)
- Spooky: wind_02 (60), crickets_insects (50), insect (30), summer_night (40)
- Sports energy: arena_crowd (70), basketball_crowd (50), city (30)
- Deep work: brown (70), white (30), binaural (50)

RULES:
1. ALWAYS call setMixerLevels — never just reply with text alone.
2. Use 3-5 sounds per mix for richness.
3. Be CREATIVE — avoid defaulting to just rain+ocean+forest.
4. After the tool call, write ONE short, evocative sentence describing the atmosphere you created.`,
      messages,
      tools: {
        setMixerLevels: tool({
          description: 'Set the audio mixer volumes to generate an ambient soundscape tailored to the user.',
          parameters: z.object({
            volumes: z.record(z.string(), z.number().min(0).max(100)).describe('Map of sound IDs to volume levels (0-100). Include only sounds with volume > 0.'),
          }),
        }),
      },
      onFinish: () => {
         if (rateLimitMap.size > 1000) rateLimitMap.clear();
      }
    });

    return result.toDataStreamResponse();
  } catch (err) {
    console.error('Chat API Error:', err);
    return NextResponse.json({ error: 'Failed to process chat request' }, { status: 500 });
  }
}
