import React from 'react';
import { CasioTheme } from '../types';
import { CASIO_THEMES } from '../data/themes';
import { X, Check, Palette } from 'lucide-react';

interface ThemeSelectorModalProps {
  currentThemeId: string;
  onSelectTheme: (theme: CasioTheme) => void;
  onClose: () => void;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({
  currentThemeId,
  onSelectTheme,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Palette size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Casio Calculator Editions</h2>
              <p className="text-xs text-slate-400">
                Choose authentic Casio hardware styling, LCD glass tint, and keypad colors
              </p>
            </div>
          </div>
          <button
            id="close-theme-modal-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Theme Cards Grid */}
        <div className="p-5 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {CASIO_THEMES.map((theme) => {
            const isSelected = theme.id === currentThemeId;
            return (
              <button
                key={theme.id}
                id={`select-theme-${theme.id}`}
                onClick={() => {
                  onSelectTheme(theme);
                  onClose();
                }}
                className={`flex flex-col text-left p-3.5 rounded-xl border-2 transition-all relative overflow-hidden group ${
                  isSelected
                    ? 'border-cyan-500 bg-slate-800/90 shadow-lg shadow-cyan-500/10'
                    : 'border-slate-800 bg-slate-800/40 hover:border-slate-700 hover:bg-slate-800/70'
                }`}
              >
                {/* Active Checkmark Badge */}
                {isSelected && (
                  <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shadow-md">
                    <Check size={12} strokeWidth={3} />
                  </div>
                )}

                {/* Theme Title & Model */}
                <div className="mb-2.5 pr-6">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white">{theme.name}</span>
                    <span
                      className={`text-[9px] font-semibold px-1.5 py-0.2 rounded text-white ${theme.accentTagColor}`}
                    >
                      {theme.badge}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 block font-mono">
                    {theme.modelCode} • {theme.subtitle}
                  </span>
                </div>

                {/* Mini Hardware Preview Swatch */}
                <div className="w-full h-14 rounded-lg bg-gradient-to-b from-slate-950 to-slate-900 border border-slate-700 p-2 flex items-center justify-between gap-2 shadow-inner">
                  {/* Faceplate Swatch */}
                  <div
                    className={`w-1/3 h-full rounded border flex items-center justify-center text-[8px] font-mono font-bold shadow-sm ${theme.faceplateBg} ${theme.bezelBorder} text-slate-800`}
                  >
                    BODY
                  </div>

                  {/* LCD Screen Swatch */}
                  <div
                    className={`flex-1 h-full rounded px-2 flex flex-col justify-center border text-[9px] font-mono ${theme.lcdBg} ${theme.lcdText} ${theme.lcdBorder}`}
                  >
                    <div className="text-[7px] opacity-70 flex justify-between">
                      <span>DEG</span>
                      <span>MATH</span>
                    </div>
                    <div className="font-bold text-right tracking-tighter">3.14159265</div>
                  </div>
                </div>

                {/* Key Accent Legend Swatch */}
                <div className="mt-2 flex items-center gap-1.5 text-[10px]">
                  <span className={`w-2 h-2 rounded-full ${theme.shiftLegendColor.replace('text-', 'bg-')}`} />
                  <span className="text-slate-400">Shift</span>
                  <span className={`w-2 h-2 rounded-full ${theme.alphaLegendColor.replace('text-', 'bg-')}`} />
                  <span className="text-slate-400">Alpha</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
