import React from 'react';
import { CasioTheme, AngleUnit } from '../types';
import { Sparkles, ArrowLeftRight, Volume2, VolumeX, HelpCircle } from 'lucide-react';

interface CasioDisplayProps {
  theme: CasioTheme;
  expression: string;
  cursorPosition: number;
  result: string;
  exactResult: string | null;
  showingExact: boolean;
  angleUnit: AngleUnit;
  isShift: boolean;
  isAlpha: boolean;
  isHyp: boolean;
  isSto: boolean;
  isRcl: boolean;
  hasMemory: boolean;
  hasHistoryUp: boolean;
  hasHistoryDown: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onToggleAngleUnit: () => void;
  onExplainWithAI: () => void;
  onToggleSD: () => void;
}

export const CasioDisplay: React.FC<CasioDisplayProps> = ({
  theme,
  expression,
  cursorPosition,
  result,
  exactResult,
  showingExact,
  angleUnit,
  isShift,
  isAlpha,
  isHyp,
  isSto,
  isRcl,
  hasMemory,
  hasHistoryUp,
  hasHistoryDown,
  soundEnabled,
  onToggleSound,
  onToggleAngleUnit,
  onExplainWithAI,
  onToggleSD,
}) => {
  // Insert visual blinking cursor in expression
  const renderExpressionWithCursor = () => {
    if (!expression) {
      return (
        <span className="inline-flex items-center">
          <span className="opacity-30">0</span>
          <span className="w-1.5 h-4.5 bg-current animate-pulse ml-0.5 inline-block align-middle" />
        </span>
      );
    }

    const before = expression.slice(0, cursorPosition);
    const after = expression.slice(cursorPosition);

    return (
      <span className="tracking-wide">
        {before}
        <span className="w-1.5 h-4.5 bg-current animate-pulse inline-block align-middle mx-[0.5px] opacity-90" />
        {after}
      </span>
    );
  };

  const isError = result.includes('ERROR');
  const displayResult = showingExact && exactResult ? exactResult : result;

  return (
    <div className="w-full select-none">
      {/* Top Casio Brand Header & Photovoltaic Solar Panel */}
      <div className="flex items-center justify-between px-3 py-1.5 mb-2 rounded-t-lg bg-black/20 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="font-extrabold tracking-wider text-sm text-slate-200 font-sans">
            CASIO
          </span>
          <div className="flex items-center gap-1.5">
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm text-white ${theme.accentTagColor}`}>
              {theme.modelCode}
            </span>
            <span className="hidden sm:inline-block text-[9px] tracking-tight font-medium text-slate-400">
              {theme.subtitle}
            </span>
          </div>
        </div>

        {/* Solar Cell Panel + Quick Controls */}
        <div className="flex items-center gap-2">
          {/* Authentic Photovoltaic Solar Panel Simulation */}
          <div
            title="Casio TWO WAY POWER (Solar + Battery)"
            className={`w-16 sm:w-20 h-5 rounded px-1 flex items-center justify-between border shadow-inner ${theme.solarCellBg} relative overflow-hidden`}
          >
            <div className="w-[1px] h-full bg-white/10" />
            <div className="w-[1px] h-full bg-white/10" />
            <div className="w-[1px] h-full bg-white/10" />
            <div className="w-[1px] h-full bg-white/10" />
            <span className="absolute right-1 text-[7px] font-mono tracking-tighter text-amber-500/70 select-none">
              SOLAR
            </span>
          </div>

          {/* Sound Mute/Unmute Toggle */}
          <button
            id="casio-sound-toggle"
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute Key Click Sound' : 'Enable Key Click Sound'}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} className="text-rose-400" />}
          </button>
        </div>
      </div>

      {/* Outer LCD Bezel Frame */}
      <div
        className={`p-2 rounded-xl border-2 ${theme.lcdBorder} bg-black/40 shadow-[0_4px_16px_rgba(0,0,0,0.5)]`}
      >
        {/* The LCD Screen Inner Surface */}
        <div
          className={`relative w-full rounded-lg px-3 py-2 ${theme.lcdBg} ${theme.lcdText} ${theme.lcdGlow} transition-colors duration-200 overflow-hidden font-mono min-h-[112px] flex flex-col justify-between`}
        >
          {/* Subtle LCD Scanline / Dot Grid Overlay Effect */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.035] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

          {/* Top Row: Authentic Casio LCD Micro-Indicators */}
          <div className="flex items-center justify-between text-[9px] tracking-wider font-semibold border-b border-current/15 pb-1 relative z-10">
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Shift Indicator [S] */}
              <span
                className={`px-1 py-[0.5px] rounded transition-opacity ${
                  isShift
                    ? 'bg-amber-400 text-black font-bold opacity-100 shadow-sm'
                    : 'opacity-20'
                }`}
              >
                S
              </span>

              {/* Alpha Indicator [A] */}
              <span
                className={`px-1 py-[0.5px] rounded transition-opacity ${
                  isAlpha
                    ? 'bg-rose-500 text-white font-bold opacity-100 shadow-sm'
                    : 'opacity-20'
                }`}
              >
                A
              </span>

              {/* Memory Indicator [M] */}
              <span
                className={`px-1 py-[0.5px] rounded ${
                  hasMemory ? 'font-bold opacity-100' : 'opacity-20'
                }`}
              >
                M
              </span>

              {/* STO / RCL Indicators */}
              <span className={`px-0.5 ${isSto ? 'font-bold opacity-100 underline' : 'opacity-20'}`}>
                STO
              </span>
              <span className={`px-0.5 ${isRcl ? 'font-bold opacity-100 underline' : 'opacity-20'}`}>
                RCL
              </span>

              {/* Hyperbolic [hyp] */}
              <span className={`px-0.5 ${isHyp ? 'font-bold opacity-100' : 'opacity-20'}`}>
                hyp
              </span>

              {/* History Scroll Indicator */}
              <span className={`px-0.5 ${hasHistoryUp || hasHistoryDown ? 'opacity-90' : 'opacity-20'}`}>
                {hasHistoryUp && hasHistoryDown ? '▲▼' : hasHistoryUp ? '▲' : hasHistoryDown ? '▼' : '◄►'}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Clickable Angle Unit Indicator [DEG / RAD / GRA] */}
              <button
                id="casio-angle-unit-toggle"
                onClick={onToggleAngleUnit}
                title="Click to toggle angle unit (DEG / RAD / GRA)"
                className="px-1.5 py-[0.5px] rounded font-bold border border-current/30 hover:border-current transition-colors text-[9px] bg-black/15"
              >
                {angleUnit}
              </button>

              {/* Natural Display Math / Line mode badge */}
              <span className="opacity-70 text-[9px] font-sans">MATH</span>
            </div>
          </div>

          {/* Middle Row: Expression Line (Upper text line with live cursor) */}
          <div className="my-1 text-sm sm:text-base font-mono overflow-x-auto whitespace-nowrap scrollbar-none py-0.5 relative z-10">
            {renderExpressionWithCursor()}
          </div>

          {/* Bottom Row: Computed Result / Error Display */}
          <div className="relative z-10 flex items-end justify-between pt-1">
            {/* Left status / S<=>D Indicator */}
            <div className="flex items-center gap-1.5">
              {exactResult && (
                <button
                  id="casio-exact-toggle-badge"
                  onClick={onToggleSD}
                  title="Toggle Standard ⇔ Decimal representation"
                  className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border border-current/30 hover:bg-current/10 transition-colors"
                >
                  <ArrowLeftRight size={10} />
                  <span>{showingExact ? 'Exact' : 'Dec'}</span>
                </button>
              )}

              {/* Quick AI explain badge if result is ready and not error */}
              {!isError && result && result !== '0' && (
                <button
                  id="casio-explain-calc-btn"
                  onClick={onExplainWithAI}
                  title="Ask AI Bot to explain this calculation step-by-step"
                  className="hidden sm:inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-all font-sans font-medium animate-fade-in"
                >
                  <Sparkles size={10} className="text-amber-400" />
                  <span>AI Explain</span>
                </button>
              )}
            </div>

            {/* Right Large Result Display */}
            {isError ? (
              <div className="text-right">
                <div className="text-sm font-bold text-rose-400 animate-pulse">{result}</div>
                <div className="text-[10px] opacity-70 tracking-tight font-sans">
                  [AC]:Cancel [◀▶]:Goto
                </div>
              </div>
            ) : (
              <div
                className="text-right text-xl sm:text-2xl md:text-3xl font-bold font-mono tracking-tight overflow-x-auto max-w-[260px] sm:max-w-[340px] whitespace-nowrap scrollbar-none"
                title={displayResult}
              >
                {displayResult}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
