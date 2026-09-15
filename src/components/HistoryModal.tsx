import React from 'react';
import { CalculationHistoryItem } from '../types';
import { X, History, Trash2, ArrowDownToLine, Sparkles } from 'lucide-react';

interface HistoryModalProps {
  history: CalculationHistoryItem[];
  onSelectHistoryItem: (item: CalculationHistoryItem) => void;
  onExplainItem: (item: CalculationHistoryItem) => void;
  onClearHistory: () => void;
  onClose: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  history,
  onSelectHistoryItem,
  onExplainItem,
  onClearHistory,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <History size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Calculation History</h2>
              <p className="text-xs text-slate-400">
                {history.length} saved calculation{history.length === 1 ? '' : 's'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                title="Clear all history"
                className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* History List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2.5">
          {history.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              <History size={32} className="mx-auto mb-2 opacity-40" />
              <p>No calculations yet.</p>
              <p className="text-xs text-slate-600 mt-1">
                Calculations evaluated with = will appear here.
              </p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-slate-600 transition-all flex flex-col gap-2 group"
              >
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono text-[10px] bg-slate-700/60 px-1.5 py-0.5 rounded">
                    {item.angleUnit}
                  </span>
                  <span className="text-[11px]">{item.timestamp}</span>
                </div>

                <div className="font-mono text-sm text-slate-300 overflow-x-auto whitespace-nowrap">
                  {item.expression}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-700/50">
                  <div className="font-mono text-base font-bold text-cyan-300">
                    = {item.exactResult || item.result}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        onExplainItem(item);
                        onClose();
                      }}
                      title="Explain with AI"
                      className="p-1.5 rounded-lg text-amber-300 hover:bg-amber-500/20 transition-colors"
                    >
                      <Sparkles size={14} />
                    </button>
                    <button
                      onClick={() => {
                        onSelectHistoryItem(item);
                        onClose();
                      }}
                      title="Load into Casio display"
                      className="p-1.5 rounded-lg text-cyan-300 hover:bg-cyan-500/20 transition-colors"
                    >
                      <ArrowDownToLine size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
