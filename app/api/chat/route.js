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
      maxTokens: 500, // Security: Prevent long-running/costly generation
      system: `You are Audio Copilot, an AI assistant built into the AudioAmbient mixer app. 
Your primary goal is to help users find the perfect soundscape based on their mood, activity, or environment.
    
Available sounds IDs are:
Nature: rain, ocean, forest, wind, fireplace, afternoon_open_field, crickets_insects, crickets, dawn_skyline, grasshopper_summer, insect, nature, rising_summer_rain, summer_birds_singing, summer_cicadas, summer_forest, summer_morning, summer_night, wind_01, wind_02, wind_03, windy_residential
Ambient: brown, white, binaural, cafe
Mechanical: city, control_tower, diesel_train_passing, heathrow_air_traffic, trains_diesel_electric
Crowd: arena_crowd, baby_crying, baseball_crowd, baseball_stadium, basketball_crowd, kids_amusement, village_playground, prisoner_chains

When a user describes what they want, ALWAYS use the \`setMixerLevels\` tool to automatically configure their mixer.
Volumes are from 0 to 100. Be extremely conversational and empathetic. Give a short, aesthetic response.`,
      messages,
      tools: {
        setMixerLevels: tool({
          description: 'Set the audio mixer volumes for ambient soundscape generation based on the users prompt.',
          parameters: z.object({
            volumes: z.record(z.string(), z.number().min(0).max(100)).describe('A map of sound IDs to their target volume levels (0-100). Omitted sounds are set to 0. Example: {"rain": 80, "brown": 30}'),
          }),
        }),
      },
      onFinish: () => {
         // Cleanup old rate limit entries occasionally
         if (rateLimitMap.size > 1000) rateLimitMap.clear();
      }
    });

    return result.toDataStreamResponse();
  } catch (err) {
    console.error('Chat API Error:', err);
    return NextResponse.json({ error: 'Failed to process chat request' }, { status: 500 });
  }
}
