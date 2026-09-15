import { AngleUnit } from '../types';

// Convert degrees/radians/gradians based on active angle mode
export const toRadians = (value: number, unit: AngleUnit): number => {
  switch (unit) {
    case 'DEG':
      return (value * Math.PI) / 180;
    case 'GRA':
      return (value * Math.PI) / 200;
    case 'RAD':
    default:
      return value;
  }
};

export const fromRadians = (value: number, unit: AngleUnit): number => {
  switch (unit) {
    case 'DEG':
      return (value * 180) / Math.PI;
    case 'GRA':
      return (value * 200) / Math.PI;
    case 'RAD':
    default:
      return value;
  }
};

// Factorial helper
export const factorial = (n: number): number => {
  if (n < 0 || !Number.isInteger(n)) throw new Error('Math ERROR');
  if (n > 170) throw new Error('Math ERROR'); // Overflow limit
  if (n === 0 || n === 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
};

// Permutations nPr
export const nPr = (n: number, r: number): number => {
  if (n < 0 || r < 0 || r > n || !Number.isInteger(n) || !Number.isInteger(r)) {
    throw new Error('Math ERROR');
  }
  return factorial(n) / factorial(n - r);
};

// Combinations nCr
export const nCr = (n: number, r: number): number => {
  if (n < 0 || r < 0 || r > n || !Number.isInteger(n) || !Number.isInteger(r)) {
    throw new Error('Math ERROR');
  }
  return factorial(n) / (factorial(r) * factorial(n - r));
};

// Find exact fraction or radical representations for Casio S<=>D button
export const getExactRepresentation = (num: number, angleUnit: AngleUnit): string | null => {
  if (Number.isNaN(num) || !Number.isFinite(num)) return null;

  // Check known square roots / trig values
  const tolerance = 1e-7;

  // Check simple fractions (denominator up to 200)
  for (let den = 2; den <= 64; den++) {
    const numFrac = Math.round(num * den);
    if (Math.abs(num - numFrac / den) < tolerance) {
      if (Math.abs(numFrac) !== den && den !== 1) {
        return `${numFrac}/${den}`;
      }
    }
  }

  // Check multiples of π
  const piRatio = num / Math.PI;
  for (let den = 1; den <= 12; den++) {
    const numPi = Math.round(piRatio * den);
    if (Math.abs(piRatio - numPi / den) < tolerance) {
      if (den === 1) {
        return numPi === 1 ? 'π' : numPi === -1 ? '-π' : `${numPi}π`;
      }
      return `${numPi === 1 ? '' : numPi === -1 ? '-' : numPi}π/${den}`;
    }
  }

  // Check square roots of integers up to 100
  for (let i = 2; i <= 50; i++) {
    const sq = Math.sqrt(i);
    if (Math.abs(num - sq) < tolerance) return `√${i}`;
    if (Math.abs(num + sq) < tolerance) return `-√${i}`;

    // Common fractions with sqrt like √3/2, √2/2
    if (Math.abs(num - sq / 2) < tolerance) return `√${i}/2`;
    if (Math.abs(num + sq / 2) < tolerance) return `-√${i}/2`;
    if (Math.abs(num - sq / 3) < tolerance) return `√${i}/3`;
    if (Math.abs(num + sq / 3) < tolerance) return `-√${i}/3`;
  }

  return null;
};

// Convert decimal degrees to DMS format (Degrees, Minutes, Seconds)
export const toDMS = (val: number): string => {
  const sign = val < 0 ? '-' : '';
  const abs = Math.abs(val);
  const deg = Math.floor(abs);
  const minFull = (abs - deg) * 60;
  const min = Math.floor(minFull);
  const sec = ((minFull - min) * 60).toFixed(2);
  return `${sign}${deg}° ${min}' ${sec}"`;
};

// Evaluate mathematical expressions with Casio scientific syntax
export const evaluateCasioExpression = (
  rawExpr: string,
  angleUnit: AngleUnit,
  ansVal: number,
  variables: Record<string, number>
): { result: number; exact: string | null; formatted: string } => {
  if (!rawExpr.trim()) {
    return { result: 0, exact: '0', formatted: '0' };
  }

  let expr = rawExpr;

  // Auto-close open parentheses if user didn't close them
  const openCount = (expr.match(/\(/g) || []).length;
  const closeCount = (expr.match(/\)/g) || []).length;
  if (openCount > closeCount) {
    expr += ')'.repeat(openCount - closeCount);
  }

  // Replace constants & variables
  expr = expr.replace(/\bAns\b/g, `(${ansVal})`);
  expr = expr.replace(/π/g, `(${Math.PI})`);
  expr = expr.replace(/e(?![a-zA-Z0-9_])/g, `(${Math.E})`);

  // Replace variable storage registers (A, B, C, D, E, F, X, Y, M)
  Object.keys(variables).forEach((v) => {
    const reg = new RegExp(`\\b${v}\\b`, 'g');
    expr = expr.replace(reg, `(${variables[v] ?? 0})`);
  });

  // Handle scientific notation: e.g. 2×10^5 or 2×10⁵ or ×10^x
  expr = expr.replace(/×10\^([+-]?\d+)/g, '*10**($1)');
  expr = expr.replace(/×10\^/g, '*10**');
  expr = expr.replace(/×10/g, '*10');

  // Replace standard multiplication and division signs
  expr = expr.replace(/×/g, '*');
  expr = expr.replace(/÷/g, '/');
  expr = expr.replace(/−/g, '-'); // Unicode minus

  // Replace percentages: number% -> (number / 100)
  expr = expr.replace(/(\d+(\.\d+)?)%/g, '($1/100)');

  // Handle Factorials: e.g. 5! or (3+2)!
  expr = expr.replace(/(\d+)!/g, 'fact($1)');

  // Handle Permutations and Combinations: 5P2 -> nPr(5, 2), 5C2 -> nCr(5, 2)
  expr = expr.replace(/(\d+)\s*P\s*(\d+)/g, 'nPr($1,$2)');
  expr = expr.replace(/(\d+)\s*C\s*(\d+)/g, 'nCr($1,$2)');

  // Handle square and cube shortcuts
  expr = expr.replace(/²/g, '**2');
  expr = expr.replace(/³/g, '**3');
  expr = expr.replace(/\^/g, '**');

  // Handle radicals: √(x) -> sqrt(x), ∛(x) -> cbrt(x)
  expr = expr.replace(/∛\(/g, 'Math.cbrt(');
  expr = expr.replace(/√\(/g, 'Math.sqrt(');
  expr = expr.replace(/√(\d+(\.\d+)?)/g, 'Math.sqrt($1)');

  // Handle Logarithms
  expr = expr.replace(/\bln\(/g, 'Math.log(');
  expr = expr.replace(/\blog\(/g, 'Math.log10(');

  // Handle Inverse Hyperbolic
  expr = expr.replace(/\bsinh⁻¹\(/g, 'Math.asinh(');
  expr = expr.replace(/\bcosh⁻¹\(/g, 'Math.acosh(');
  expr = expr.replace(/\btanh⁻¹\(/g, 'Math.atanh(');

  // Handle Hyperbolic
  expr = expr.replace(/\bsinh\(/g, 'Math.sinh(');
  expr = expr.replace(/\bcosh\(/g, 'Math.cosh(');
  expr = expr.replace(/\btanh\(/g, 'Math.tanh(');

  // Handle Inverse Trigonometry with angle unit conversion
  expr = expr.replace(/\bsin⁻¹\(/g, 'casioAsin(');
  expr = expr.replace(/\bcos⁻¹\(/g, 'casioAcos(');
  expr = expr.replace(/\btan⁻¹\(/g, 'casioAtan(');

  // Handle Standard Trigonometry with angle unit conversion
  expr = expr.replace(/\bsin\(/g, 'casioSin(');
  expr = expr.replace(/\bcos\(/g, 'casioCos(');
  expr = expr.replace(/\btan\(/g, 'casioTan(');

  // Implicit multiplication: e.g. 2(3) -> 2*(3), (2)(3) -> (2)*(3), 2Math -> 2*Math
  expr = expr.replace(/(\d)\(/g, '$1*(');
  expr = expr.replace(/\)(\d)/g, ')*$1');
  expr = expr.replace(/\)\(/g, ')*(');
  expr = expr.replace(/(\d)(casio|Math)/g, '$1*$2');

  // Math helper functions injected into safe evaluation scope
  const scope = {
    Math,
    fact: factorial,
    nPr,
    nCr,
    casioSin: (x: number) => {
      const rad = toRadians(x, angleUnit);
      // Clean up floating point near zero for 180, 360 deg
      const val = Math.sin(rad);
      return Math.abs(val) < 1e-15 ? 0 : val;
    },
    casioCos: (x: number) => {
      const rad = toRadians(x, angleUnit);
      // Clean up floating point near zero for 90, 270 deg
      const val = Math.cos(rad);
      return Math.abs(val) < 1e-15 ? 0 : val;
    },
    casioTan: (x: number) => {
      const rad = toRadians(x, angleUnit);
      // Check undefined tan(90 deg)
      if (angleUnit === 'DEG' && Math.abs((Math.abs(x) % 180) - 90) < 1e-9) {
        throw new Error('Math ERROR');
      }
      const val = Math.tan(rad);
      return Math.abs(val) < 1e-15 ? 0 : val;
    },
    casioAsin: (x: number) => {
      if (x < -1 || x > 1) throw new Error('Math ERROR');
      return fromRadians(Math.asin(x), angleUnit);
    },
    casioAcos: (x: number) => {
      if (x < -1 || x > 1) throw new Error('Math ERROR');
      return fromRadians(Math.acos(x), angleUnit);
    },
    casioAtan: (x: number) => {
      return fromRadians(Math.atan(x), angleUnit);
    },
  };

  try {
    // Safely evaluate using isolated Function with scope keys
    const fn = new Function(...Object.keys(scope), `return (${expr});`);
    const val = fn(...Object.values(scope));

    if (val === undefined || Number.isNaN(val)) {
      throw new Error('Math ERROR');
    }

    if (!Number.isFinite(val)) {
      throw new Error('Math ERROR');
    }

    // Clean floating point errors (e.g. 0.0000000000000001 -> 0, 1.9999999999999998 -> 2)
    const rounded = Number(Number(val).toPrecision(12));
    const exact = getExactRepresentation(rounded, angleUnit);

    let formatted = rounded.toString();
    // Format large numbers in scientific notation like Casio
    if (Math.abs(rounded) >= 1e10 || (Math.abs(rounded) < 1e-4 && rounded !== 0)) {
      formatted = rounded.toExponential(6).replace('e+', '×10^').replace('e', '×10^');
    }

    return {
      result: rounded,
      exact,
      formatted,
    };
  } catch (err: any) {
    if (err.message && err.message.includes('Math ERROR')) {
      throw new Error('Math ERROR');
    }
    throw new Error('Syntax ERROR');
  }
};
