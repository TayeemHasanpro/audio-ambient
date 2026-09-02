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

export default function AiSoundscapePrompt({
  onApplyMix,
  activeSoundCount = 0,
  onRevertMix,
  canRevert = false,
  volumes = {},
  pans = {},
  activeSoundIds = []
}) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);

  // YouTube SEO & Ledger States
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);
  const [metadataResult, setMetadataResult] = useState(null);
  const [copiedSection, setCopiedSection] = useState('');

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

      // Clear any prior metadata so user can fetch fresh SEO
      setMetadataResult(null);

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

  // Fetch YouTube SEO & Authorship Ledger
  const handleOpenLedger = async () => {
    setIsLedgerOpen(true);
    if (metadataResult) return; // already loaded

    setIsFetchingMetadata(true);
    try {
      const currentTitle = lastGenerated?.title || 'Custom Studio Ambient';
      const currentDesc = lastGenerated?.description || 'Acoustic multi-track sanctuary';
      const activeVols = Object.keys(volumes).length > 0 ? volumes : (lastGenerated?.volumes || {});

      const res = await fetch('/api/metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: currentTitle,
          description: currentDesc,
          volumes: activeVols,
          pans: pans || {},
          durationMinutes: 60
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate metadata');
      setMetadataResult(data);
    } catch (err) {
      console.error('Failed to generate YouTube SEO metadata:', err);
    } finally {
      setIsFetchingMetadata(false);
    }
  };

  const copyToClipboard = (text, sectionKey) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionKey);
    setTimeout(() => setCopiedSection(''), 2500);
  };

  const downloadLedgerTxt = () => {
    if (!metadataResult?.stemsLedger) return;
    const blob = new Blob([metadataResult.stemsLedger], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(lastGenerated?.title || 'AudioAmbient').replace(/[^a-zA-Z0-9]/g, '_')}_Authorship_Ledger.txt`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }, 100);
  };

  const currentCliCommand = `node scripts/render-ambient.js --prompt "${lastGenerated?.promptUsed || 'Cozy rainy cafe'}" --duration 60 --out output/${(lastGenerated?.title || 'ambient_mix').replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}.wav --ledger`;

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

        <div className="flex items-center gap-2">
          {activeSoundCount > 0 && (
            <button
              onClick={handleOpenLedger}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 text-xs font-label uppercase tracking-wider transition-all"
              title="YouTube SEO titles, description & Authorship Ledger"
            >
              <span className="material-symbols-outlined text-sm">smart_display</span>
              <span className="hidden sm:inline">YouTube Suite</span>
            </button>
          )}

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
                  <button
                    onClick={handleOpenLedger}
                    className="text-[11px] text-primary hover:underline flex items-center gap-1 transition-colors"
                    title="Get YouTube Titles, Description & Authorship Ledger"
                  >
                    <span className="material-symbols-outlined text-xs">smart_display</span>
                    YouTube SEO
                  </button>
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

      {/* YouTube SEO & Transformative Authorship Ledger Modal */}
      {isLedgerOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-2xl max-h-[85vh] rounded-3xl p-6 md:p-8 flex flex-col gap-4 border border-primary/30 relative overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center border border-primary/30">
                  <span className="material-symbols-outlined text-xl">smart_display</span>
                </div>
                <div>
                  <h3 className="font-headline text-lg text-on-surface font-light">
                    YouTube Production & Authorship Suite
                  </h3>
                  <p className="text-xs text-on-surface-variant/60">
                    High-CTR titles, timestamps, and Transformative Authorship Ledger to protect monetization
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsLedgerOpen(false)}
                className="text-on-surface-variant/40 hover:text-on-surface p-1 rounded-lg"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto track-list-scroll pr-1 flex flex-col gap-5 text-xs text-on-surface">
              {isFetchingMetadata ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <span className="material-symbols-outlined text-3xl text-primary animate-spin">refresh</span>
                  <p className="text-on-surface-variant text-sm">Synthesizing YouTube metadata & authorship manifest...</p>
                </div>
              ) : metadataResult ? (
                <>
                  {/* Section 1: YouTube Title Candidates */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="font-label uppercase tracking-widest text-[11px] text-primary">
                        Recommended YouTube Titles (High CTR)
                      </span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {metadataResult.youtubeTitles?.map((t, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-primary/30 transition-all group"
                        >
                          <span className="text-xs text-on-surface leading-snug">{t}</span>
                          <button
                            onClick={() => copyToClipboard(t, `title-${idx}`)}
                            className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-[10px] font-mono shrink-0 transition-colors"
                          >
                            {copiedSection === `title-${idx}` ? 'Copied ✓' : 'Copy'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section 2: YouTube Description & Chapters */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="font-label uppercase tracking-widest text-[11px] text-primary">
                        SEO Description & Chapters
                      </span>
                      <button
                        onClick={() => copyToClipboard(metadataResult.youtubeDescription, 'desc')}
                        className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-[10px] font-mono transition-colors"
                      >
                        {copiedSection === 'desc' ? 'Copied ✓' : 'Copy Description'}
                      </button>
                    </div>
                    <textarea
                      readOnly
                      rows={6}
                      value={metadataResult.youtubeDescription}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-3 text-[11px] text-on-surface-variant font-mono leading-relaxed outline-none focus:border-primary/40 resize-none"
                    />
                  </div>

                  {/* Section 3: Transformative Authorship Stems Ledger */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-label uppercase tracking-widest text-[11px] text-primary block">
                          Transformative Authorship Ledger (Monetization Defense)
                        </span>
                        <span className="text-[10px] text-on-surface-variant/50">
                          Proof of multi-stem acoustic spatialization against YouTube &ldquo;reused content&rdquo; flags
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={downloadLedgerTxt}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-on-surface text-[10px] font-mono transition-colors"
                        >
                          Download .txt
                        </button>
                        <button
                          onClick={() => copyToClipboard(metadataResult.stemsLedger, 'ledger')}
                          className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-[10px] font-mono transition-colors"
                        >
                          {copiedSection === 'ledger' ? 'Copied ✓' : 'Copy Ledger'}
                        </button>
                      </div>
                    </div>
                    <textarea
                      readOnly
                      rows={8}
                      value={metadataResult.stemsLedger}
                      className="w-full bg-black/40 border border-primary/20 rounded-xl p-3 text-[10px] text-primary/90 font-mono leading-tight outline-none resize-none"
                    />
                  </div>

                  {/* Section 4: Headless CLI Render Command */}
                  <div className="flex flex-col gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="flex items-center justify-between">
                      <span className="font-label uppercase tracking-wider text-[10px] text-on-surface-variant/60">
                        Headless CLI Long-Form Render Command (1-180m)
                      </span>
                      <button
                        onClick={() => copyToClipboard(currentCliCommand, 'cli')}
                        className="text-primary text-[10px] font-mono hover:underline"
                      >
                        {copiedSection === 'cli' ? 'Copied ✓' : 'Copy Command'}
                      </button>
                    </div>
                    <code className="text-[10px] text-primary/80 font-mono bg-black/30 p-2 rounded-lg break-all">
                      {currentCliCommand}
                    </code>
                  </div>
                </>
              ) : (
                <p className="text-center py-8 text-on-surface-variant/50">No metadata loaded.</p>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-white/10 pt-3 flex justify-end">
              <button
                onClick={() => setIsLedgerOpen(false)}
                className="px-5 py-2 rounded-xl bg-white/10 text-on-surface text-xs font-label uppercase tracking-wider hover:bg-white/15 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
