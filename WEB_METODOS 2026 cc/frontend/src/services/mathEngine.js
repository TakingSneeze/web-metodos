import * as math from 'mathjs';

// Safe expression evaluator
export function evaluateMath(expr, scope = {}) {
  try {
    // Normalizar expresiones comunes (ej: sen -> sin, ^ -> ^)
    let cleaned = expr.replace(/sen\(/gi, 'sin(');
    const compiled = math.compile(cleaned);
    const res = compiled.evaluate(scope);
    if (typeof res !== 'number' || isNaN(res) || !isFinite(res)) {
      return null;
    }
    return res;
  } catch (err) {
    return null;
  }
}

// Cálculo de derivada simbólica con fallback numérico
export function getDerivativeExpr(expr) {
  try {
    let cleaned = expr.replace(/sen\(/gi, 'sin(');
    const node = math.parse(cleaned);
    const d = math.derivative(node, 'x');
    return d.toString();
  } catch (err) {
    return null;
  }
}

/* =========================================================
   A. MÉTODOS PARA ENCONTRAR RAÍCES
========================================================= */

// 1. BISECCIÓN
export function solveBisection({ expr, a, b, tol = 1e-5, maxIter = 50, errorType = 'relative' }) {
  const f = (x) => evaluateMath(expr, { x });
  const fa = f(a);
  const fb = f(b);

  if (fa === null || fb === null) {
    return { success: false, error: 'No se pudo evaluar la función en los límites iniciales.' };
  }

  if (fa * fb > 0) {
    return {
      success: false,
      error: `No hay cambio de signo en el intervalo: f(${a}) = ${fa.toFixed(4)}, f(${b}) = ${fb.toFixed(4)}. El método de bisección requiere que f(a)·f(b) < 0.`
    };
  }

  const iterations = [];
  let currentA = a;
  let currentB = b;
  let prevXr = null;
  let xr = currentA;
  let converged = false;
  let finalError = 0;

  for (let i = 1; i <= maxIter; i++) {
    xr = (currentA + currentB) / 2;
    const fxr = f(xr);
    const faCurr = f(currentA);

    let absError = prevXr !== null ? Math.abs(xr - prevXr) : Math.abs(currentB - currentA);
    let relError = prevXr !== null && xr !== 0 ? (Math.abs(xr - prevXr) / Math.abs(xr)) * 100 : 100;
    let evalError = errorType === 'relative' ? relError : absError;

    iterations.push({
      iter: i,
      a: Number(currentA.toFixed(7)),
      b: Number(currentB.toFixed(7)),
      xr: Number(xr.toFixed(7)),
      fxr: fxr !== null ? Number(fxr.toFixed(7)) : 0,
      absError: Number(absError.toFixed(7)),
      relError: Number(relError.toFixed(5))
    });

    if (i > 1 && evalError < tol) {
      converged = true;
      finalError = evalError;
      break;
    }

    if (Math.abs(fxr) < 1e-14) {
      converged = true;
      finalError = 0;
      break;
    }

    if (faCurr * fxr < 0) {
      currentB = xr;
    } else {
      currentA = xr;
    }

    prevXr = xr;
    finalError = evalError;
  }

  return {
    success: true,
    root: xr,
    iterationsCount: iterations.length,
    converged,
    finalError,
    finalInterval: [currentA, currentB],
    iterations,
    f
  };
}

// 2. FALSA POSICIÓN
export function solveFalsePosition({ expr, a, b, tol = 1e-5, maxIter = 50 }) {
  const f = (x) => evaluateMath(expr, { x });
  const fa = f(a);
  const fb = f(b);

  if (fa === null || fb === null) {
    return { success: false, error: 'No se pudo evaluar la función en los límites indicados.' };
  }

  if (fa * fb > 0) {
    return {
      success: false,
      error: `No hay cambio de signo en el intervalo: f(${a}) = ${fa.toFixed(4)}, f(${b}) = ${fb.toFixed(4)}. Falsa posición requiere f(a)·f(b) < 0.`
    };
  }

  const iterations = [];
  let currentA = a;
  let currentB = b;
  let prevXr = null;
  let xr = currentA;
  let converged = false;
  let finalError = 0;

  for (let i = 1; i <= maxIter; i++) {
    const fA = f(currentA);
    const fB = f(currentB);
    const denom = fB - fA;

    if (Math.abs(denom) < 1e-15) {
      return { success: false, error: 'División por cero en el denominador (f(b) - f(a) ≈ 0).' };
    }

    xr = currentB - (fB * (currentA - currentB)) / (fA - fB);
    const fxr = f(xr);

    let error = prevXr !== null && xr !== 0 ? (Math.abs(xr - prevXr) / Math.abs(xr)) * 100 : 100;

    iterations.push({
      iter: i,
      a: Number(currentA.toFixed(7)),
      b: Number(currentB.toFixed(7)),
      xr: Number(xr.toFixed(7)),
      fa: Number(fA.toFixed(7)),
      fb: Number(fB.toFixed(7)),
      fxr: fxr !== null ? Number(fxr.toFixed(7)) : 0,
      error: Number(error.toFixed(5))
    });

    if (i > 1 && error < tol) {
      converged = true;
      finalError = error;
      break;
    }

    if (Math.abs(fxr) < 1e-14) {
      converged = true;
      finalError = 0;
      break;
    }

    if (fA * fxr < 0) {
      currentB = xr;
    } else {
      currentA = xr;
    }

    prevXr = xr;
    finalError = error;
  }

  return {
    success: true,
    root: xr,
    iterationsCount: iterations.length,
    converged,
    finalError,
    iterations,
    f
  };
}

// 3. SECANTE
export function solveSecant({ expr, x0, x1, tol = 1e-5, maxIter = 50 }) {
  const f = (x) => evaluateMath(expr, { x });
  const iterations = [];
  let prevX = x0;
  let currX = x1;
  let converged = false;
  let finalError = 0;

  for (let i = 1; i <= maxIter; i++) {
    const fPrev = f(prevX);
    const fCurr = f(currX);

    if (fPrev === null || fCurr === null) {
      return { success: false, error: 'Error evaluando la función en los valores iterados.' };
    }

    const denom = fCurr - fPrev;
    if (Math.abs(denom) < 1e-14) {
      return { success: false, error: `División por cero detectada: f(xi) ≈ f(xi-1) en la iteración ${i}.` };
    }

    const nextX = currX - (fCurr * (currX - prevX)) / denom;
    const fNext = f(nextX);
    const error = nextX !== 0 ? (Math.abs(nextX - currX) / Math.abs(nextX)) * 100 : Math.abs(nextX - currX);

    iterations.push({
      iter: i,
      xPrev: Number(prevX.toFixed(7)),
      xCurr: Number(currX.toFixed(7)),
      xNext: Number(nextX.toFixed(7)),
      fNext: fNext !== null ? Number(fNext.toFixed(7)) : 0,
      error: Number(error.toFixed(5))
    });

    if (error < tol || (fNext !== null && Math.abs(fNext) < 1e-14)) {
      converged = true;
      finalError = error;
      currX = nextX;
      break;
    }

    prevX = currX;
    currX = nextX;
    finalError = error;
  }

  return {
    success: true,
    root: currX,
    iterationsCount: iterations.length,
    converged,
    finalError,
    iterations,
    f
  };
}

// 4. NEWTON-RAPHSON
export function solveNewtonRaphson({ expr, derivExpr, x0, tol = 1e-5, maxIter = 50 }) {
  const f = (x) => evaluateMath(expr, { x });
  const symDeriv = derivExpr && derivExpr.trim() !== '' ? derivExpr : getDerivativeExpr(expr);

  const df = (x) => {
    if (symDeriv) {
      const res = evaluateMath(symDeriv, { x });
      if (res !== null) return res;
    }
    // Fallback aproximación por diferencias finitas
    const h = 1e-7;
    return (f(x + h) - f(x - h)) / (2 * h);
  };

  const iterations = [];
  let currX = x0;
  let converged = false;
  let finalError = 0;
  let lastDf = 0;

  for (let i = 1; i <= maxIter; i++) {
    const fx = f(currX);
    const dfx = df(currX);
    lastDf = dfx;

    if (fx === null || dfx === null) {
      return { success: false, error: 'Error evaluando la función o su derivada.' };
    }

    if (Math.abs(dfx) < 1e-12) {
      return {
        success: false,
        error: `Derivada nula o casi nula detectada en x = ${currX.toFixed(6)} (f'(x) = ${dfx}). Pendiente horizontal.`
      };
    }

    const nextX = currX - fx / dfx;
    const error = nextX !== 0 ? (Math.abs(nextX - currX) / Math.abs(nextX)) * 100 : Math.abs(nextX - currX);

    iterations.push({
      iter: i,
      xi: Number(currX.toFixed(7)),
      fxi: Number(fx.toFixed(7)),
      dfxi: Number(dfx.toFixed(7)),
      xNext: Number(nextX.toFixed(7)),
      error: Number(error.toFixed(5))
    });

    if (error < tol || Math.abs(fx) < 1e-14) {
      converged = true;
      finalError = error;
      currX = nextX;
      break;
    }

    currX = nextX;
    finalError = error;
  }

  return {
    success: true,
    root: currX,
    iterationsCount: iterations.length,
    converged,
    finalError,
    lastDeriv: lastDf,
    derivativeUsed: symDeriv || 'Aproximación por diferencias finitas',
    iterations,
    f
  };
}

/* =========================================================
   B. MÉTODOS DE INTEGRACIÓN NUMÉRICA
========================================================= */

// 5. TRAPECIO
export function solveTrapezoidal({ expr, a, b, n, points = null }) {
  let table = [];
  let totalIntegral = 0;

  if (points && points.length >= 2) {
    // Modo datos experimentales
    const sorted = [...points].sort((p1, p2) => p1.x - p2.x);
    let accum = 0;

    table.push({
      i: 0,
      xi: sorted[0].x,
      fxi: sorted[0].y,
      partialArea: 0,
      accumArea: 0
    });

    for (let i = 1; i < sorted.length; i++) {
      const h = sorted[i].x - sorted[i - 1].x;
      const partial = ((sorted[i - 1].y + sorted[i].y) / 2) * h;
      accum += partial;
      table.push({
        i,
        xi: sorted[i].x,
        fxi: sorted[i].y,
        partialArea: Number(partial.toFixed(6)),
        accumArea: Number(accum.toFixed(6))
      });
    }

    return {
      success: true,
      integral: accum,
      subintervals: sorted.length - 1,
      isUniform: false,
      table
    };
  }

  // Modo función matemática
  const f = (x) => evaluateMath(expr, { x });
  const h = (b - a) / n;
  let accum = 0;

  const y0 = f(a);
  if (y0 === null) return { success: false, error: `Error evaluando f(a) en x = ${a}` };

  table.push({
    i: 0,
    xi: Number(a.toFixed(6)),
    fxi: Number(y0.toFixed(6)),
    partialArea: 0,
    accumArea: 0
  });

  let prevY = y0;
  for (let i = 1; i <= n; i++) {
    const xi = a + i * h;
    const yi = f(xi);
    if (yi === null) return { success: false, error: `Error evaluando f(x) en x = ${xi}` };

    const partial = ((prevY + yi) / 2) * h;
    accum += partial;
    table.push({
      i,
      xi: Number(xi.toFixed(6)),
      fxi: Number(yi.toFixed(6)),
      partialArea: Number(partial.toFixed(6)),
      accumArea: Number(accum.toFixed(6))
    });
    prevY = yi;
  }

  return {
    success: true,
    integral: accum,
    subintervals: n,
    h: Number(h.toFixed(6)),
    isUniform: true,
    table,
    f
  };
}

// 6. SIMPSON 1/3 (Método clásico adicional para el curso)
export function solveSimpson13({ expr, a, b, n }) {
  if (n % 2 !== 0) {
    return { success: false, error: 'El método de Simpson 1/3 requiere que el número de subintervalos n sea par (múltiplo de 2).' };
  }

  const f = (x) => evaluateMath(expr, { x });
  const h = (b - a) / n;
  let sumOdds = 0;
  let sumEvens = 0;
  const table = [];

  const y0 = f(a);
  table.push({ i: 0, xi: Number(a.toFixed(6)), fxi: Number(y0.toFixed(6)), coeff: 1, weighted: Number(y0.toFixed(6)) });

  for (let i = 1; i < n; i++) {
    const xi = a + i * h;
    const yi = f(xi);
    const coeff = i % 2 === 0 ? 2 : 4;
    const weighted = coeff * yi;
    if (coeff === 4) sumOdds += yi;
    else sumEvens += yi;

    table.push({
      i,
      xi: Number(xi.toFixed(6)),
      fxi: Number(yi.toFixed(6)),
      coeff,
      weighted: Number(weighted.toFixed(6))
    });
  }

  const yn = f(b);
  table.push({ i: n, xi: Number(b.toFixed(6)), fxi: Number(yn.toFixed(6)), coeff: 1, weighted: Number(yn.toFixed(6)) });

  const integral = (h / 3) * (y0 + 4 * sumOdds + 2 * sumEvens + yn);

  return {
    success: true,
    integral,
    subintervals: n,
    h: Number(h.toFixed(6)),
    table,
    f
  };
}

// 7. SIMPSON 1/8 (Regla cúbica / Bloque básico con factor h/8 o 3h/8)
export function solveSimpson18({ expr, a, b, n }) {
  if (n % 3 !== 0) {
    return { success: false, error: 'El método de Simpson 1/8 (cúbico) requiere que el número de subintervalos n sea múltiplo de 3.' };
  }

  const f = (x) => evaluateMath(expr, { x });
  const h = (b - a) / n;
  const table = [];
  let accumWeighted = 0;

  for (let i = 0; i <= n; i++) {
    const xi = a + i * h;
    const yi = f(xi);
    if (yi === null) return { success: false, error: `Error evaluando función en x = ${xi}` };

    let coeff = 3;
    if (i === 0 || i === n) coeff = 1;
    else if (i % 3 === 0) coeff = 2;

    const weighted = coeff * yi;
    accumWeighted += weighted;

    table.push({
      i,
      xi: Number(xi.toFixed(6)),
      fxi: Number(yi.toFixed(6)),
      coeff,
      weighted: Number(weighted.toFixed(6)),
      accumIntegral: Number(((3 * h / 8) * accumWeighted).toFixed(6))
    });
  }

  const integral = (3 * h / 8) * accumWeighted;

  return {
    success: true,
    integral,
    subintervals: n,
    h: Number(h.toFixed(6)),
    table,
    f
  };
}

// 8. SIMPSON 3/8 (Regla Compuesta 3/8: Factor (3h/8) * [f0 + 3f1 + 3f2 + 2f3 + ... + fn])
export function solveSimpson38({ expr, a, b, n }) {
  if (n % 3 !== 0) {
    return { success: false, error: 'Simpson 3/8 compuesto requiere que el número de subintervalos n sea múltiplo de 3 (ej: 3, 6, 9, 12, etc.).' };
  }

  const f = (x) => evaluateMath(expr, { x });
  const h = (b - a) / n;
  const table = [];

  const y0 = f(a);
  if (y0 === null) return { success: false, error: `Error evaluando f en x = ${a}` };

  table.push({
    i: 0,
    xi: Number(a.toFixed(6)),
    fxi: Number(y0.toFixed(6)),
    coeff: 1,
    weighted: Number(y0.toFixed(6))
  });

  let sum = y0;

  for (let i = 1; i < n; i++) {
    const xi = a + i * h;
    const yi = f(xi);
    if (yi === null) return { success: false, error: `Error evaluando f en x = ${xi}` };

    const coeff = (i % 3 === 0) ? 2 : 3;
    const weighted = coeff * yi;
    sum += weighted;

    table.push({
      i,
      xi: Number(xi.toFixed(6)),
      fxi: Number(yi.toFixed(6)),
      coeff,
      weighted: Number(weighted.toFixed(6))
    });
  }

  const yn = f(b);
  if (yn === null) return { success: false, error: `Error evaluando f en x = ${b}` };

  sum += yn;
  table.push({
    i: n,
    xi: Number(b.toFixed(6)),
    fxi: Number(yn.toFixed(6)),
    coeff: 1,
    weighted: Number(yn.toFixed(6))
  });

  const integral = (3 * h / 8) * sum;

  return {
    success: true,
    integral,
    subintervals: n,
    h: Number(h.toFixed(6)),
    table,
    f
  };
}

/* =========================================================
   C. INTERPOLACIÓN Y REGRESIÓN
========================================================= */

// 9. INTERPOLACIÓN DIRECTA (Lagrange y Newton Diferencias Divididas)
export function solveInterpolation({ points, targetX, method = 'lagrange' }) {
  if (!points || points.length < 2) {
    return { success: false, error: 'Se requieren al menos 2 puntos para interpolar.' };
  }

  const n = points.length;
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);

  // Verificar valores únicos de X
  const uniqueX = new Set(xs);
  if (uniqueX.size !== xs.length) {
    return { success: false, error: 'Los puntos no pueden tener coordenadas X duplicadas.' };
  }

  // Lagrange
  let lagrangeResult = 0;
  for (let i = 0; i < n; i++) {
    let term = ys[i];
    for (let j = 0; j < n; j++) {
      if (i !== j) {
        term *= (targetX - xs[j]) / (xs[i] - xs[j]);
      }
    }
    lagrangeResult += term;
  }

  // Newton diferencias divididas
  const dTable = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    dTable[i][0] = ys[i];
  }

  for (let j = 1; j < n; j++) {
    for (let i = 0; i < n - j; i++) {
      dTable[i][j] = (dTable[i + 1][j - 1] - dTable[i][j - 1]) / (xs[i + j] - xs[i]);
    }
  }

  // Evaluar Newton en targetX
  let newtonResult = dTable[0][0];
  let xTerm = 1;
  for (let j = 1; j < n; j++) {
    xTerm *= (targetX - xs[j - 1]);
    newtonResult += dTable[0][j] * xTerm;
  }

  // Generar representación simbólica del polinomio Newton
  let polyString = `${dTable[0][0].toFixed(4)}`;
  for (let j = 1; j < n; j++) {
    const coef = dTable[0][j];
    if (Math.abs(coef) > 1e-6) {
      let terms = '';
      for (let k = 0; k < j; k++) {
        terms += `(x - ${xs[k]})`;
      }
      polyString += ` ${coef >= 0 ? '+' : '-'} ${Math.abs(coef).toFixed(4)}${terms}`;
    }
  }

  return {
    success: true,
    interpolatedValue: method === 'lagrange' ? lagrangeResult : newtonResult,
    targetX,
    degree: n - 1,
    polynomialString: polyString,
    dividedDifferencesTable: dTable,
    points,
    evalFunction: (val) => {
      let res = dTable[0][0];
      let t = 1;
      for (let j = 1; j < n; j++) {
        t *= (val - xs[j - 1]);
        res += dTable[0][j] * t;
      }
      return res;
    }
  };
}

