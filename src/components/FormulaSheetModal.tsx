import React, { useState } from 'react';
import { X, BookOpen, Atom, Compass, Activity, ArrowDownToLine } from 'lucide-react';

interface FormulaSheetModalProps {
  onInsertExpression: (expr: string) => void;
  onClose: () => void;
}

const CONSTANTS = [
  { name: 'Speed of Light (c)', symbol: 'c', value: '299792458', unit: 'm/s', category: 'Physics' },
  { name: 'Planck Constant (h)', symbol: 'h', value: '6.62607015×10^-34', unit: 'J·s', category: 'Quantum' },
  { name: 'Gravitational Constant (G)', symbol: 'G', value: '6.67430×10^-11', unit: 'm³/(kg·s²)', category: 'Astrophysics' },
  { name: 'Avogadro Constant (NA)', symbol: 'NA', value: '6.02214076×10^23', unit: 'mol⁻¹', category: 'Chemistry' },
  { name: 'Elementary Charge (e)', symbol: 'e', value: '1.60217663×10^-19', unit: 'C', category: 'Physics' },
  { name: 'Boltzmann Constant (k)', symbol: 'k', value: '1.380649×10^-23', unit: 'J/K', category: 'Thermodynamics' },
  { name: 'Gas Constant (R)', symbol: 'R', value: '8.314462618', unit: 'J/(mol·K)', category: 'Chemistry' },
  { name: 'Standard Gravity (g)', symbol: 'g', value: '9.80665', unit: 'm/s²', category: 'Physics' },
];

const FORMULAS = [
  {
    category: 'Trigonometry & Geometry',
    items: [
      { name: 'Pythagorean Theorem', formula: '√(a² + b²)', casioSyntax: '√(3² + 4²)' },
      { name: 'Law of Cosines', formula: 'c² = a² + b² - 2ab·cos(C)', casioSyntax: '√(5² + 7² - 2×5×7×cos(60))' },
      { name: 'Sin 30° Exact', formula: 'sin(30°) = 1/2', casioSyntax: 'sin(30)' },
      { name: 'Sin 45° Exact', formula: 'sin(45°) = √2 / 2', casioSyntax: 'sin(45)' },
      { name: 'Cos 30° Exact', formula: 'cos(30°) = √3 / 2', casioSyntax: 'cos(30)' },
    ],
  },
  {
    category: 'Calculus & Algebra',
    items: [
      { name: 'Quadratic Roots', formula: 'x = (-b ± √(b² - 4ac)) / (2a)', casioSyntax: '(-5 + √(5² - 4×2×(-3))) / (2×2)' },
      { name: 'Permutations (nPr)', formula: 'n! / (n - r)!', casioSyntax: '7 P 3' },
      { name: 'Combinations (nCr)', formula: 'n! / (r!(n - r)!)', casioSyntax: '10 C 4' },
      { name: 'Euler Formula', formula: 'e^(iπ) + 1 = 0', casioSyntax: 'e^(1)' },
    ],
  },
];

export const FormulaSheetModal: React.FC<FormulaSheetModalProps> = ({
  onInsertExpression,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'constants' | 'formulas' | 'shortcuts'>('constants');

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <BookOpen size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Casio Reference & Constants</h2>
              <p className="text-xs text-slate-400">
                Quick scientific constants, standard formulas, and fx-991 keyboard guide
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/20 px-4">
          <button
            onClick={() => setActiveTab('constants')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'constants'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Atom size={14} />
            <span>Scientific Constants</span>
          </button>
          <button
            onClick={() => setActiveTab('formulas')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'formulas'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass size={14} />
            <span>Standard Formulas</span>
          </button>
          <button
            onClick={() => setActiveTab('shortcuts')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'shortcuts'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity size={14} />
            <span>Casio Keystroke Guide</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 overflow-y-auto flex-1">
          {activeTab === 'constants' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CONSTANTS.map((c, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between gap-2 hover:bg-slate-800 transition-colors"
                >
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white truncate">{c.name}</span>
                      <span className="text-[9px] px-1.5 py-0.2 bg-slate-700 text-slate-300 rounded">
                        {c.category}
                      </span>
                    </div>
                    <div className="font-mono text-xs text-cyan-300 mt-0.5 font-semibold truncate">
                      {c.value} <span className="text-[10px] text-slate-400 font-sans">{c.unit}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onInsertExpression(c.value);
                      onClose();
                    }}
                    title="Insert into Casio Calculator"
                    className="shrink-0 p-2 rounded-lg bg-cyan-500/15 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 transition-colors"
                  >
                    <ArrowDownToLine size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'formulas' && (
            <div className="space-y-4">
              {FORMULAS.map((section, sIdx) => (
                <div key={sIdx} className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    {section.category}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {section.items.map((item, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between gap-2 hover:bg-slate-800 transition-colors"
                      >
                        <div>
                          <div className="text-xs font-bold text-white">{item.name}</div>
                          <div className="text-[11px] text-slate-400 font-serif italic mt-0.5">
                            {item.formula}
                          </div>
                          <code className="text-[11px] font-mono font-semibold text-amber-300 block mt-1">
                            {item.casioSyntax}
                          </code>
                        </div>

                        <button
                          onClick={() => {
                            onInsertExpression(item.casioSyntax);
                            onClose();
                          }}
                          title="Insert Casio syntax into display"
                          className="shrink-0 p-2 rounded-lg bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-slate-950 transition-colors"
                        >
                          <ArrowDownToLine size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'shortcuts' && (
            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/70 space-y-2">
                <h4 className="font-bold text-cyan-300 flex items-center gap-1.5">
                  <span>S⇔D Key (Standard ⇔ Decimal)</span>
                </h4>
                <p className="text-slate-400 leading-relaxed">
                  Toggles between exact fractions (e.g. <code className="text-white">1/3</code>), exact radicals (e.g. <code className="text-white">√3/2</code>), and standard floating decimals (<code className="text-white">0.866025</code>).
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/70 space-y-2">
                <h4 className="font-bold text-amber-300 flex items-center gap-1.5">
                  <span>SHIFT & ALPHA Keys</span>
                </h4>
                <p className="text-slate-400 leading-relaxed">
                  Pressing <strong className="text-amber-400">SHIFT</strong> enables secondary functions shown in gold above keys (e.g. <code className="text-white">sin⁻¹</code>, <code className="text-white">∛</code>, <code className="text-white">nPr</code>, <code className="text-white">π</code>).
                  Pressing <strong className="text-rose-400">ALPHA</strong> accesses variable registers A, B, C, D, E, F, X, Y, and M.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/70 space-y-2">
                <h4 className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <span>Replay 4-Way D-Pad</span>
                </h4>
                <p className="text-slate-400 leading-relaxed">
                  Use the left/right arrows (<code className="text-white">◀</code> <code className="text-white">▶</code>) to navigate the editing cursor inside long formulas. Use up/down arrows (<code className="text-white">▲</code> <code className="text-white">▼</code>) to browse calculation history.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
