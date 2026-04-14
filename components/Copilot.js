"use client";

import { useChat } from '@ai-sdk/react';
import { useState, useRef, useEffect } from 'react';

export default function Copilot({ applyMixerLevels }) {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    onToolCall({ toolCall }) {
      if (toolCall.toolName === 'setMixerLevels') {
        applyMixerLevels(toolCall.args.volumes);
      }
    },
  });
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="w-96 h-[500px] bg-slate-900/95 backdrop-blur-3xl border border-white/10 rounded-3xl mb-6 flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5">
          <div className="bg-primary/10 p-5 border-b border-white/5 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-xl">auto_awesome</span>
              <span className="font-headline font-semibold text-primary">Audio Copilot</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-on-surface-variant hover:text-white transition-colors">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 relative">
            {messages.length === 0 && (
              <div className="text-sm text-on-surface-variant text-center my-auto px-6 tracking-wide leading-relaxed">
                Tell me what you're doing or how you're feeling, and I'll generate the perfect soundscape for you.
              </div>
            )}
            {messages.map(m => (
              <div key={m.id} className={`max-w-[90%] rounded-2xl p-4 text-sm leading-relaxed ${m.role === 'user' ? 'bg-primary/20 text-on-surface ml-auto rounded-br-sm' : 'bg-surface-container text-on-surface-variant mr-auto rounded-bl-sm border border-white/5'}`}>
                {m.content}
                {m.toolInvocations?.map(tool => (
                    <div key={tool.toolCallId} className="mt-3 p-3 bg-black/40 rounded-xl text-xs px-3 py-2 text-primary flex items-center gap-2 border border-primary/20">
                        <span className="material-symbols-outlined text-[14px]">tune</span>
                        <span className="font-medium tracking-wide pt-[1px]">Applying Mix...</span>
                    </div>
                ))}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="p-4 bg-surface-container border-t border-white/5 flex gap-3">
            <input
              className="flex-1 bg-background rounded-full px-5 text-sm focus:outline-none border border-white/5 focus:border-primary/50 transition-colors py-3"
              value={input}
              placeholder="E.g., I'm studying at night..."
              onChange={handleInputChange}
            />
            <button disabled={isLoading} type="submit" className="w-11 h-11 shrink-0 rounded-full bg-primary flex items-center justify-center text-black disabled:opacity-50 hover:bg-primary-fixed transition-colors">
              <span className="material-symbols-outlined text-[18px]">send</span>
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-primary rounded-full shadow-[0_0_20px_rgba(47,217,244,0.3)] hover:shadow-[0_0_30px_rgba(47,217,244,0.5)] flex items-center justify-center text-black transition-all hover:scale-105 active:scale-95 z-50"
      >
        <span className="material-symbols-outlined text-3xl">{isOpen ? 'keyboard_arrow_down' : 'auto_awesome'}</span>
      </button>
    </div>
  );
}