// 10. REGRESIÓN POR MÍNIMOS CUADRADOS (Lineal, Polinómico, Exponencial, Potencial)
export function solveLeastSquares({ points, modelType = 'linear', polyDegree = 2 }) {
  if (!points || points.length < 2) {
    return { success: false, error: 'Se requieren al menos 2 puntos para calcular la regresión.' };
  }

  const n = points.length;
  let xs = points.map((p) => p.x);
  let ys = points.map((p) => p.y);

  if (modelType === 'exponential') {
    // y = a * e^(b*x) => ln(y) = ln(a) + b*x
    for (let y of ys) {
      if (y <= 0) {
        return { success: false, error: 'La regresión exponencial requiere que todos los valores Y sean estrictamente mayores a cero.' };
      }
    }
    const logYs = ys.map((y) => Math.log(y));
    const lin = solvePolynomialRegression(xs, logYs, 1);
    const b = lin.coeffs[1];
    const a = Math.exp(lin.coeffs[0]);

    const predict = (x) => a * Math.exp(b * x);
    const table = buildResidualTable(points, predict);
    const metrics = computeMetrics(points, predict);

    return {
      success: true,
      modelType,
      equation: `y = ${a.toFixed(4)} · e^(${b.toFixed(4)}x)`,
      coeffs: { a, b },
      ...metrics,
      table,
      predict
    };
  }

  if (modelType === 'power') {
    // y = a * x^b => ln(y) = ln(a) + b * ln(x)
    for (let i = 0; i < n; i++) {
      if (xs[i] <= 0 || ys[i] <= 0) {
        return { success: false, error: 'La regresión potencial requiere que todos los valores X e Y sean mayores a cero.' };
      }
    }
    const logXs = xs.map((x) => Math.log(x));
    const logYs = ys.map((y) => Math.log(y));
    const lin = solvePolynomialRegression(logXs, logYs, 1);
    const b = lin.coeffs[1];
    const a = Math.exp(lin.coeffs[0]);

    const predict = (x) => (x > 0 ? a * Math.pow(x, b) : 0);
    const table = buildResidualTable(points, predict);
    const metrics = computeMetrics(points, predict);

    return {
      success: true,
      modelType,
      equation: `y = ${a.toFixed(4)} · x^(${b.toFixed(4)})`,
      coeffs: { a, b },
      ...metrics,
      table,
      predict
    };
  }

  // Lineal o Polinómico
  const degree = modelType === 'linear' ? 1 : Math.min(polyDegree, n - 1);
  const polyRes = solvePolynomialRegression(xs, ys, degree);

  if (!polyRes.success) {
    return polyRes;
  }

  const coeffs = polyRes.coeffs; // [a0, a1, a2, ...]
  const predict = (x) => {
    let sum = 0;
    for (let i = 0; i < coeffs.length; i++) {
      sum += coeffs[i] * Math.pow(x, i);
    }
    return sum;
  };

  let eq = `y = ${coeffs[0].toFixed(4)}`;
  for (let i = 1; i < coeffs.length; i++) {
    eq += ` ${coeffs[i] >= 0 ? '+' : '-'} ${Math.abs(coeffs[i]).toFixed(4)}x${i > 1 ? `^${i}` : ''}`;
  }

  const table = buildResidualTable(points, predict);
  const metrics = computeMetrics(points, predict);

  return {
    success: true,
    modelType,
    degree,
    equation: eq,
    coeffs,
    ...metrics,
    table,
    predict
  };
}

