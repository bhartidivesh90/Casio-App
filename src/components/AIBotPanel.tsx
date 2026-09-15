import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import {
  Bot,
  Send,
  Sparkles,
  ArrowDownToLine,
  Trash2,
  Copy,
  Check,
  Calculator,
  HelpCircle,
  Lightbulb,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { ChatMessage, AngleUnit } from '../types';

interface AIBotPanelProps {
  currentExpression: string;
  currentResult: string;
  angleUnit: AngleUnit;
  memory: number;
  onInsertToCalc: (expression: string) => void;
  isOpen: boolean;
  onToggleOpen?: () => void;
}

const QUICK_PROMPTS = [
  'Explain the current calculator screen',
  'How to compute standard deviation on Casio?',
  'Solve quadratic: 2x² + 5x - 3 = 0',
  'Find derivative of f(x) = x³ · sin(x)',
  'Explain S⇔D button and exact radicals',
  'Convert 45° 30\' 15" to decimal degrees',
];

export const AIBotPanel: React.FC<AIBotPanelProps> = ({
  currentExpression,
  currentResult,
  angleUnit,
  memory,
  onInsertToCalc,
  isOpen,
  onToggleOpen,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `### Welcome to your Casio AI Math Assistant! 🎓
I'm directly paired with your **Casio Scientific Calculator**.

Here is what I can do:
- **Explain calculations** on your screen step-by-step
- **Solve complex math** (calculus, trigonometry, algebra, statistics)
- **Give Casio keystroke guides** for any formula or scientific mode
- **Send expressions to your calculator** with one click!

Try typing a question below or click **"Explain Current Display"**!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Parse [CALC_INSERT: expression] tag from assistant message
  const extractInsertableExpr = (text: string): { cleanText: string; insertExpr: string | null } => {
    const match = text.match(/\[CALC_INSERT:\s*([^\]]+)\]/);
    if (match) {
      const cleanText = text.replace(/\[CALC_INSERT:\s*[^\]]+\]/, '').trim();
      return { cleanText, insertExpr: match[1].trim() };
    }
    return { cleanText: text, insertExpr: null };
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const messageText = (customPrompt || input).trim();
    if (!messageText || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          calcContext: {
            expression: currentExpression || '0',
            result: currentResult || '0',
            angleUnit,
            memory,
          },
        }),
      });

      const data = await response.json();
      const reply = data.reply || 'No response returned from AI.';
      const { cleanText, insertExpr } = extractInsertableExpr(reply);

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: cleanText,
        suggestedExpression: insertExpr || undefined,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      console.error('AI chat failed:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '⚠️ Failed to connect to the AI service. Please verify your connection or try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExplainDisplay = async () => {
    if (!currentExpression && !currentResult) {
      handleSendMessage('Explain how the Casio scientific calculator works and its key features.');
      return;
    }

    const prompt = `Please explain the current calculation on my Casio screen:
Formula: "${currentExpression || '0'}"
Result: "${currentResult || '0'}"
Angle Mode: ${angleUnit}`;

    handleSendMessage(prompt);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'cleared',
        role: 'assistant',
        content: 'Chat history cleared. How can I help you with your Casio calculations today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/95 text-slate-100 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md">
      {/* Bot Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800/80 border-b border-slate-700/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Bot size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white font-sans tracking-tight">
                Casio AI Copilot
              </h2>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-semibold px-1.5 py-0.2 rounded border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                Live Sync
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Math Solver & fx-991EX Guide
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            id="clear-ai-chat-btn"
            onClick={handleClearHistory}
            title="Clear Chat History"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <Trash2 size={15} />
          </button>
          {onToggleOpen && (
            <button
              onClick={onToggleOpen}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <Minimize2 size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Live Calculator Synced Status Bar */}
      <div className="px-4 py-2 bg-slate-800/40 border-b border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 overflow-hidden">
          <Calculator size={14} className="text-cyan-400 shrink-0" />
          <div className="flex items-center gap-1.5 text-[11px] text-slate-300 truncate">
            <span className="text-slate-400 font-mono">LCD:</span>
            <span className="font-mono font-semibold text-white truncate max-w-[120px] sm:max-w-[180px]">
              {currentExpression || '0'}
            </span>
            <span className="text-slate-400">=</span>
            <span className="font-mono text-cyan-300 font-bold">{currentResult || '0'}</span>
            <span className="text-[10px] px-1 py-0.2 bg-slate-700 rounded text-slate-300 font-mono">
              {angleUnit}
            </span>
          </div>
        </div>

        <button
          id="ai-explain-screen-top-btn"
          onClick={handleExplainDisplay}
          disabled={isLoading}
          className="shrink-0 flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 rounded-md transition-all shadow-sm active:scale-95 disabled:opacity-50"
        >
          <Sparkles size={12} className="text-amber-400" />
          <span>Explain Screen</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent text-sm">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} group`}
            >
              <div
                className={`max-w-[92%] sm:max-w-[85%] rounded-2xl p-3.5 shadow-md ${
                  isUser
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-bl-sm'
                }`}
              >
                {/* Message Header */}
                <div className="flex items-center justify-between text-[11px] opacity-60 mb-1 gap-4">
                  <span className="font-semibold flex items-center gap-1">
                    {isUser ? 'You' : 'Casio AI Bot'}
                  </span>
                  <span>{msg.timestamp}</span>
                </div>

                {/* Message Content with Markdown */}
                <div className="leading-relaxed text-xs sm:text-sm font-sans space-y-2 break-words">
                  {isUser ? (
                    <p>{msg.content}</p>
                  ) : (
                    <div className="prose prose-invert prose-xs sm:prose-sm max-w-none prose-p:my-1 prose-headings:my-1.5 prose-pre:my-1 prose-ul:my-1 prose-li:my-0.5">
                      <Markdown>{msg.content}</Markdown>
                    </div>
                  )}
                </div>

                {/* Suggested Expression Action Card */}
                {msg.suggestedExpression && (
                  <div className="mt-3 pt-2.5 border-t border-slate-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-slate-900/60 p-2 rounded-xl">
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      <Calculator size={13} className="text-cyan-400 shrink-0" />
                      <span className="text-[11px] text-slate-400">Expression:</span>
                      <code className="text-xs font-mono font-bold text-cyan-300 bg-black/40 px-1.5 py-0.5 rounded">
                        {msg.suggestedExpression}
                      </code>
                    </div>

                    <button
                      id={`insert-calc-${msg.id}`}
                      onClick={() => onInsertToCalc(msg.suggestedExpression!)}
                      className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg shadow-md transition-all active:scale-95 whitespace-nowrap"
                    >
                      <ArrowDownToLine size={13} />
                      <span>Insert into Casio</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Message Actions */}
              {!isUser && (
                <div className="flex items-center gap-2 mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleCopy(msg.id, msg.content)}
                    className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {copiedId === msg.id ? (
                      <>
                        <Check size={11} className="text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={11} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* Loading / Typing Indicator */}
        {isLoading && (
          <div className="flex items-center gap-2 p-3 bg-slate-800/60 border border-slate-700/40 rounded-2xl max-w-[200px]">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]" />
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
            <span className="text-xs text-slate-400 font-sans ml-1">Solving math...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Carousel */}
      <div className="px-3 py-1.5 bg-slate-900/80 border-t border-slate-800/80 overflow-x-auto whitespace-nowrap scrollbar-none flex items-center gap-1.5">
        <Lightbulb size={13} className="text-amber-400 shrink-0 ml-1" />
        {QUICK_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            disabled={isLoading}
            className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors shadow-sm disabled:opacity-50 shrink-0"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-3 bg-slate-800/90 border-t border-slate-700/80">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            id="ai-math-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask math question, physics, or Casio instructions..."
            disabled={isLoading}
            className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all font-sans"
          />
          <button
            id="send-ai-btn"
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2 sm:px-3.5 sm:py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-semibold text-xs sm:text-sm"
          >
            <Send size={15} />
            <span className="hidden sm:inline">Ask AI</span>
          </button>
        </form>
      </div>
    </div>
  );
};
