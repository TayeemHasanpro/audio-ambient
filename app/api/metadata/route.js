import { NextResponse } from 'next/server';
import { z } from 'zod';
import { SOUND_METADATA } from '@/lib/soundCategories';

const requestSchema = z.object({
  title: z.string().default('Ambient Soundscape'),
  description: z.string().default('An ambient acoustic atmosphere'),
  volumes: z.record(z.string(), z.number().min(0).max(100)).default({}),
  pans: z.record(z.string(), z.number().min(-1).max(1)).optional().default({}),
  durationMinutes: z.number().min(1).max(360).default(60),
});

export async function POST(req) {
  try {
    const body = await req.json();
    const { title, description, volumes, pans, durationMinutes } = requestSchema.parse(body);

    const activeStems = Object.entries(volumes).filter(([_, vol]) => vol > 0);

    // Build stems technical breakdown
    const stemDetails = activeStems.map(([id, vol]) => {
      const panVal = pans[id] !== undefined ? pans[id] : (SOUND_METADATA[id]?.defaultPan || 0);
      const panStr = panVal === 0 ? 'Center' : panVal < 0 ? `Left ${Math.round(Math.abs(panVal) * 100)}%` : `Right ${Math.round(panVal * 100)}%`;
      const layer = SOUND_METADATA[id]?.layer || 'Texture';
      const behavior = SOUND_METADATA[id]?.behavior || 'continuous';
      const name = id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      return {
        id,
        name,
        volume: vol,
        pan: panStr,
        layer,
        behavior
      };
    });

    const stemsSummaryText = stemDetails
      .map(s => `- ${s.name} (${s.layer}): Gain ${s.volume}%, Pan ${s.pan}, Modulation: ${s.behavior}`)
      .join('\n');

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      // Fallback generator if API key is missing
      return NextResponse.json(generateFallbackMetadata({ title, description, stemDetails, durationMinutes, stemsSummaryText }));
    }

    const prompt = `You are a YouTube SEO expert and audio mastering engineer for relaxation and focus channels.
Given this soundscape:
- Mix Name: "${title}"
- Description: "${description}"
- Duration: ${durationMinutes} minutes
- Active Sound Stems:
${stemsSummaryText}

Generate YouTube packaging metadata matching this exact JSON format:
{
  "youtubeTitles": [
    "3 highly clickable, evocative YouTube titles with emojis, target audience keywords (e.g. Study, Focus, Sleep, ADHD, Relaxation), and duration label"
  ],
  "youtubeDescription": "Complete SEO-optimized YouTube description including:
1. Atmospheric overview hook
2. Recommended listening setup (headphones, 30-50% volume)
3. Chapter timestamps (formatted across ${durationMinutes} minutes)
4. Relaxation instructions
5. Search tags / hashtags",
  "authorshipStatement": "Short formal copyright and transformative synthesis statement declaring this unique multi-track generative soundscape was sculpted using AudioAmbient Engine v2.0 with custom stereo spatialization and dynamic master limiting."
}`;

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.7,
          maxOutputTokens: 2048,
          thinkingConfig: { thinkingBudget: 0 }
        }
      })
    });

    let aiResult = {};
    if (response.ok) {
      const data = await response.json();
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (responseText) {
        try {
          aiResult = JSON.parse(responseText);
        } catch {
          const clean = responseText.replace(/```json\n?|\n?```/g, '').trim();
          aiResult = JSON.parse(clean);
        }
      }
    }

    // Build the complete Stems Ledger
    const stemsLedger = `================================================================================
AUDIOAMBIENT STUDIO — TRANSFORMATIVE AUTHORSHIP & PRODUCTION LEDGER
================================================================================
Production Date: ${new Date().toISOString().split('T')[0]}
Soundscape Title: ${title}
Render Engine: AudioAmbient Generative Engine v2.0
Master Duration: ${durationMinutes} Minutes (${durationMinutes * 60} Seconds)
Loudness Standard: YouTube Target (-14 LUFS)

--- ACOUSTIC STEMS MANIFEST ---
${stemDetails.map(s => `[STEM] ${s.name.padEnd(28)} | Gain: ${String(s.volume + '%').padEnd(5)} | Pan: ${s.pan.padEnd(12)} | Layer: ${s.layer.padEnd(10)} | Mode: ${s.behavior}`).join('\n')}

--- MASTERING CHAIN & DYNAMICS SPECIFICATION ---
Bus Topology: Multi-Stem Parallel Summing -> Stereo Panning Matrix -> Dynamics Compressor -> 16-Bit Dither
Compressor Threshold: -6.0 dB
Compressor Knee: 12.0 dB
Compressor Ratio: 4.0:1
Attack Time: 3.0 ms
Release Time: 250.0 ms
Output Resolution: 16-bit Linear PCM Stereo @ 44.1 kHz

--- TRANSFORMATIVE AUTHORSHIP DISCLOSURE ---
${aiResult.authorshipStatement || 'This audio master is an original transformative composition created by multi-stem acoustic spatialization, custom gain balancing, and non-repeating stochastic modulation. Produced with AudioAmbient Engine.'}
================================================================================`;

    return NextResponse.json({
      youtubeTitles: aiResult.youtubeTitles || [
        `🌧️ ${title} | ${durationMinutes} Minutes Deep Focus & Relaxation`,
        `Study With Me: ${title} (Binaural Atmosphere)`,
        `Ambient Sanctuary: ${title} for Calm & Sleep`
      ],
      youtubeDescription: aiResult.youtubeDescription || generateDefaultDescription(title, description, durationMinutes),
      stemsLedger,
      stemDetails
    });

  } catch (error) {
    console.error('Error generating metadata ledger:', error);
    return NextResponse.json(
      { error: 'Failed to generate YouTube metadata.' },
      { status: 500 }
    );
  }
}

function generateDefaultDescription(title, description, durationMinutes) {
  return `Welcome to your personal acoustic sanctuary.

🎧 About This Soundscape:
${description}

✨ How to Listen:
• Best experienced with headphones for spatial depth.
• Set volume to a comfortable 30-50% level.
• Perfect for coding, deep study, reading, or falling asleep.

⏱️ Timestamps:
0:00 - Settling In & Deep Breath
${Math.round(durationMinutes * 0.25)}:00 - Cognitive Flow State
${Math.round(durationMinutes * 0.5)}:00 - Sustained Focus
${Math.round(durationMinutes * 0.75)}:00 - Calm Mind
${durationMinutes}:00 - Session Complete

🌿 Crafted with AudioAmbient Engine. All sound layers are balanced with mastering dynamics for optimal -14 LUFS YouTube playback.

#ambient #whitenoise #focus #study #relax #audioambient`;
}

function generateFallbackMetadata({ title, description, stemDetails, durationMinutes, stemsSummaryText }) {
  const defaultDesc = generateDefaultDescription(title, description, durationMinutes);
  const stemsLedger = `AUDIOAMBIENT PRODUCTION LEDGER\nTitle: ${title}\nDuration: ${durationMinutes}m\n\nStems:\n${stemsSummaryText}`;
  return {
    youtubeTitles: [
      `🌧️ ${title} | ${durationMinutes} Minutes Deep Focus & Study`,
      `Peaceful Atmosphere: ${title} (${durationMinutes}m)`,
      `Relaxing Ambient Noise for Sleep & Work: ${title}`
    ],
    youtubeDescription: defaultDesc,
    stemsLedger,
    stemDetails
  };
}
