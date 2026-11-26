import React, { useState } from 'react';
import { MethodHeader } from '../components/MethodHeader';
import { ResultsCards } from '../components/ResultsCards';
import { FunctionGraph } from '../components/FunctionGraph';
import { IterationTable } from '../components/IterationTable';
import { NumberStepper } from '../components/NumberStepper';
import { solveNewtonRaphson, evaluateMath, getDerivativeExpr } from '../services/mathEngine';
import { Play, RotateCcw, AlertCircle, Info, Wand2 } from 'lucide-react';

export function NewtonRaphsonPage({ onSaveToHistory }) {
  const [expr, setExpr] = useState('x^3 - 2*x - 5');
  const [derivExpr, setDerivExpr] = useState('');
  const [x0, setX0] = useState(2);
  const [tol, setTol] = useState(0.0001);
  const [maxIter, setMaxIter] = useState(50);

  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [graphPoints, setGraphPoints] = useState([]);

  const handleComputeSymbolicDeriv = () => {
    const d = getDerivativeExpr(expr);
    if (d) setDerivExpr(d);
  };

  const handleSolve = () => {
    setErrorMsg('');
    const res = solveNewtonRaphson({ expr, derivExpr, x0, tol, maxIter });

    if (!res.success) {
      setErrorMsg(res.error);
      setResult(null);
      return;
    }

    setResult(res);

    const points = [];
    const minX = res.root - 2;
    const maxX = res.root + 2;
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
        method: 'Newton-Raphson',
        expr,
        result: `Raíz: ${res.root.toFixed(6)}`,
        iterations: res.iterationsCount,
        date: new Date().toLocaleTimeString()
      });
    }
  };

  const tableColumns = [
    { key: 'iter', label: 'Iteración' },
    { key: 'xi', label: 'xi' },
    { key: 'fxi', label: 'f(xi)' },
    { key: 'dfxi', label: "f'(xi)" },
    { key: 'xNext', label: 'x(i+1)' },
    { key: 'error', label: 'Error (%)' }
  ];

  return (
    <div className="space-y-6">
      <MethodHeader
        name="Método de Newton-Raphson"
        category="A. Búsqueda de Raíces"
        description="Utiliza la recta tangente y la primera derivada de la función para lograr una convergencia cuadrática hacia la raíz aproximada."
        formula="x(i+1) = xi - f(xi) / f'(xi)"
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

          <div className="pt-2">
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] text-slate-400">Derivada f'(x) (opcional/automática):</label>
              <button
                type="button"
                onClick={handleComputeSymbolicDeriv}
                className="text-[11px] text-[#2684FF] hover:underline flex items-center space-x-1"
              >
                <Wand2 className="w-3 h-3" />
                <span>Calcular simbólica</span>
              </button>
            </div>
            <input
              type="text"
              value={derivExpr}
              onChange={(e) => setDerivExpr(e.target.value)}
              placeholder="Ej: 3*x^2 - 2"
              className="w-full bg-[#080F22] border border-[#1E2C4F] rounded-xl px-3 py-2 text-white font-mono text-xs focus:border-[#2684FF] outline-none"
            />
          </div>
        </div>

        <div className="card-panel p-5 space-y-3">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
            <span className="text-[#2684FF]">2.</span> Valor inicial (x0)
          </span>
          <NumberStepper label="Estimación inicial x0" value={x0} onChange={setX0} step={0.5} />
          <span className="text-[11px] text-slate-500 block">
            Elige un punto cercano a la raíz para evitar divergencia o ciclos periódicos.
          </span>
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
            setExpr('x^3 - 2*x - 5');
            setDerivExpr('');
            setX0(2);
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
          <span>Resolver Newton-Raphson</span>
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
          customCards={[
            {
              label: "Última f'(x)",
              value: result.lastDeriv?.toFixed(4) ?? '-',
              sub: 'Pendiente en la raíz'
            }
          ]}
        />
      )}

      <FunctionGraph
        data={graphPoints}
        root={result?.root ?? null}
        title={`Gráfica f(x) = ${expr}`}
      />

      {result && (
        <div className="card-panel p-5 space-y-2 border-l-4 border-l-[#7547FF]">
          <h4 className="text-sm font-semibold text-white flex items-center space-x-2">
            <Info className="w-4 h-4 text-[#7547FF]" />
            <span>Análisis de Convergencia</span>
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Newton-Raphson exhibió convergencia cuadrática, hallando la raíz en tan solo{' '}
            <strong>{result.iterationsCount}</strong> iteraciones: <code className="text-[#00FFB2] font-mono font-bold">x ≈ {result.root.toFixed(7)}</code>.
            Derivada aplicada: <code className="text-[#A78BFA] font-mono">{result.derivativeUsed}</code>.
          </p>
        </div>
      )}

      <IterationTable
        data={result?.iterations || []}
        columns={tableColumns}
        title="Tabla de Iteraciones — Newton-Raphson"
      />
    </div>
  );
}
