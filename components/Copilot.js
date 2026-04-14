"use client";

import { useChat } from '@ai-sdk/react';
import { useState, useRef, useEffect } from 'react';

export default function Copilot({ applyMixerLevels }) {
  const [isOpen, setIsOpen] = useState(false);
  const [appliedToolIds, setAppliedToolIds] = useState(new Set());

  const { messages, input, handleInputChange, handleSubmit, isLoading, addToolResult } = useChat({
    maxSteps: 3,
    async onToolCall({ toolCall }) {
      if (toolCall.toolName === 'setMixerLevels') {
        applyMixerLevels(toolCall.args.volumes);
        // Must return a result to complete the tool cycle in ai@6
        return 'Mix applied successfully.';
      }
    },
  });
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fallback: also watch messages for tool invocations in case onToolCall doesn't fire
  useEffect(() => {
    messages.forEach(m => {
      if (m.role === 'assistant' && m.toolInvocations) {
        m.toolInvocations.forEach(inv => {
          if (inv.toolName === 'setMixerLevels' && inv.state === 'call' && !appliedToolIds.has(inv.toolCallId)) {
            applyMixerLevels(inv.args.volumes);
            setAppliedToolIds(prev => new Set([...prev, inv.toolCallId]));
            // Provide the result so the AI can continue
            addToolResult({ toolCallId: inv.toolCallId, result: 'Mix applied.' });
          }
        });
      }
    });
  }, [messages]);

  const displayMessages = messages.filter(m => m.role === 'user' || (m.role === 'assistant' && m.content));

  return (
    <div className="fixed bottom-24 md:bottom-6 right-4 md:right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="w-80 md:w-96 h-[460px] md:h-[500px] bg-slate-900/95 backdrop-blur-3xl border border-white/10 rounded-3xl mb-4 flex flex-col shadow-2xl overflow-hidden">
          <div className="bg-primary/10 p-4 md:p-5 border-b border-white/5 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-xl">auto_awesome</span>
              <div>
                <span className="font-headline font-semibold text-primary block text-sm">Audio Copilot</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest">Powered by Gemini</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-on-surface-variant hover:text-white transition-colors">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 md:p-5 flex flex-col gap-4 relative">
            {displayMessages.length === 0 && (
              <div className="flex flex-col gap-3 my-auto">
                <p className="text-sm text-on-surface-variant text-center px-4 tracking-wide leading-relaxed">
                  Tell me your mood or activity and I'll build the perfect soundscape.
                </p>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {["Deep focus mode", "Cozy rainy night", "Forest walk", "Coffee shop vibe"].map(prompt => (
                    <button
                      key={prompt}
                      onClick={() => { handleSubmit(null, { data: { input: prompt } }); }}
                      className="text-xs p-2 rounded-xl bg-surface-container border border-white/5 text-on-surface-variant hover:bg-surface-bright hover:text-on-surface transition-all text-left px-3"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {displayMessages.map(m => (
              <div key={m.id} className={`max-w-[90%] rounded-2xl p-3 text-sm leading-relaxed ${m.role === 'user' ? 'bg-primary/20 text-on-surface ml-auto rounded-br-sm' : 'bg-surface-container text-on-surface-variant mr-auto rounded-bl-sm border border-white/5'}`}>
                {m.content}
              </div>
            ))}
            {/* Show "applying mix" indicator if there are pending tool calls */}
            {messages.some(m => m.toolInvocations?.some(t => t.toolName === 'setMixerLevels')) && (
              <div className="self-start mt-1 p-2 px-3 bg-black/40 rounded-xl text-xs text-primary flex items-center gap-2 border border-primary/20">
                  <span className="material-symbols-outlined text-[14px]">tune</span>
                  <span className="font-medium tracking-wide">Mix applied ✓</span>
              </div>
            )}
            {isLoading && (
              <div className="self-start flex gap-1 p-3">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{animationDelay: '0ms'}}/>
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{animationDelay: '150ms'}}/>
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{animationDelay: '300ms'}}/>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="p-3 md:p-4 bg-surface-container border-t border-white/5 flex gap-3">
            <input
              className="flex-1 bg-background rounded-full px-4 text-sm focus:outline-none border border-white/5 focus:border-primary/50 transition-colors py-2.5"
              value={input}
              placeholder="E.g., Help me focus..."
              onChange={handleInputChange}
            />
            <button disabled={isLoading} type="submit" className="w-10 h-10 shrink-0 rounded-full bg-primary flex items-center justify-center text-black disabled:opacity-50 hover:bg-primary-fixed transition-colors">
              <span className="material-symbols-outlined text-[16px]">send</span>
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 md:w-16 md:h-16 bg-primary rounded-full shadow-[0_0_20px_rgba(47,217,244,0.3)] hover:shadow-[0_0_30px_rgba(47,217,244,0.5)] flex items-center justify-center text-black transition-all hover:scale-105 active:scale-95 z-50"
      >
        <span className="material-symbols-outlined text-2xl md:text-3xl">{isOpen ? 'keyboard_arrow_down' : 'auto_awesome'}</span>
      </button>
    </div>
  );
}