function solvePolynomialRegression(xs, ys, degree) {
  const m = degree + 1;
  const matrixA = Array.from({ length: m }, () => Array(m).fill(0));
  const vectorB = Array(m).fill(0);
  const n = xs.length;

  for (let row = 0; row < m; row++) {
    for (let col = 0; col < m; col++) {
      let sum = 0;
      for (let k = 0; k < n; k++) {
        sum += Math.pow(xs[k], row + col);
      }
      matrixA[row][col] = sum;
    }

    let sumB = 0;
    for (let k = 0; k < n; k++) {
      sumB += ys[k] * Math.pow(xs[k], row);
    }
    vectorB[row] = sumB;
  }

  // Resolver sistema lineal Gauss-Jordan
  const coeffs = solveLinearSystem(matrixA, vectorB);
  if (!coeffs) {
    return { success: false, error: 'Matriz singular: no se pudo resolver el sistema de mínimos cuadrados.' };
  }

  return { success: true, coeffs };
}

function solveLinearSystem(A, b) {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);

  for (let i = 0; i < n; i++) {
    // Pivoteo parcial
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(M[k][i]) > Math.abs(M[maxRow][i])) {
        maxRow = k;
      }
    }
    const temp = M[i];
    M[i] = M[maxRow];
    M[maxRow] = temp;

    if (Math.abs(M[i][i]) < 1e-12) return null;

    for (let k = i + 1; k < n; k++) {
      const factor = M[k][i] / M[i][i];
      for (let j = i; j <= n; j++) {
        M[k][j] -= factor * M[i][j];
      }
    }
  }

  const x = Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let sum = M[i][n];
    for (let j = i + 1; j < n; j++) {
      sum -= M[i][j] * x[j];
    }
    x[i] = sum / M[i][i];
  }
  return x;
}

