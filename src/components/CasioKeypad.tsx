import React from 'react';
import { CasioTheme } from '../types';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

interface CasioKeypadProps {
  theme: CasioTheme;
  isShift: boolean;
  isAlpha: boolean;
  onKeyPress: (key: string, type?: 'number' | 'operator' | 'function' | 'action') => void;
  onMoveCursor: (direction: -1 | 1) => void;
  onHistoryNavigate: (direction: -1 | 1) => void;
}

export const CasioKeypad: React.FC<CasioKeypadProps> = ({
  theme,
  isShift,
  isAlpha,
  onKeyPress,
  onMoveCursor,
  onHistoryNavigate,
}) => {
  // Renders a key with shifted and alpha secondary markings above the keycap
  const renderKey = (
    mainLabel: string | React.ReactNode,
    keyValue: string,
    options?: {
      shiftLabel?: string;
      alphaLabel?: string;
      shiftValue?: string;
      alphaValue?: string;
      keycapStyle?: string;
      textStyle?: string;
      type?: 'number' | 'operator' | 'function' | 'action';
      isAccent?: boolean;
      customHeight?: string;
    }
  ) => {
    const {
      shiftLabel,
      alphaLabel,
      shiftValue,
      alphaValue,
      keycapStyle = theme.keycapFunction,
      textStyle = theme.keycapFunctionText,
      type = 'function',
      customHeight = 'h-9 sm:h-10',
    } = options || {};

    const handleClick = () => {
      if (isShift && shiftValue) {
        onKeyPress(shiftValue, type);
      } else if (isAlpha && alphaValue) {
        onKeyPress(alphaValue, type);
      } else {
        onKeyPress(keyValue, type);
      }
    };

    return (
      <div className="flex flex-col items-center justify-end w-full">
        {/* Secondary Legends: Shift (Gold/Yellow) & Alpha (Pink/Red) */}
        <div className="w-full flex items-center justify-between px-0.5 mb-0.5 text-[8px] sm:text-[9px] font-sans font-semibold tracking-tighter leading-none h-3 overflow-hidden select-none">
          <span
            className={`${theme.shiftLegendColor} truncate ${isShift ? 'font-bold underline' : ''}`}
            title={shiftLabel ? `Shift: ${shiftLabel}` : undefined}
          >
            {shiftLabel || ''}
          </span>
          <span
            className={`${theme.alphaLegendColor} truncate ${isAlpha ? 'font-bold underline' : ''}`}
            title={alphaLabel ? `Alpha: ${alphaLabel}` : undefined}
          >
            {alphaLabel || ''}
          </span>
        </div>

        {/* Tactile Keycap Button */}
        <button
          type="button"
          onClick={handleClick}
          className={`w-full ${customHeight} rounded-md font-sans text-xs sm:text-sm font-bold flex items-center justify-center transition-all duration-75 shadow-sm active:translate-y-0.5 active:shadow-none select-none ${keycapStyle} ${textStyle}`}
        >
          {mainLabel}
        </button>
      </div>
    );
  };

  return (
    <div className="w-full select-none mt-2 space-y-2">
      {/* 1. Control Cluster: SHIFT, ALPHA, Directional Replay D-Pad, MODE, ON */}
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2 items-center">
        {/* SHIFT KEY */}
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-bold text-amber-400 mb-0.5 uppercase tracking-wider">
            SHIFT
          </span>
          <button
            id="casio-key-shift"
            type="button"
            onClick={() => onKeyPress('SHIFT', 'action')}
            className={`w-full h-8 sm:h-9 rounded-md font-bold text-xs sm:text-sm transition-all border-b-2 active:border-b-0 ${
              isShift
                ? 'bg-amber-400 text-black border-amber-600 ring-2 ring-amber-300 shadow-md translate-y-0.5'
                : 'bg-[#252932] text-amber-400 border-black/40 hover:bg-[#323742]'
            }`}
          >
            SHIFT
          </button>
        </div>

        {/* ALPHA KEY */}
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-bold text-rose-400 mb-0.5 uppercase tracking-wider">
            ALPHA
          </span>
          <button
            id="casio-key-alpha"
            type="button"
            onClick={() => onKeyPress('ALPHA', 'action')}
            className={`w-full h-8 sm:h-9 rounded-md font-bold text-xs sm:text-sm transition-all border-b-2 active:border-b-0 ${
              isAlpha
                ? 'bg-rose-500 text-white border-rose-700 ring-2 ring-rose-300 shadow-md translate-y-0.5'
                : 'bg-[#252932] text-rose-400 border-black/40 hover:bg-[#323742]'
            }`}
          >
            ALPHA
          </button>
        </div>

        {/* Circular Metallic Replay D-Pad */}
        <div className="flex justify-center items-center">
          <div
            className={`relative w-16 h-16 sm:w-18 sm:h-18 rounded-full border-2 ${theme.dpadBorder} ${theme.dpadBg} shadow-[0_2px_8px_rgba(0,0,0,0.4)] flex items-center justify-center p-1`}
          >
            {/* Center decorative ring */}
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-black/30 bg-black/10 flex items-center justify-center pointer-events-none">
              <span className="text-[7px] font-extrabold tracking-tighter opacity-60">REPLAY</span>
            </div>

            {/* UP: History Navigation */}
            <button
              id="casio-dpad-up"
              type="button"
              onClick={() => onHistoryNavigate(-1)}
              title="History Previous (Up)"
              className={`absolute top-0.5 left-1/2 -translate-x-1/2 w-8 h-4 flex items-center justify-center ${theme.dpadArrowColor} hover:scale-110 active:scale-95 transition-transform`}
            >
              <ChevronUp size={16} strokeWidth={2.5} />
            </button>

            {/* DOWN: History Navigation */}
            <button
              id="casio-dpad-down"
              type="button"
              onClick={() => onHistoryNavigate(1)}
              title="History Next (Down)"
              className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-8 h-4 flex items-center justify-center ${theme.dpadArrowColor} hover:scale-110 active:scale-95 transition-transform`}
            >
              <ChevronDown size={16} strokeWidth={2.5} />
            </button>

            {/* LEFT: Cursor Left */}
            <button
              id="casio-dpad-left"
              type="button"
              onClick={() => onMoveCursor(-1)}
              title="Cursor Left"
              className={`absolute left-0.5 top-1/2 -translate-y-1/2 h-8 w-4 flex items-center justify-center ${theme.dpadArrowColor} hover:scale-110 active:scale-95 transition-transform`}
            >
              <ChevronLeft size={16} strokeWidth={2.5} />
            </button>

            {/* RIGHT: Cursor Right */}
            <button
              id="casio-dpad-right"
              type="button"
              onClick={() => onMoveCursor(1)}
              title="Cursor Right"
              className={`absolute right-0.5 top-1/2 -translate-y-1/2 h-8 w-4 flex items-center justify-center ${theme.dpadArrowColor} hover:scale-110 active:scale-95 transition-transform`}
            >
              <ChevronRight size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* MODE / SETUP KEY */}
        <div className="flex flex-col items-center">
          <span className="text-[8px] font-semibold text-amber-400 mb-0.5">SET UP</span>
          <button
            id="casio-key-mode"
            type="button"
            onClick={() => onKeyPress('MODE', 'action')}
            className="w-full h-8 sm:h-9 rounded-md font-bold text-[11px] sm:text-xs bg-[#252932] text-slate-200 border-b-2 border-black/40 hover:bg-[#323742] active:border-b-0"
          >
            MODE
          </button>
        </div>

        {/* ON KEY */}
        <div className="flex flex-col items-center">
          <span className="text-[8px] font-semibold opacity-0 mb-0.5">ON</span>
          <button
            id="casio-key-on"
            type="button"
            onClick={() => onKeyPress('ON', 'action')}
            className="w-full h-8 sm:h-9 rounded-md font-bold text-xs sm:text-sm bg-[#1e293b] text-white border-b-2 border-black/50 hover:bg-[#334155] active:border-b-0"
          >
            ON
          </button>
        </div>
      </div>

      {/* 2. Scientific Function Keys: 6 columns x 4 rows */}
      <div className="space-y-1.5 pt-1">
        {/* Function Row 1 */}
        <div className="grid grid-cols-6 gap-1 sm:gap-1.5">
          {renderKey('OPTN', 'OPTN', { shiftLabel: 'QR', shiftValue: 'QR' })}
          {renderKey('CALC', 'CALC', { shiftLabel: 'SOLVE', shiftValue: 'SOLVE' })}
          {renderKey('∫dx', '∫(', { shiftLabel: 'd/dx', shiftValue: 'd/dx(' })}
          {renderKey('x⁻¹', '⁻¹', { shiftLabel: 'x!', shiftValue: '!' })}
          {renderKey('logₐb', 'log(', { shiftLabel: 'Σ', shiftValue: 'Σ(' })}
          {renderKey('ln', 'ln(', { shiftLabel: 'eˣ', shiftValue: 'e^(' })}
        </div>

        {/* Function Row 2 */}
        <div className="grid grid-cols-6 gap-1 sm:gap-1.5">
          {renderKey('x/□', '/', { shiftLabel: 'c/d', shiftValue: '/' })}
          {renderKey('√□', '√(', { shiftLabel: '∛', shiftValue: '∛(' })}
          {renderKey('x²', '²', { shiftLabel: 'x³', shiftValue: '³' })}
          {renderKey('x^□', '^', { shiftLabel: 'x√', shiftValue: '√(' })}
          {renderKey('log', 'log(', { shiftLabel: '10ˣ', shiftValue: '10^(' })}
          {renderKey('(-)', '(-)', { shiftLabel: 'A', alphaLabel: 'A', alphaValue: 'A' })}
        </div>

        {/* Function Row 3: Angle DMS, hyp, trig functions */}
        <div className="grid grid-cols-6 gap-1 sm:gap-1.5">
          {renderKey('° \' "', '°', { shiftLabel: '←', alphaLabel: 'B', alphaValue: 'B' })}
          {renderKey('hyp', 'hyp', { shiftLabel: 'hyp⁻¹', shiftValue: 'hyp⁻¹' })}
          {renderKey('sin', 'sin(', { shiftLabel: 'sin⁻¹', shiftValue: 'sin⁻¹(', alphaLabel: 'C', alphaValue: 'C' })}
          {renderKey('cos', 'cos(', { shiftLabel: 'cos⁻¹', shiftValue: 'cos⁻¹(', alphaLabel: 'D', alphaValue: 'D' })}
          {renderKey('tan', 'tan(', { shiftLabel: 'tan⁻¹', shiftValue: 'tan⁻¹(', alphaLabel: 'E', alphaValue: 'E' })}
          {renderKey('STO', 'STO', { shiftLabel: 'RCL', shiftValue: 'RCL', alphaLabel: 'F', alphaValue: 'F' })}
        </div>

        {/* Function Row 4: ENG, Parentheses, S<=>D, M+ */}
        <div className="grid grid-cols-6 gap-1 sm:gap-1.5">
          {renderKey('ENG', 'ENG', { shiftLabel: '←ENG', shiftValue: 'ENG' })}
          {renderKey('(', '(', { shiftLabel: '%', shiftValue: '%', alphaLabel: 'X', alphaValue: 'X' })}
          {renderKey(')', ')', { shiftLabel: ',', shiftValue: ',', alphaLabel: 'Y', alphaValue: 'Y' })}
          {renderKey('S⇔D', 'SD', { shiftLabel: '≈', shiftValue: 'SD' })}
          {renderKey('M+', 'M+', { shiftLabel: 'M-', shiftValue: 'M-', alphaLabel: 'M', alphaValue: 'M' })}
          {renderKey('Ans', 'Ans', { shiftLabel: '%', shiftValue: '%', type: 'number' })}
        </div>
      </div>

      {/* 3. Main Numeric & Standard Operators Keypad: 5 columns x 4 rows */}
      <div className="space-y-1.5 pt-1.5 border-t border-black/15">
        {/* Row 1: 7, 8, 9, DEL, AC */}
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {renderKey('7', '7', {
            shiftLabel: 'CONST',
            keycapStyle: theme.keycapNumber,
            textStyle: theme.keycapNumberText,
            type: 'number',
            customHeight: 'h-10 sm:h-11',
          })}
          {renderKey('8', '8', {
            shiftLabel: 'CONV',
            keycapStyle: theme.keycapNumber,
            textStyle: theme.keycapNumberText,
            type: 'number',
            customHeight: 'h-10 sm:h-11',
          })}
          {renderKey('9', '9', {
            shiftLabel: 'CLR',
            keycapStyle: theme.keycapNumber,
            textStyle: theme.keycapNumberText,
            type: 'number',
            customHeight: 'h-10 sm:h-11',
          })}
          {renderKey('DEL', 'DEL', {
            shiftLabel: 'INS',
            shiftValue: 'INS',
            keycapStyle: theme.keycapActionDel,
            textStyle: 'text-white',
            type: 'action',
            customHeight: 'h-10 sm:h-11',
          })}
          {renderKey('AC', 'AC', {
            shiftLabel: 'OFF',
            shiftValue: 'OFF',
            keycapStyle: theme.keycapActionAc,
            textStyle: 'text-white',
            type: 'action',
            customHeight: 'h-10 sm:h-11',
          })}
        </div>

        {/* Row 2: 4, 5, 6, ×, ÷ */}
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {renderKey('4', '4', {
            shiftLabel: 'MATRIX',
            keycapStyle: theme.keycapNumber,
            textStyle: theme.keycapNumberText,
            type: 'number',
            customHeight: 'h-10 sm:h-11',
          })}
          {renderKey('5', '5', {
            shiftLabel: 'VECTOR',
            keycapStyle: theme.keycapNumber,
            textStyle: theme.keycapNumberText,
            type: 'number',
            customHeight: 'h-10 sm:h-11',
          })}
          {renderKey('6', '6', {
            keycapStyle: theme.keycapNumber,
            textStyle: theme.keycapNumberText,
            type: 'number',
            customHeight: 'h-10 sm:h-11',
          })}
          {renderKey('×', '×', {
            shiftLabel: 'nPr',
            shiftValue: ' P ',
            keycapStyle: theme.keycapFunction,
            textStyle: theme.keycapFunctionText,
            type: 'operator',
            customHeight: 'h-10 sm:h-11',
          })}
          {renderKey('÷', '÷', {
            shiftLabel: 'nCr',
            shiftValue: ' C ',
            keycapStyle: theme.keycapFunction,
            textStyle: theme.keycapFunctionText,
            type: 'operator',
            customHeight: 'h-10 sm:h-11',
          })}
        </div>

        {/* Row 3: 1, 2, 3, +, - */}
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {renderKey('1', '1', {
            shiftLabel: 'STAT',
            keycapStyle: theme.keycapNumber,
            textStyle: theme.keycapNumberText,
            type: 'number',
            customHeight: 'h-10 sm:h-11',
          })}
          {renderKey('2', '2', {
            shiftLabel: 'TABLE',
            keycapStyle: theme.keycapNumber,
            textStyle: theme.keycapNumberText,
            type: 'number',
            customHeight: 'h-10 sm:h-11',
          })}
          {renderKey('3', '3', {
            keycapStyle: theme.keycapNumber,
            textStyle: theme.keycapNumberText,
            type: 'number',
            customHeight: 'h-10 sm:h-11',
          })}
          {renderKey('+', '+', {
            shiftLabel: 'Pol',
            shiftValue: 'Pol(',
            keycapStyle: theme.keycapFunction,
            textStyle: theme.keycapFunctionText,
            type: 'operator',
            customHeight: 'h-10 sm:h-11',
          })}
          {renderKey('−', '-', {
            shiftLabel: 'Rec',
            shiftValue: 'Rec(',
            keycapStyle: theme.keycapFunction,
            textStyle: theme.keycapFunctionText,
            type: 'operator',
            customHeight: 'h-10 sm:h-11',
          })}
        </div>

        {/* Row 4: 0, ., ×10ˣ, Ans, = */}
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {renderKey('0', '0', {
            shiftLabel: 'Rnd',
            shiftValue: 'Rnd(',
            keycapStyle: theme.keycapNumber,
            textStyle: theme.keycapNumberText,
            type: 'number',
            customHeight: 'h-10 sm:h-11',
          })}
          {renderKey('.', '.', {
            shiftLabel: 'Ran#',
            shiftValue: 'Ran#',
            keycapStyle: theme.keycapNumber,
            textStyle: theme.keycapNumberText,
            type: 'number',
            customHeight: 'h-10 sm:h-11',
          })}
          {renderKey('×10ˣ', '×10^', {
            shiftLabel: 'π',
            shiftValue: 'π',
            alphaLabel: 'e',
            alphaValue: 'e',
            keycapStyle: theme.keycapFunction,
            textStyle: theme.keycapFunctionText,
            type: 'number',
            customHeight: 'h-10 sm:h-11',
          })}
          {renderKey('Ans', 'Ans', {
            shiftLabel: '%',
            shiftValue: '%',
            keycapStyle: theme.keycapFunction,
            textStyle: theme.keycapFunctionText,
            type: 'number',
            customHeight: 'h-10 sm:h-11',
          })}
          {renderKey('=', '=', {
            keycapStyle: theme.keycapEquals,
            textStyle: theme.keycapEqualsText,
            type: 'action',
            customHeight: 'h-10 sm:h-11',
          })}
        </div>
      </div>
    </div>
  );
};
