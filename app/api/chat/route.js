import { NextResponse } from 'next/server';
import { z } from 'zod';

// Sound library configuration matching the app's catalog
const SOUND_LIBRARY = {
  Nature: [
    { id: 'rain_on_leaves', name: 'Rain on Leaves' },
    { id: 'rain_on_tent', name: 'Rain on Tent' },
    { id: 'rain_on_umbrella', name: 'Rain on Umbrella' },
    { id: 'rain_on_window', name: 'Rain on Window' },
    { id: 'soft_rain', name: 'Soft Rain' },
    { id: 'strong_rain_thunders', name: 'Rain & Thunders' },
    { id: 'river_peaceful', name: 'Peaceful River' },
    { id: 'waterfall', name: 'Waterfall' },
    { id: 'spring_birds', name: 'Spring Birds' },
    { id: 'crows', name: 'Crows' },
    { id: 'ducks_on_field', name: 'Ducks on Field' },
    { id: 'frogs_ambience', name: 'Frogs Ambience' },
    { id: 'howling_polar_wind', name: 'Howling Polar Wind' },
    { id: 'winter_whistling_wind', name: 'Winter Wind' },
    { id: 'rustling_leaves', name: 'Rustling Leaves' },
    { id: 'seagull_in_town', name: 'Seagulls in Town' },
    { id: 'wooden_windbells_wind', name: 'Wooden Windbells' },
    { id: 'walking_on_rocks', name: 'Walking on Rocks' },
    { id: 'walking_on_snow', name: 'Walking on Snow' },
    { id: 'walking_tall_grass', name: 'Walking in Grass' },
    { id: 'walking_gravel_mono', name: 'Walking on Gravel' },
    { id: 'crossroads_after_raining', name: 'Street After Rain' }
  ],
  Ambient: [
    { id: 'low_hum', name: 'Low Hum' },
    { id: 'magnetic_hum', name: 'Magnetic Hum' },
    { id: 'mysterious_muted_dimension', name: 'Muted Dimension' },
    { id: 'pink_noise', name: 'Pink Noise' },
    { id: 'static_white_noise', name: 'Static White Noise' },
    { id: 'space_drift', name: 'Space Drift' },
    { id: 'tibetan_singing_bowl', name: 'Tibetan Bowl' },
    { id: 'ethereal_loop', name: 'Ethereal Loop' },
    { id: 'electric_loop_synth_hum', name: 'Synth Field Hum' },
    { id: 'energy_hum', name: 'Energy Hum' },
    { id: 'delta_range', name: 'Delta Range' },
    { id: 'enote', name: 'E-Note' },
    { id: 'vinyl_warm_noise', name: 'Vinyl Warm Noise' },
    { id: 'washy_noises_background', name: 'Washy Noise' },
    { id: 'radio_static', name: 'Radio Static' }
  ],
  Mechanical: [
    { id: 'courtyard_ac', name: 'Courtyard AC' },
    { id: 'steam_engine', name: 'Steam Engine' },
    { id: 'subway_journey', name: 'Subway Journey' },
    { id: 'washing_machine', name: 'Washing Machine' },
    { id: 'windscreen_wiper', name: 'Windscreen Wiper' },
    { id: 'helicopter_in_flight', name: 'Helicopter Flight' },
    { id: 'typewriter', name: 'Typewriter' },
    { id: 'laptop_typing_slow', name: 'Laptop Typing' },
    { id: 'grandfather_clock', name: 'Grandfather Clock' },
    { id: 'slow_traffic_street', name: 'Slow Traffic' },
    { id: 'traffic_in_distance', name: 'Distant Traffic' }
  ],
  Crowd: [
    { id: 'public_gym', name: 'Public Gym' },
    { id: 'supermarket', name: 'Supermarket' },
    { id: 'quiet_library', name: 'Quiet Library' },
    { id: 'rowing_boat', name: 'Rowing Boat' },
    { id: 'sizzling_oil', name: 'Sizzling Oil' },
    { id: 'small_chimes', name: 'Small Chimes' },
    { id: 'underwater_bubbles', name: 'Underwater Bubbles' },
    { id: 'distant_fireworks', name: 'Distant Fireworks' },
    { id: 'footsteps_clothes', name: 'Footsteps & Clothes' },
    { id: 'hair_cut', name: 'Hair Cut' },
    { id: 'happy_dog_indoor', name: 'Happy Dog Indoor' },
    { id: 'rural_tin_roof_drips', name: 'Tin Roof Drips' },
    { id: 'pencil_writing', name: 'Pencil Writing' },
    { id: 'sweeping_pavement', name: 'Sweeping Pavement' },
    { id: 'glass_rolling_stone', name: 'Glass Rolling' },
    { id: 'newspaper_pages', name: 'Newspaper Pages' }
  ]
};

const VALID_SOUND_IDS = new Set(
  Object.values(SOUND_LIBRARY).flatMap(cat => cat.map(s => s.id))
);