function computeMetrics(points, predict) {
  const n = points.length;
  const meanY = points.reduce((acc, p) => acc + p.y, 0) / n;
  let ssTot = 0;
  let ssRes = 0;
  let sumRes = 0;

  for (const p of points) {
    const yHat = predict(p.x);
    const res = p.y - yHat;
    ssTot += Math.pow(p.y - meanY, 2);
    ssRes += Math.pow(res, 2);
    sumRes += res;
  }

  const r2 = ssTot !== 0 ? 1 - ssRes / ssTot : 1;
  const mse = ssRes / n;
  const rmse = Math.sqrt(mse);

  return {
    r2: Number(r2.toFixed(5)),
    mse: Number(mse.toFixed(6)),
    rmse: Number(rmse.toFixed(6)),
    sumResiduals: Number(sumRes.toFixed(6))
  };
}

function buildResidualTable(points, predict) {
  return points.map((p) => {
    const yEst = predict(p.x);
    const res = p.y - yEst;
    return {
      x: p.x,
      yExp: p.y,
      yEst: Number(yEst.toFixed(5)),
      residual: Number(res.toFixed(5)),
      residualSquared: Number((res * res).toFixed(6))
    };
  });
}

/* =========================================================
   D. OPTIMIZACIÓN
========================================================= */

