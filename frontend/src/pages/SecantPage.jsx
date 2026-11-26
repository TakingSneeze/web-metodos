import React, { useState } from 'react';
import { MethodHeader } from '../components/MethodHeader';
import { ResultsCards } from '../components/ResultsCards';
import { FunctionGraph } from '../components/FunctionGraph';
import { IterationTable } from '../components/IterationTable';
import { NumberStepper } from '../components/NumberStepper';
import { solveSecant, evaluateMath } from '../services/mathEngine';
import { Play, RotateCcw, AlertCircle, Info } from 'lucide-react';

export function SecantPage({ onSaveToHistory }) {
  const [expr, setExpr] = useState('exp(-x) - x');
  const [x0, setX0] = useState(0);
  const [x1, setX1] = useState(1);
  const [tol, setTol] = useState(0.0001);
  const [maxIter, setMaxIter] = useState(50);

  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [graphPoints, setGraphPoints] = useState([]);

  const handleSolve = () => {
    setErrorMsg('');
    const res = solveSecant({ expr, x0, x1, tol, maxIter });

    if (!res.success) {
      setErrorMsg(res.error);
      setResult(null);
      return;
    }

    setResult(res);

    const points = [];
    const minX = Math.min(x0, x1, res.root - 1);
    const maxX = Math.max(x0, x1, res.root + 1);
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
        method: 'Secante',
        expr,
        result: `Raíz: ${res.root.toFixed(6)}`,
        iterations: res.iterationsCount,
        date: new Date().toLocaleTimeString()
      });
    }
  };

  const tableColumns = [
    { key: 'iter', label: 'Iteración' },
    { key: 'xPrev', label: 'x(i-1)' },
    { key: 'xCurr', label: 'x(i)' },
    { key: 'xNext', label: 'x(i+1)' },
    { key: 'fNext', label: 'f(x i+1)' },
    { key: 'error', label: 'Error (%)' }
  ];

  return (
    <div className="space-y-6">
      <MethodHeader
        name="Método de la Secante"
        category="A. Búsqueda de Raíces"
        description="Aproxima la derivada de Newton-Raphson mediante una diferencia dividida basada en dos valores iniciales, sin necesidad de calcular analíticamente la derivada."
        formula="x(i+1) = x(i) - [f(x_i)·(x_i - x_i-1)] / [f(x_i) - f(x_i-1)]"
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
            placeholder="Ej: exp(-x) - x"
            className="w-full bg-[#080F22] border border-[#1E2C4F] rounded-xl px-3.5 py-2.5 text-white font-mono text-sm focus:border-[#2684FF] outline-none"
          />
        </div>

        <div className="card-panel p-5 space-y-3">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
            <span className="text-[#2684FF]">2.</span> Puntos iniciales
          </span>
          <div className="grid grid-cols-2 gap-3">
            <NumberStepper label="x0 (inicial 1)" value={x0} onChange={setX0} step={0.5} />
            <NumberStepper label="x1 (inicial 2)" value={x1} onChange={setX1} step={0.5} />
          </div>
          <span className="text-[11px] text-slate-500 block">No requieren cambio de signo obligatorio.</span>
        </div>

        <div className="card-panel p-5 space-y-3">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
            <span className="text-[#2684FF]">3.</span> Parámetros
          </span>
          <div className="grid grid-cols-2 gap-3">
            <NumberStepper label="Máx. Iter" value={maxIter} onChange={setMaxIter} min={1} max={500} />
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
          onClick={() => {
            setExpr('exp(-x) - x');
            setX0(0);
            setX1(1);
            setTol(0.0001);
            setMaxIter(50);
            setResult(null);
            setErrorMsg('');
          }}
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
          <span>Resolver Secante</span>
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
        title={`Gráfica f(x) = ${expr}`}
      />

      <IterationTable
        data={result?.iterations || []}
        columns={tableColumns}
        title="Tabla de Iteraciones — Método de la Secante"
      />
    </div>
  );
}