const SOUNDS_SUMMARY = Object.entries(SOUND_LIBRARY)
  .map(([cat, items]) => `${cat.toUpperCase()}:\n` + items.map(s => `  - "${s.id}": ${s.name}`).join('\n'))
  .join('\n\n');

// In-memory rate limiting (20 requests per minute per IP)
const rateLimitMap = new Map();
const RATE_LIMIT_COUNT = 20;
const RATE_LIMIT_WINDOW = 60 * 1000;

const requestSchema = z.object({
  prompt: z.string().trim().min(1, 'Prompt cannot be empty').max(500, 'Prompt too long'),
});

const SYSTEM_INSTRUCTION = `You are AudioAmbient Copilot, an expert sound designer and acoustic atmosphere architect.
Your mission is to look at the user's available sound library and mix different sounds to create an immersive ambient soundscape tailored to their request.

AVAILABLE SOUND LIBRARY:
${SOUNDS_SUMMARY}

SOUND MIXING GUIDELINES:
1. Select 3 to 6 complementary sounds that create an acoustic scene with depth:
   - Base/Foundation (e.g. ambient hums, low frequencies, constant rain, wind)
   - Mid-ground atmosphere (e.g. river, street, library room tone, vinyl)
   - Foreground accents (e.g. birds, chimes, typing, drops, pages)
2. Assign balanced volume levels between 15 and 90 for each selected sound:
   - Primary focal sound: 60 - 85
   - Supporting background textures: 30 - 55
   - Subtle accents: 15 - 35
3. ONLY use sound IDs from the available list above. Do not invent sound IDs.
4. Craft a concise, poetic title (2-4 words) and a brief evocative atmosphere description (1-2 sentences).

OUTPUT FORMAT:
You must respond with valid JSON matching this exact structure:
{
  "title": "Evocative Title",
  "description": "Short 1-2 sentence atmospheric description.",
  "volumes": {
    "<exact_sound_id>": <integer between 15 and 90>
  }
}`;

export async function POST(req) {
  // Rate limiting check
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous';
  const now = Date.now();
  const userRate = rateLimitMap.get(ip) || { count: 0, startTime: now };

  if (now - userRate.startTime > RATE_LIMIT_WINDOW) {
    userRate.count = 1;
    userRate.startTime = now;
  } else {
    userRate.count++;
  }
  rateLimitMap.set(ip, userRate);

  if (rateLimitMap.size > 2000) rateLimitMap.clear();

  if (userRate.count > RATE_LIMIT_COUNT) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please wait a minute before requesting another soundscape.' },
      { status: 429 }
    );
  }

  try {
    const rawBody = await req.json();
    const { prompt } = requestSchema.parse(rawBody);

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      console.error('Missing GOOGLE_GENERATIVE_AI_API_KEY environment variable');
      return NextResponse.json(
        { error: 'AI generation service is not configured.' },
        { status: 503 }
      );
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const geminiPayload = {
      contents: [
        {
          role: 'user',
          parts: [{ text: `Create an ambient soundscape mix for: "${prompt}"` }]
        }
      ],
      systemInstruction: {
        parts: [{ text: SYSTEM_INSTRUCTION }]
      },
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.7,
        maxOutputTokens: 2048,
        thinkingConfig: {
          thinkingBudget: 0
        }
      }
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiPayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error:', response.status, errorText);
      return NextResponse.json(
        { error: 'Failed to communicate with AI service. Please try again.' },
        { status: 502 }
      );
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      return NextResponse.json(
        { error: 'AI returned an empty response.' },
        { status: 500 }
      );
    }

    let parsedResult;
    try {
      parsedResult = JSON.parse(responseText);
    } catch {
      const cleanJson = responseText.replace(/```json\n?|\n?```/g, '').trim();
      parsedResult = JSON.parse(cleanJson);
    }

    // Filter and sanitize returned volumes to only include verified sound IDs
    const sanitizedVolumes = {};
    if (parsedResult.volumes && typeof parsedResult.volumes === 'object') {
      for (const [id, vol] of Object.entries(parsedResult.volumes)) {
        if (VALID_SOUND_IDS.has(id)) {
          const numVol = Math.round(Number(vol));
          if (!isNaN(numVol) && numVol > 0) {
            sanitizedVolumes[id] = Math.min(100, Math.max(10, numVol));
          }
        }
      }
    }

    if (Object.keys(sanitizedVolumes).length === 0) {
      sanitizedVolumes['soft_rain'] = 60;
      sanitizedVolumes['low_hum'] = 40;
    }

    return NextResponse.json({
      title: parsedResult.title || 'Custom Ambient Mix',
      description: parsedResult.description || 'A unique ambient mix sculpted for your space.',
      volumes: sanitizedVolumes,
      active_sounds: Object.keys(sanitizedVolumes),
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      const issueMessage = error.issues?.[0]?.message || error.errors?.[0]?.message || 'Invalid input';
      return NextResponse.json(
        { error: issueMessage },
        { status: 400 }
      );
    }
    console.error('Error generating ambient soundscape:', error);
    return NextResponse.json(
      { error: 'Internal error generating soundscape.' },
      { status: 500 }
    );
  }
}
