'use client';

import React, { useState } from 'react';

const INSPIRATION_CHIPS = [
  { label: '🌧️ Rainy Coffee Shop', prompt: 'Cozy rainy cafe with gentle rain on window, quiet hum, and soft laptop typing' },
  { label: '🌌 Deep Space Drift', prompt: 'Ethereal deep space drift with hypnotic low hum and cosmic synth frequencies' },
  { label: '🌲 Forest River', prompt: 'Peaceful morning walk near a flowing river with spring birds and rustling leaves' },
  { label: '⚡ Thunderstorm Cabin', prompt: 'Heavy rain and rolling thunder outside a rustic cabin with tin roof drips' },
  { label: '🧘 Zen Sanctuary', prompt: 'Meditative sanctuary with tibetan singing bowl, gentle stream, and soft wind chimes' },
  { label: '💻 Midnight Code Flow', prompt: 'Focused late night study with rhythmic keyboard typing, subtle vinyl noise, and quiet library room tone' },
];

export default function AiSoundscapePrompt({ onApplyMix, activeSoundCount = 0, onRevertMix, canRevert = false }) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);

  const handleGenerate = async (promptText) => {
    const textToSubmit = (promptText || prompt).trim();
    if (!textToSubmit || isGenerating) return;

    setIsGenerating(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: textToSubmit }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate soundscape.');
      }

      if (!data.volumes || Object.keys(data.volumes).length === 0) {
        throw new Error('No valid sounds generated. Please try a different description.');
      }

      setLastGenerated({
        title: data.title,
        description: data.description,
        volumes: data.volumes,
        active_sounds: data.active_sounds || Object.keys(data.volumes),
        promptUsed: textToSubmit,
      });

      // Notify parent to apply the mix to the Web Audio engine
      if (onApplyMix) {
        onApplyMix({
          title: data.title,
          description: data.description,
          volumes: data.volumes,
          active_sounds: data.active_sounds || Object.keys(data.volumes),
        });
      }
    } catch (err) {
      console.error('Soundscape generation error:', err);
      setErrorMessage(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleGenerate(prompt);
  };

  const handleChipClick = (chipPrompt) => {
    setPrompt(chipPrompt);
    handleGenerate(chipPrompt);
  };

  return (
    <div className="w-full mb-6 rounded-2xl glass-panel edge-light border border-primary/20 p-4 md:p-5 relative overflow-hidden transition-all duration-300 shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
      {/* Subtle Background Glow */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center size-7 rounded-lg bg-primary/15 text-primary border border-primary/30">
            <span className="material-symbols-outlined text-base animate-pulse">auto_awesome</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-headline text-sm md:text-base font-medium text-on-surface tracking-tight">
                AI Soundscape Studio
              </h3>
              <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-mono">
                Gemini LLM
              </span>
            </div>
            <p className="text-[11px] text-on-surface-variant/60 font-light hidden sm:block">
              Describe any mood, setting, or vibe to synthesize a personalized ambient mix
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(prev => !prev)}
          className="text-on-surface-variant/40 hover:text-on-surface p-1 text-xs font-label uppercase tracking-wider flex items-center gap-1 transition-colors"
          title={isExpanded ? 'Collapse' : 'Expand'}
        >
          <span className="material-symbols-outlined text-lg">
            {isExpanded ? 'expand_less' : 'expand_more'}
          </span>
        </button>
      </div>

      {isExpanded && (
        <div className="flex flex-col gap-3">
          {/* Prompt Form */}
          <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-primary/50 text-base pointer-events-none">
                graphic_eq
              </span>
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your atmosphere (e.g., 'Rain on tent with distant thunder and wind chimes')..."
                disabled={isGenerating}
                className="w-full bg-white/5 border border-white/10 focus:border-primary/50 rounded-xl pl-10 pr-4 py-2.5 text-xs md:text-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none transition-all focus:ring-1 focus:ring-primary/40 disabled:opacity-50"
              />
            </div>
            <button
              type="submit"
              disabled={isGenerating || !prompt.trim()}
              className="px-4 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-label font-medium uppercase tracking-wider shadow-[0_0_15px_rgba(47,217,244,0.3)] hover:shadow-[0_0_25px_rgba(47,217,244,0.5)] transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1.5 shrink-0"
            >
              {isGenerating ? (
                <>
                  <span className="material-symbols-outlined text-base animate-spin">refresh</span>
                  <span className="hidden sm:inline">Mixing...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">magic_button</span>
                  <span className="hidden sm:inline">Create Mix</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Inspiration Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 track-list-scroll pt-0.5">
            <span className="text-[10px] uppercase tracking-widest text-on-surface-variant/40 font-mono shrink-0 mr-1">
              Ideas:
            </span>
            {INSPIRATION_CHIPS.map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={() => handleChipClick(chip.prompt)}
                disabled={isGenerating}
                className="px-2.5 py-1 rounded-full text-[11px] bg-white/[0.04] hover:bg-primary/10 text-on-surface-variant hover:text-primary border border-white/5 hover:border-primary/20 transition-all shrink-0 whitespace-nowrap disabled:opacity-50"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
              <span className="material-symbols-outlined text-base">error_outline</span>
              <span className="flex-1">{errorMessage}</span>
              <button
                onClick={() => setErrorMessage('')}
                className="text-red-400 hover:text-red-200"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
          )}

          {/* Generated Result Showcase */}
          {lastGenerated && !errorMessage && (
            <div className="mt-1 p-3 rounded-xl bg-primary/[0.06] border border-primary/20 flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-base">check_circle</span>
                  <span className="text-xs font-medium text-primary tracking-wide">
                    {lastGenerated.title}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {canRevert && onRevertMix && (
                    <button
                      onClick={onRevertMix}
                      className="text-[11px] text-on-surface-variant/50 hover:text-on-surface underline transition-colors"
                    >
                      Revert mix
                    </button>
                  )}
                  <button
                    onClick={() => handleGenerate(lastGenerated.promptUsed)}
                    disabled={isGenerating}
                    className="text-[11px] text-primary/70 hover:text-primary flex items-center gap-1 transition-colors"
                    title="Generate another variation"
                  >
                    <span className="material-symbols-outlined text-xs">sync</span>
                    Remix
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-on-surface-variant/80 font-light leading-relaxed italic">
                &ldquo;{lastGenerated.description}&rdquo;
              </p>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {lastGenerated.active_sounds.map((soundId) => (
                  <span
                    key={soundId}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-on-surface-variant/90 font-mono"
                  >
                    {soundId.replace(/_/g, ' ')} ({lastGenerated.volumes[soundId]}%)
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
