import React, { useState, useEffect, useCallback } from 'react';
import { CASIO_THEMES } from './data/themes';
import { CasioTheme, AngleUnit, CalculationHistoryItem } from './types';
import { CasioDisplay } from './components/CasioDisplay';
import { CasioKeypad } from './components/CasioKeypad';
import { AIBotPanel } from './components/AIBotPanel';
import { ThemeSelectorModal } from './components/ThemeSelectorModal';
import { FormulaSheetModal } from './components/FormulaSheetModal';
import { HistoryModal } from './components/HistoryModal';
import { evaluateCasioExpression, toDMS } from './utils/casioEngine';
import { playKeySound } from './utils/audio';
import {
  Palette,
  BookOpen,
  History,
  Bot,
  Calculator as CalcIcon,
  Sparkles,
  Info,
  Maximize2,
  Volume2,
  VolumeX,
} from 'lucide-react';

export default function App() {
  // Active Theme state
  const [currentTheme, setCurrentTheme] = useState<CasioTheme>(() => {
    const saved = localStorage.getItem('casio_theme_id');
    const found = CASIO_THEMES.find((t) => t.id === saved);
    return found || CASIO_THEMES[0];
  });

  // Calculator State
  const [expression, setExpression] = useState<string>('');
  const [cursorPosition, setCursorPosition] = useState<number>(0);
  const [result, setResult] = useState<string>('0');
  const [exactResult, setExactResult] = useState<string | null>(null);
  const [showingExact, setShowingExact] = useState<boolean>(false);
  const [angleUnit, setAngleUnit] = useState<AngleUnit>('DEG');
  const [isShift, setIsShift] = useState<boolean>(false);
  const [isAlpha, setIsAlpha] = useState<boolean>(false);
  const [isHyp, setIsHyp] = useState<boolean>(false);
  const [isSto, setIsSto] = useState<boolean>(false);
  const [isRcl, setIsRcl] = useState<boolean>(false);
  const [memory, setMemory] = useState<number>(0);
  const [variables, setVariables] = useState<Record<string, number>>({});
  const [ans, setAns] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [history, setHistory] = useState<CalculationHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('casio_calc_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Modals & Mobile View State
  const [showThemeModal, setShowThemeModal] = useState<boolean>(false);
  const [showFormulaModal, setShowFormulaModal] = useState<boolean>(false);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [mobileTab, setMobileTab] = useState<'calculator' | 'bot'>('calculator');
  const [aiPanelKey, setAiPanelKey] = useState<number>(0); // Trigger re-render or trigger explain

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('casio_calc_history', JSON.stringify(history.slice(0, 50)));
    } catch {
      // Ignore storage errors
    }
  }, [history]);

  // Save theme preference
  const handleSelectTheme = (theme: CasioTheme) => {
    setCurrentTheme(theme);
    localStorage.setItem('casio_theme_id', theme.id);
  };

  // Toggle Angle Mode: DEG -> RAD -> GRA -> DEG
  const handleToggleAngleUnit = useCallback(() => {
    if (soundEnabled) playKeySound('action');
    setAngleUnit((prev) => {
      if (prev === 'DEG') return 'RAD';
      if (prev === 'RAD') return 'GRA';
      return 'DEG';
    });
  }, [soundEnabled]);

  // Insert text at cursor position
  const insertAtCursor = useCallback(
    (token: string) => {
      setExpression((prev) => {
        const before = prev.slice(0, cursorPosition);
        const after = prev.slice(cursorPosition);
        return before + token + after;
      });
      setCursorPosition((prev) => prev + token.length);
    },
    [cursorPosition]
  );

  // Delete character before cursor (DEL key)
  const handleDelete = useCallback(() => {
    if (soundEnabled) playKeySound('action');
    if (cursorPosition === 0 || !expression) return;

    // Check multi-character tokens like "sin(", "cos(", "tan(", "log(", "ln(", "√( ", "×10^", "Ans"
    const before = expression.slice(0, cursorPosition);
    const after = expression.slice(cursorPosition);

    const tokens = [
      'sin⁻¹(', 'cos⁻¹(', 'tan⁻¹(',
      'sinh⁻¹(', 'cosh⁻¹(', 'tanh⁻¹(',
      'sinh(', 'cosh(', 'tanh(',
      'sin(', 'cos(', 'tan(',
      'log(', 'ln(', '√( ', '∛( ', '√(', '∛(',
      '×10^', 'Ans', 'Ran#', 'Rec(', 'Pol(', 'Rnd(',
      ' P ', ' C '
    ];

    let deleteLength = 1;
    for (const tok of tokens) {
      if (before.endsWith(tok)) {
        deleteLength = tok.length;
        break;
      }
    }

    setExpression(before.slice(0, -deleteLength) + after);
    setCursorPosition(Math.max(0, cursorPosition - deleteLength));
  }, [cursorPosition, expression, soundEnabled]);

  // Clear expression (AC key)
  const handleClear = useCallback(() => {
    if (soundEnabled) playKeySound('action');
    setExpression('');
    setCursorPosition(0);
    setResult('0');
    setExactResult(null);
    setShowingExact(false);
    setIsShift(false);
    setIsAlpha(false);
    setIsHyp(false);
    setIsSto(false);
    setIsRcl(false);
    setHistoryIndex(-1);
  }, [soundEnabled]);

  // Evaluate Expression (= key)
  const handleEvaluate = useCallback(() => {
    if (soundEnabled) playKeySound('equals');
    if (!expression.trim()) return;

    try {
      const evalRes = evaluateCasioExpression(expression, angleUnit, ans, variables);
      setResult(evalRes.formatted);
      setExactResult(evalRes.exact);
      setShowingExact(Boolean(evalRes.exact));
      setAns(evalRes.result);

      // Add to calculation history
      const newItem: CalculationHistoryItem = {
        id: Date.now().toString(),
        expression,
        result: evalRes.formatted,
        exactResult: evalRes.exact || undefined,
        angleUnit,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setHistory((prev) => [newItem, ...prev]);
      setHistoryIndex(-1);
    } catch (err: any) {
      if (soundEnabled) playKeySound('beep');
      setResult(err.message || 'Math ERROR');
      setExactResult(null);
    } finally {
      setIsShift(false);
      setIsAlpha(false);
    }
  }, [expression, angleUnit, ans, variables, soundEnabled]);

  // Replay cursor navigation (◀ and ▶)
  const handleMoveCursor = useCallback(
    (direction: -1 | 1) => {
      if (soundEnabled) playKeySound('action');
      setCursorPosition((prev) => {
        const next = prev + direction;
        return Math.max(0, Math.min(expression.length, next));
      });
    },
    [expression.length, soundEnabled]
  );

  // History navigation (▲ and ▼)
  const handleHistoryNavigate = useCallback(
    (direction: -1 | 1) => {
      if (soundEnabled) playKeySound('action');
      if (history.length === 0) return;

      const newIndex = historyIndex + (direction === -1 ? 1 : -1);
      if (newIndex >= 0 && newIndex < history.length) {
        setHistoryIndex(newIndex);
        const item = history[newIndex];
        setExpression(item.expression);
        setCursorPosition(item.expression.length);
        setResult(item.result);
        setExactResult(item.exactResult || null);
        setShowingExact(Boolean(item.exactResult));
      } else if (newIndex < 0) {
        setHistoryIndex(-1);
        setExpression('');
        setCursorPosition(0);
        setResult('0');
        setExactResult(null);
      }
    },
    [history, historyIndex, soundEnabled]
  );

  // Toggle Standard to Decimal (S⇔D key)
  const handleToggleSD = useCallback(() => {
    if (soundEnabled) playKeySound('action');
    if (exactResult) {
      setShowingExact((prev) => !prev);
    } else {
      // Try to convert to DMS format if standard decimal
      const num = Number(result);
      if (!Number.isNaN(num)) {
        setResult((prev) => (prev.includes('°') ? num.toString() : toDMS(num)));
      }
    }
  }, [exactResult, result, soundEnabled]);

  // Memory keys: M+, M-
  const handleMemoryChange = useCallback(
    (isAdd: boolean) => {
      if (soundEnabled) playKeySound('action');
      const val = Number(result);
      if (!Number.isNaN(val)) {
        setMemory((prev) => prev + (isAdd ? val : -val));
      }
      setIsShift(false);
    },
    [result, soundEnabled]
  );

  // Keypress Dispatcher
  const handleKeyPress = useCallback(
    (key: string, type: 'number' | 'operator' | 'function' | 'action' = 'function') => {
      if (soundEnabled) playKeySound(type === 'action' ? 'action' : 'standard');

      // 1. Shift Key
      if (key === 'SHIFT') {
        setIsShift((prev) => !prev);
        setIsAlpha(false);
        return;
      }

      // 2. Alpha Key
      if (key === 'ALPHA') {
        setIsAlpha((prev) => !prev);
        setIsShift(false);
        return;
      }

      // 3. Clear / AC
      if (key === 'AC' || key === 'ON') {
        handleClear();
        return;
      }

      // 4. Delete / DEL
      if (key === 'DEL') {
        handleDelete();
        return;
      }

      // 5. Evaluate / =
      if (key === '=') {
        handleEvaluate();
        return;
      }

      // 6. S⇔D
      if (key === 'SD') {
        handleToggleSD();
        return;
      }

      // 7. Mode / Setup
      if (key === 'MODE') {
        handleToggleAngleUnit();
        return;
      }

      // 8. Hyperbolic Toggle
      if (key === 'hyp') {
        setIsHyp((prev) => !prev);
        return;
      }

      // 9. Memory M+ / M-
      if (key === 'M+') {
        handleMemoryChange(true);
        return;
      }
      if (key === 'M-') {
        handleMemoryChange(false);
        return;
      }

      // 10. STO / RCL variables
      if (key === 'STO') {
        setIsSto(true);
        return;
      }
      if (key === 'RCL') {
        setIsRcl(true);
        return;
      }

      // 11. Handle variable assignment or retrieval
      if (['A', 'B', 'C', 'D', 'E', 'F', 'X', 'Y', 'M'].includes(key)) {
        if (isSto) {
          const val = Number(result);
          if (!Number.isNaN(val)) {
            setVariables((prev) => ({ ...prev, [key]: val }));
          }
          setIsSto(false);
          setIsAlpha(false);
          return;
        }
        if (isRcl) {
          const val = variables[key] ?? 0;
          insertAtCursor(val.toString());
          setIsRcl(false);
          setIsAlpha(false);
          return;
        }
      }

      // Handle Hyperbolic modified trig functions
      let finalKey = key;
      if (isHyp) {
        if (key === 'sin(') finalKey = 'sinh(';
        else if (key === 'cos(') finalKey = 'cosh(';
        else if (key === 'tan(') finalKey = 'tanh(';
        else if (key === 'sin⁻¹(') finalKey = 'sinh⁻¹(';
        else if (key === 'cos⁻¹(') finalKey = 'cosh⁻¹(';
        else if (key === 'tan⁻¹(') finalKey = 'tanh⁻¹(';
        setIsHyp(false);
      }

      // Standard insertion
      insertAtCursor(finalKey);

      // Reset one-shot shift/alpha
      setIsShift(false);
      setIsAlpha(false);
    },
    [
      handleClear,
      handleDelete,
      handleEvaluate,
      handleToggleSD,
      handleToggleAngleUnit,
      handleMemoryChange,
      insertAtCursor,
      isHyp,
      isSto,
      isRcl,
      result,
      variables,
      soundEnabled,
    ]
  );

  // Physical Computer Keyboard Event Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in an input field (e.g. AI chat box)
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') return;

      if (e.key >= '0' && e.key <= '9') {
        handleKeyPress(e.key, 'number');
      } else if (e.key === '.') {
        handleKeyPress('.', 'number');
      } else if (e.key === '+') {
        handleKeyPress('+', 'operator');
      } else if (e.key === '-') {
        handleKeyPress('-', 'operator');
      } else if (e.key === '*' || e.key === 'x') {
        handleKeyPress('×', 'operator');
      } else if (e.key === '/') {
        e.preventDefault();
        handleKeyPress('÷', 'operator');
      } else if (e.key === '(' || e.key === ')') {
        handleKeyPress(e.key, 'function');
      } else if (e.key === '^') {
        handleKeyPress('^', 'function');
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleEvaluate();
      } else if (e.key === 'Backspace') {
        handleDelete();
      } else if (e.key === 'Escape') {
        handleClear();
      } else if (e.key === 'ArrowLeft') {
        handleMoveCursor(-1);
      } else if (e.key === 'ArrowRight') {
        handleMoveCursor(1);
      } else if (e.key === 'ArrowUp') {
        handleHistoryNavigate(-1);
      } else if (e.key === 'ArrowDown') {
        handleHistoryNavigate(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyPress, handleEvaluate, handleDelete, handleClear, handleMoveCursor, handleHistoryNavigate]);

  // Insert expression from AI or formula sheet directly into Casio
  const handleInsertExpression = (expr: string) => {
    if (soundEnabled) playKeySound('action');
    setExpression(expr);
    setCursorPosition(expr.length);
    setMobileTab('calculator');
  };

  // Trigger AI explain for current screen
  const handleExplainCurrentScreen = () => {
    setMobileTab('bot');
    setAiPanelKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col items-center justify-between font-sans selection:bg-cyan-500/30">
      {/* Top Navbar */}
      <header className="w-full max-w-7xl mx-auto px-4 py-3 flex items-center justify-between border-b border-slate-800/80 backdrop-blur-md bg-slate-950/70 sticky top-0 z-30">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-indigo-600 p-[2px] shadow-lg shadow-cyan-500/10">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-extrabold text-xs font-mono text-cyan-400">
              fx
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Casio Scientific Calculator
              </h1>
              <span className="hidden sm:inline-block text-[10px] font-bold px-1.5 py-0.2 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                AI Powered
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Authentic Natural-V.P.A.M. • ClassWiz fx-991EX with Gemini AI Copilot
            </p>
          </div>
        </div>

        {/* Global Action Toolbar */}
        <div className="flex items-center gap-2">
          {/* Theme Selector Button */}
          <button
            id="open-theme-selector-btn"
            onClick={() => setShowThemeModal(true)}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white transition-all shadow-sm"
          >
            <Palette size={14} className="text-cyan-400" />
            <span className="hidden sm:inline">{currentTheme.name}</span>
            <span className="sm:hidden">Theme</span>
          </button>

          {/* Formulas Button */}
          <button
            id="open-formulas-btn"
            onClick={() => setShowFormulaModal(true)}
            title="Scientific Constants & Formulas"
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all shadow-sm"
          >
            <BookOpen size={14} className="text-amber-400" />
            <span className="hidden sm:inline">Formulas</span>
          </button>

          {/* History Button */}
          <button
            id="open-history-btn"
            onClick={() => setShowHistoryModal(true)}
            title="Calculation History"
            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all shadow-sm relative"
          >
            <History size={14} className="text-purple-400" />
            <span className="hidden sm:inline">History</span>
            {history.length > 0 && (
              <span className="text-[10px] font-mono px-1 rounded-full bg-purple-500/30 text-purple-300">
                {history.length}
              </span>
            )}
          </button>

          {/* Sound Toggle */}
          <button
            id="global-sound-toggle-btn"
            onClick={() => setSoundEnabled((prev) => !prev)}
            title={soundEnabled ? 'Click Sound Enabled' : 'Click Sound Muted'}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} className="text-rose-400" />}
          </button>
        </div>
      </header>

      {/* Mobile Tab Switcher (Visible only on small screens) */}
      <div className="w-full max-w-md px-4 mt-2 sm:hidden">
        <div className="grid grid-cols-2 p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setMobileTab('calculator')}
            className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              mobileTab === 'calculator'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CalcIcon size={14} />
            <span>Casio Calculator</span>
          </button>
          <button
            onClick={() => setMobileTab('bot')}
            className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              mobileTab === 'bot'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bot size={14} />
            <span>AI Copilot</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Area: Split Screen on Desktop/Tablet */}
      <main className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 flex-1 flex flex-col lg:flex-row items-center lg:items-stretch justify-center gap-6">
        {/* Left Column: Authentic Casio Scientific Calculator Hardware */}
        <section
          className={`w-full max-w-[420px] flex flex-col items-center justify-center transition-all ${
            mobileTab === 'calculator' ? 'block' : 'hidden lg:flex'
          }`}
        >
          {/* Authentic Physical Casio Calculator Chassis */}
          <div
            className={`w-full rounded-[28px] p-3.5 sm:p-4 bg-gradient-to-b ${currentTheme.bodyGradient} border-2 ${currentTheme.bezelBorder} shadow-[0_25px_60px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.06)] relative overflow-hidden`}
          >
            {/* Calculator Faceplate Inlay Surface */}
            <div
              className={`w-full rounded-[20px] p-3 ${currentTheme.faceplateBg} ${currentTheme.faceplateTexture || ''} shadow-inner border border-black/20`}
            >
              {/* Dual-Line LCD Display */}
              <CasioDisplay
                theme={currentTheme}
                expression={expression}
                cursorPosition={cursorPosition}
                result={result}
                exactResult={exactResult}
                showingExact={showingExact}
                angleUnit={angleUnit}
                isShift={isShift}
                isAlpha={isAlpha}
                isHyp={isHyp}
                isSto={isSto}
                isRcl={isRcl}
                hasMemory={memory !== 0}
                hasHistoryUp={historyIndex < history.length - 1}
                hasHistoryDown={historyIndex > 0}
                soundEnabled={soundEnabled}
                onToggleSound={() => setSoundEnabled((prev) => !prev)}
                onToggleAngleUnit={handleToggleAngleUnit}
                onExplainWithAI={handleExplainCurrentScreen}
                onToggleSD={handleToggleSD}
              />

              {/* 50-Key Authentic Casio Keypad */}
              <CasioKeypad
                theme={currentTheme}
                isShift={isShift}
                isAlpha={isAlpha}
                onKeyPress={handleKeyPress}
                onMoveCursor={handleMoveCursor}
                onHistoryNavigate={handleHistoryNavigate}
              />
            </div>

            {/* Bottom Casio Model Badge & Embossed Texture */}
            <div className="mt-2 text-center select-none">
              <span className="text-[10px] tracking-widest font-extrabold text-slate-500 uppercase font-mono">
                {currentTheme.modelCode} NATURAL TEXTBOOK DISPLAY
              </span>
            </div>
          </div>
        </section>

        {/* Right Column: Casio AI Copilot Panel */}
        <section
          className={`w-full max-w-xl flex-1 flex flex-col h-[580px] sm:h-[640px] transition-all ${
            mobileTab === 'bot' ? 'block' : 'hidden lg:flex'
          }`}
        >
          <AIBotPanel
            key={aiPanelKey}
            currentExpression={expression}
            currentResult={result}
            angleUnit={angleUnit}
            memory={memory}
            onInsertToCalc={handleInsertExpression}
            isOpen={true}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-4 py-3 text-center text-xs text-slate-500 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span>Casio fx-991EX & fx-82MS Simulator</span>
          <span>•</span>
          <span className="text-slate-400 font-mono">Natural-V.P.A.M.</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-400">
            Keyboard enabled: Use numbers, <kbd className="px-1 bg-slate-800 rounded">Enter</kbd>, <kbd className="px-1 bg-slate-800 rounded">Esc</kbd>, <kbd className="px-1 bg-slate-800 rounded">◀ ▶</kbd>
          </span>
        </div>
      </footer>

      {/* Modals */}
      {showThemeModal && (
        <ThemeSelectorModal
          currentThemeId={currentTheme.id}
          onSelectTheme={handleSelectTheme}
          onClose={() => setShowThemeModal(false)}
        />
      )}

      {showFormulaModal && (
        <FormulaSheetModal
          onInsertExpression={handleInsertExpression}
          onClose={() => setShowFormulaModal(false)}
        />
      )}

      {showHistoryModal && (
        <HistoryModal
          history={history}
          onSelectHistoryItem={(item) => {
            setExpression(item.expression);
            setCursorPosition(item.expression.length);
            setResult(item.result);
            setExactResult(item.exactResult || null);
            setShowingExact(Boolean(item.exactResult));
          }}
          onExplainItem={(item) => {
            setExpression(item.expression);
            setResult(item.result);
            handleExplainCurrentScreen();
          }}
          onClearHistory={() => setHistory([])}
          onClose={() => setShowHistoryModal(false)}
        />
      )}
    </div>
  );
}
