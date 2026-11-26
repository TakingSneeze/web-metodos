import React, { useState } from 'react';
import { MethodHeader } from '../components/MethodHeader';
import { ResultsCards } from '../components/ResultsCards';
import { FunctionGraph } from '../components/FunctionGraph';
import { IterationTable } from '../components/IterationTable';
import { NumberStepper } from '../components/NumberStepper';
import { solveFalsePosition, evaluateMath } from '../services/mathEngine';
import { Play, RotateCcw, AlertCircle, Info } from 'lucide-react';

export function FalsePositionPage({ onSaveToHistory }) {
  const [expr, setExpr] = useState('x^3 - 2*x - 5');
  const [a, setA] = useState(1);
  const [b, setB] = useState(3);
  const [tol, setTol] = useState(0.0001);
  const [maxIter, setMaxIter] = useState(50);

  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [graphPoints, setGraphPoints] = useState([]);

  const handleSolve = () => {
    setErrorMsg('');
    const res = solveFalsePosition({ expr, a, b, tol, maxIter });

    if (!res.success) {
      setErrorMsg(res.error);
      setResult(null);
      return;
    }

    setResult(res);

    // Generar curva continua
    const points = [];
    const minX = Math.min(a, b, res.root - 1);
    const maxX = Math.max(a, b, res.root + 1);
    const steps = 120;
    const dx = (maxX - minX) / steps;

    for (let i = 0; i <= steps; i++) {
      const curX = minX + i * dx;
      const yVal = evaluateMath(expr, { x: curX });
      if (yVal !== null && Math.abs(yVal) < 1000) {
        points.push({ x: Number(curX.toFixed(4)), y: Number(yVal.toFixed(4)) });
      }
    }
    setGraphPoints(points);

    if (onSaveToHistory) {
      onSaveToHistory({
        method: 'Falsa Posición',
        expr,
        result: `Raíz: ${res.root.toFixed(6)}`,
        iterations: res.iterationsCount,
        date: new Date().toLocaleTimeString()
      });
    }
  };

  const handleReset = () => {
    setExpr('x^3 - 2*x - 5');
    setA(1);
    setB(3);
    setTol(0.0001);
    setMaxIter(50);
    setErrorMsg('');
    setResult(null);
    setGraphPoints([]);
  };

  const tableColumns = [
    { key: 'iter', label: 'Iter' },
    { key: 'a', label: 'a' },
    { key: 'b', label: 'b' },
    { key: 'xr', label: 'xr' },
    { key: 'fa', label: 'f(a)' },
    { key: 'fb', label: 'f(b)' },
    { key: 'fxr', label: 'f(xr)' },
    { key: 'error', label: 'Error (%)' }
  ];

  return (
    <div className="space-y-6">
      <MethodHeader
        name="Método de Falsa Posición (Regula Falsi)"
        category="A. Búsqueda de Raíces"
        description="Aprovecha la magnitud de los valores de la función en los extremos para trazar una recta secante y encontrar una aproximación más rápida que la bisección."
        formula="xr = b - [f(b)·(a - b)] / [f(a) - f(b)]"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="card-panel p-5 space-y-3">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
            <span className="text-[#2684FF]">1.</span> Función f(x)
          </span>
          <input
            type="text"
            value={expr}
            onChange={(e) => setExpr(e.target.value)}
            placeholder="Ej: x^3 - 2*x - 5"
            className="w-full bg-[#080F22] border border-[#1E2C4F] rounded-xl px-3.5 py-2.5 text-white font-mono text-sm focus:border-[#2684FF] outline-none"
          />
          <p className="text-[11px] text-slate-500">Expresión matemática continua en el intervalo.</p>
        </div>

        <div className="card-panel p-5 space-y-3">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
            <span className="text-[#2684FF]">2.</span> Límites del Intervalo
          </span>
          <div className="grid grid-cols-2 gap-3">
            <NumberStepper label="Límite A" value={a} onChange={setA} step={0.5} />
            <NumberStepper label="Límite B" value={b} onChange={setB} step={0.5} />
          </div>
          <span className="text-[11px] text-slate-500 block">Requiere cambio de signo: f(a)·f(b) &lt; 0</span>
        </div>

        <div className="card-panel p-5 space-y-3">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
            <span className="text-[#2684FF]">3.</span> Parámetros
          </span>
          <div className="grid grid-cols-2 gap-3">
            <NumberStepper label="Máx. Iteraciones" value={maxIter} onChange={setMaxIter} min={1} max={500} />
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">Tolerancia (%)</label>
              <input
                type="number"
                value={tol}
                onChange={(e) => setTol(Number(e.target.value))}
                step={0.00001}
                className="w-full bg-[#0B1329] border border-[#1E2B4A] rounded-xl px-3 py-2 text-white font-mono text-sm outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <button
          onClick={handleReset}
          className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-[#131D38] hover:bg-[#1A284D] text-slate-300 text-xs font-medium border border-[#223359] transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Restablecer</span>
        </button>

        <button
          onClick={handleSolve}
          className="flex-1 max-w-sm flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#2684FF] to-[#7547FF] hover:brightness-110 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition-all"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Resolver Falsa Posición</span>
        </button>
      </div>

      {errorMsg && (
        <div className="flex items-start space-x-3 p-4 rounded-xl bg-red-950/40 border border-red-800 text-red-200 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-400 mt-0.5" />
          <div>
            <strong className="block font-semibold">Error al resolver:</strong>
            <span>{errorMsg}</span>
          </div>
        </div>
      )}

      {result && (
        <ResultsCards
          root={result.root}
          iterations={result.iterationsCount}
          finalError={result.finalError}
          converged={result.converged}
        />
      )}

      <FunctionGraph
        data={graphPoints}
        root={result?.root ?? null}
        title={`Gráfica de f(x) = ${expr}`}
      />

      {result && (
        <div className="card-panel p-5 space-y-2 border-l-4 border-l-[#2684FF]">
          <h4 className="text-sm font-semibold text-white flex items-center space-x-2">
            <Info className="w-4 h-4 text-[#2684FF]" />
            <span>Análisis del Resultado</span>
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            La falsa posición convergió en <strong>{result.iterationsCount}</strong> iteraciones hacia la raíz{' '}
            <code className="text-[#00FFB2] font-mono font-bold">x ≈ {result.root.toFixed(7)}</code> con un error relativo de{' '}
            <code className="text-amber-300 font-mono">{result.finalError.toFixed(5)}%</code>.
            A diferencia de la bisección, este método pondera la cercanía a cero de los extremos usando la pendiente de la recta secante.
          </p>
        </div>
      )}

      <IterationTable
        data={result?.iterations || []}
        columns={tableColumns}
        title="Tabla de Iteraciones — Falsa Posición"
      />
    </div>
  );
}
