"use client";

import { useChat } from '@ai-sdk/react';
import { useState, useRef, useEffect } from 'react';

const QUICK_PROMPTS = [
  { label: "Deep Focus", icon: "psychology", prompt: "I need deep focus for coding or studying. Give me something that blocks distractions completely." },
  { label: "Cozy Rain Night", icon: "nights_stay", prompt: "A cozy, rainy night at home. I want warmth and the sound of rain on the windows." },
  { label: "Morning Energy", icon: "wb_sunny", prompt: "Fresh morning energy. I just woke up and need to feel alive and motivated." },
  { label: "Coffee Shop", icon: "local_cafe", prompt: "I want to feel like I'm working in a cozy, busy coffee shop." },
  { label: "Deep Sleep", icon: "bedtime", prompt: "Help me fall into a deep, peaceful sleep. Soft and calming." },
  { label: "Forest Walk", icon: "forest", prompt: "I want to feel like I'm walking through a peaceful summer forest." },
  { label: "Stormy Mood", icon: "thunderstorm", prompt: "An intense storm. Wind, rain, dramatic atmosphere." },
  { label: "Stress Relief", icon: "self_improvement", prompt: "I'm stressed and anxious. Help me calm down with something grounding." },
  { label: "Meditation", icon: "spa", prompt: "Deep meditation session. Totally calm, spiritual, and still." },
  { label: "City Hustle", icon: "location_city", prompt: "The busy energy of a big city. I want to feel the urban pulse." },
  { label: "Study Music", icon: "menu_book", prompt: "Background for long hours of studying. Low stimulation, high concentration." },
  { label: "Late Night Vibe", icon: "mode_night", prompt: "Late night creative session. Atmospheric, a bit mysterious, creative." },
];

export default function Copilot({ applyMixerLevels }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mixApplied, setMixApplied] = useState(false);

  const { messages, input, handleInputChange, handleSubmit, append, isLoading } = useChat({
    maxSteps: 3,
    // In @ai-sdk/react@3 — returning a value from onToolCall completes the tool cycle
    async onToolCall({ toolCall }) {
      if (toolCall.toolName === 'setMixerLevels') {
        try {
          applyMixerLevels(toolCall.args.volumes);
          setMixApplied(true);
        } catch (e) {
          console.error('Failed to apply mixer levels:', e);
        }
        return 'Mix applied successfully.';
      }
    },
  });

  const messagesEndRef = useRef(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Reset mixApplied indicator when a new conversation starts
  useEffect(() => {
    if (messages.length === 0) setMixApplied(false);
  }, [messages]);

  const handleQuickPrompt = (promptText) => {
    setMixApplied(false);
    append({ role: 'user', content: promptText });
  };

  const visibleMessages = messages.filter(
    m => m.role === 'user' || (m.role === 'assistant' && m.content)
  );
  const hasMessages = visibleMessages.length > 0;

  return (
    <div className="fixed bottom-24 md:bottom-6 right-4 md:right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div
          className="w-80 md:w-96 bg-slate-900/98 backdrop-blur-3xl border border-white/10 rounded-3xl mb-4 flex flex-col shadow-2xl overflow-hidden"
          style={{ height: '520px' }}
        >
          {/* Header */}
          <div className="bg-primary/10 p-4 border-b border-white/5 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-xl">auto_awesome</span>
              <div>
                <span className="font-headline font-semibold text-primary block text-sm">Audio Copilot</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest">Powered by Gemini</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-on-surface-variant hover:text-white transition-colors p-1"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-h-0">
            {!hasMessages ? (
              /* Quick-prompt grid shown when no conversation yet */
              <div className="flex flex-col gap-3">
                <p className="text-xs text-on-surface-variant text-center px-2 tracking-wide leading-relaxed mt-1">
                  Pick a vibe or describe your mood ↓
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {QUICK_PROMPTS.map(({ label, icon, prompt }) => (
                    <button
                      key={label}
                      onClick={() => handleQuickPrompt(prompt)}
                      disabled={isLoading}
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-container border border-white/5 text-on-surface-variant hover:bg-surface-bright hover:text-primary hover:border-primary/30 transition-all text-left group disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-[16px] text-primary/70 group-hover:text-primary shrink-0">
                        {icon}
                      </span>
                      <span className="text-xs font-medium leading-tight">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Chat messages */
              <>
                {visibleMessages.map(m => (
                  <div
                    key={m.id}
                    className={`max-w-[90%] rounded-2xl p-3 text-sm leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-primary/20 text-on-surface ml-auto rounded-br-sm'
                        : 'bg-surface-container text-on-surface-variant mr-auto rounded-bl-sm border border-white/5'
                    }`}
                  >
                    {m.content}
                  </div>
                ))}

                {mixApplied && (
                  <div className="self-start p-2 px-3 bg-black/40 rounded-xl text-xs text-primary flex items-center gap-2 border border-primary/20">
                    <span className="material-symbols-outlined text-[14px]">tune</span>
                    <span className="font-medium tracking-wide">Mix applied ✓</span>
                  </div>
                )}

                {isLoading && (
                  <div className="self-start flex gap-1 px-3 py-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                )}

                {/* Horizontal scrollable chips after first message */}
                {!isLoading && (
                  <div
                    className="flex gap-2 overflow-x-auto pb-1 mt-1 shrink-0"
                    style={{ scrollbarWidth: 'none' }}
                  >
                    {QUICK_PROMPTS.slice(0, 6).map(({ label, icon, prompt }) => (
                      <button
                        key={label}
                        onClick={() => handleQuickPrompt(prompt)}
                        disabled={isLoading}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container border border-white/5 text-on-surface-variant hover:border-primary/30 hover:text-primary transition-all text-xs whitespace-nowrap shrink-0 disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-[12px]">{icon}</span>
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Text Input */}
          <form
            onSubmit={handleSubmit}
            className="p-3 bg-surface-container border-t border-white/5 flex gap-2 shrink-0"
          >
            <input
              className="flex-1 bg-background rounded-full px-4 text-sm focus:outline-none border border-white/5 focus:border-primary/50 transition-colors py-2.5"
              value={input}
              placeholder="Describe your mood or activity..."
              onChange={handleInputChange}
              disabled={isLoading}
            />
            <button
              disabled={isLoading || !input.trim()}
              type="submit"
              className="w-10 h-10 shrink-0 rounded-full bg-primary flex items-center justify-center text-black disabled:opacity-40 hover:bg-primary-fixed transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">send</span>
            </button>
          </form>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setIsOpen(o => !o)}
        className="w-14 h-14 md:w-16 md:h-16 bg-primary rounded-full shadow-[0_0_20px_rgba(47,217,244,0.3)] hover:shadow-[0_0_30px_rgba(47,217,244,0.5)] flex items-center justify-center text-black transition-all hover:scale-105 active:scale-95 z-50 relative"
      >
        {mixApplied && !isOpen && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-900" />
        )}
        <span className="material-symbols-outlined text-2xl md:text-3xl">
          {isOpen ? 'keyboard_arrow_down' : 'auto_awesome'}
        </span>
      </button>
    </div>
  );
}
