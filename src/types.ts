export type AngleUnit = 'DEG' | 'RAD' | 'GRA';

export interface CasioTheme {
  id: string;
  name: string;
  modelCode: string;
  subtitle: string;
  badge: string;
  bodyGradient: string;
  faceplateBg: string;
  faceplateTexture?: string;
  bezelBorder: string;
  lcdBg: string;
  lcdText: string;
  lcdSubText: string;
  lcdGlow?: string;
  lcdBorder: string;
  solarCellBg: string;
  keycapFunction: string;
  keycapFunctionText: string;
  keycapNumber: string;
  keycapNumberText: string;
  keycapActionDel: string;
  keycapActionAc: string;
  keycapEquals: string;
  keycapEqualsText: string;
  dpadBg: string;
  dpadBorder: string;
  dpadArrowColor: string;
  shiftLegendColor: string;
  alphaLegendColor: string;
  accentTagColor: string;
}

export interface CalculationHistoryItem {
  id: string;
  expression: string;
  result: string;
  exactResult?: string;
  angleUnit: AngleUnit;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestedExpression?: string;
  timestamp: string;
}

export interface CalculatorState {
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
  memory: number;
  variables: Record<string, number>;
  ans: number;
  soundEnabled: boolean;
  history: CalculationHistoryItem[];
  historyIndex: number; // For UP/DOWN replay navigation
}