// 11. SECCIÓN DORADA UNIVARIADA
export function solveGoldenSectionUnivariate({ expr, a, b, optType = 'minimize', tol = 1e-5, maxIter = 50 }) {
  const f = (x) => evaluateMath(expr, { x });
  const phi = (Math.sqrt(5) - 1) / 2; // ~0.6180339887

  let xl = a;
  let xu = b;
  let d = phi * (xu - xl);
  let x1 = xl + d;
  let x2 = xu - d;

  let f1 = f(x1);
  let f2 = f(x2);

  if (f1 === null || f2 === null) {
    return { success: false, error: 'No se pudo evaluar la función objetivo en los puntos de prueba.' };
  }

  const iterations = [];
  let iter = 1;
  let optimalX = (xl + xu) / 2;
  let converged = false;
  let finalError = 0;

  while (iter <= maxIter) {
    let error = (1 - phi) * Math.abs((xu - xl) / optimalX) * 100;

    iterations.push({
      iter,
      a: Number(xl.toFixed(6)),
      b: Number(xu.toFixed(6)),
      x1: Number(x1.toFixed(6)),
      x2: Number(x2.toFixed(6)),
      fx1: Number(f1.toFixed(6)),
      fx2: Number(f2.toFixed(6)),
      error: Number(error.toFixed(4))
    });

    if (error < tol) {
      converged = true;
      finalError = error;
      break;
    }

    const condition = optType === 'maximize' ? f1 > f2 : f1 < f2;

    if (condition) {
      xl = x2;
      x2 = x1;
      f2 = f1;
      x1 = xl + phi * (xu - xl);
      f1 = f(x1);
    } else {
      xu = x1;
      x1 = x2;
      f1 = f2;
      x2 = xu - phi * (xu - xl);
      f2 = f(x2);
    }

    optimalX = optType === 'maximize' ? (f1 > f2 ? x1 : x2) : (f1 < f2 ? x1 : x2);
    finalError = error;
    iter++;
  }

  const optF = f(optimalX);

  return {
    success: true,
    optimalX,
    optimalF: optF,
    optType,
    iterationsCount: iterations.length,
    converged,
    finalError,
    finalInterval: [xl, xu],
    iterations,
    f
  };
}

