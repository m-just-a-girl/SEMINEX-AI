import React, { useState } from 'react';
import { Bot, Send, Sparkles, User, HelpCircle, ShieldAlert } from 'lucide-react';
import { TransparencyBadge } from '../components/TransparencyBadge';
import { askCopilot } from '../api/client';

export const CopilotPage: React.FC = () => {
  const [messages, setMessages] = useState<
    Array<{ sender: 'user' | 'bot'; text: string; category?: string; source?: string }>
  >([
    {
      sender: 'bot',
      text: (
        "Welcome to the **SEMI NEX AI Copilot**. I am an intelligent assistant trained on semiconductor quality engineering, wafer map defect topologies (`Center`, `Donut`, `Edge-Ring`, `Loc`, `Scratch`, etc.), and the WM-811K benchmark dataset.\n\n" +
        "You can ask me questions regarding dataset statistics, defect physical root causes, human review triage, or model explainability."
      ),
      category: 'System Initialization',
      source: 'Semiconductor Quality Intelligence Core',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  const samplePrompts = [
    'Which pattern is most common in the loaded dataset?',
    'What does an Edge-Ring pattern mean in manufacturing?',
    'What is the difference between Center and Donut?',
    'How many labelled maps are available?',
    'Which predictions require human review?',
    'What are the limitations of this model?',
  ];

  const handleSend = async (queryText?: string) => {
    const q = queryText || inputValue;
    if (!q.trim()) return;

    const newMsgs = [...messages, { sender: 'user' as const, text: q }];
    setMessages(newMsgs);
    setInputValue('');
    setLoading(true);

    try {
      const res = await askCopilot(q);
      const botText = res.answer || res.response || (typeof res === 'string' ? res : 'No response generated.');
      setMessages([
        ...newMsgs,
        {
          sender: 'bot',
          text: botText,
          category: res.category || (res.associated_pattern ? `Defect: ${res.associated_pattern}` : undefined),
          source: res.source || 'SEMI NEX AI Engine',
        },
      ]);
    } catch (err) {
      setMessages([
        ...newMsgs,
        {
          sender: 'bot',
          text: 'Error processing copilot query. Please ensure backend service is active.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
              Stage 11 • Grounded AI Engineering Assistant
            </span>
            <TransparencyBadge type="DECISION SUPPORT" size="sm" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">AI Semiconductor Copilot</h2>
          <p className="text-xs font-mono text-slate-400">
            Domain assistant answering questions grounded in live dataset records, metrics & root causes
          </p>
        </div>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="space-y-2">
        <span className="text-xs font-mono text-slate-400">Suggested Prompts:</span>
        <div className="flex flex-wrap gap-2">
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              className="px-3 py-1 rounded-xl bg-navy-900 hover:bg-cyan-950 border border-slate-800 hover:border-cyan-500/40 text-xs text-slate-300 hover:text-cyan-300 font-mono transition-all"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="p-6 rounded-2xl bg-navy-900/70 border border-slate-800 h-[480px] flex flex-col justify-between">
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scroll">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 text-xs leading-relaxed ${
                m.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {m.sender === 'bot' && (
                <div className="w-8 h-8 rounded-full bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`p-4 rounded-2xl max-w-2xl whitespace-pre-line ${
                  m.sender === 'user'
                    ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/30'
                    : 'bg-navy-950 border border-slate-800 text-slate-200'
                }`}
              >
                {m.text}
                {m.source && (
                  <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>Category: {m.category}</span>
                    <span className="text-cyan-400">{m.source}</span>
                  </div>
                )}
              </div>
              {m.sender === 'user' && (
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 animate-pulse">
              <Bot className="w-4 h-4" />
              <span>Analyzing semiconductor knowledge base...</span>
            </div>
          )}
        </div>

        {/* Query Input */}
        <div className="pt-4 border-t border-slate-800/80 flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask a question about wafer patterns, WM-811K data, or fab root causes..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-navy-950 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !inputValue.trim()}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-electric-600 hover:from-cyan-400 text-slate-950 font-bold text-xs uppercase transition-all shadow-cyan-glow disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