// 12. SECCIÓN DORADA MULTIVARIADA (Búsqueda por coordenadas cíclicas con sección dorada unidimensional)
export function solveGoldenSectionMultivariate({
  expr,
  xMin = -5,
  xMax = 5,
  yMin = -5,
  yMax = 5,
  initX = 0,
  initY = 0,
  optType = 'minimize',
  tol = 1e-4,
  maxIter = 30
}) {
  const f = (x, y) => evaluateMath(expr, { x, y });

  let currX = initX;
  let currY = initY;
  const iterations = [];
  let converged = false;
  let finalError = 0;

  for (let k = 1; k <= maxIter; k++) {
    const startX = currX;
    const startY = currY;

    // 1. Optimizar respecto a X manteniendo Y constante
    const fXOnly = (xVal) => f(xVal, currY);
    const phi = (Math.sqrt(5) - 1) / 2;
    let ax = xMin, bx = xMax;
    for (let step = 0; step < 25; step++) {
      const d = phi * (bx - ax);
      const x1 = ax + d;
      const x2 = bx - d;
      const val1 = fXOnly(x1);
      const val2 = fXOnly(x2);
      if (val1 === null || val2 === null) break;

      const cond = optType === 'maximize' ? val1 > val2 : val1 < val2;
      if (cond) ax = x2;
      else bx = x1;
    }
    currX = (ax + bx) / 2;

    // 2. Optimizar respecto a Y manteniendo X constante
    const fYOnly = (yVal) => f(currX, yVal);
    let ay = yMin, by = yMax;
    for (let step = 0; step < 25; step++) {
      const d = phi * (by - ay);
      const y1 = ay + d;
      const y2 = by - d;
      const val1 = fYOnly(y1);
      const val2 = fYOnly(y2);
      if (val1 === null || val2 === null) break;

      const cond = optType === 'maximize' ? val1 > val2 : val1 < val2;
      if (cond) ay = y2;
      else by = y1;
    }
    currY = (ay + by) / 2;

    const currF = f(currX, currY);
    const dist = Math.sqrt(Math.pow(currX - startX, 2) + Math.pow(currY - startY, 2));

    iterations.push({
      iter: k,
      x: Number(currX.toFixed(6)),
      y: Number(currY.toFixed(6)),
      fVal: currF !== null ? Number(currF.toFixed(6)) : 0,
      error: Number(dist.toFixed(6))
    });

    if (dist < tol) {
      converged = true;
      finalError = dist;
      break;
    }

    finalError = dist;
  }

  const optF = f(currX, currY);

  return {
    success: true,
    optimalPoint: { x: currX, y: currY },
    optimalF: optF,
    strategy: 'Coordenadas alternadas (Coordinate Descent) con Sección Dorada 1D',
    iterationsCount: iterations.length,
    converged,
    finalError,
    iterations,
    f
  };
}
