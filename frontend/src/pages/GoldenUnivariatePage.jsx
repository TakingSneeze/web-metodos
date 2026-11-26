import React, { useState } from 'react';
import { MethodHeader } from '../components/MethodHeader';
import { ResultsCards } from '../components/ResultsCards';
import { FunctionGraph } from '../components/FunctionGraph';
import { IterationTable } from '../components/IterationTable';
import { NumberStepper } from '../components/NumberStepper';
import { solveGoldenSectionUnivariate, evaluateMath } from '../services/mathEngine';
import { Play, RotateCcw, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';

export function GoldenUnivariatePage({ onSaveToHistory }) {
  const [expr, setExpr] = useState('2*sin(x) - x^2/10');
  const [a, setA] = useState(0);
  const [b, setB] = useState(4);
  const [optType, setOptType] = useState('maximize'); // 'maximize' | 'minimize'
  const [tol, setTol] = useState(0.0001);
  const [maxIter, setMaxIter] = useState(40);

  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [graphPoints, setGraphPoints] = useState([]);

  const handleSolve = () => {
    setErrorMsg('');
    const res = solveGoldenSectionUnivariate({ expr, a, b, optType, tol, maxIter });
    if (!res.success) {
      setErrorMsg(res.error);
      setResult(null);
      return;
    }
    setResult(res);

    const pts = [];
    const steps = 100;
    const dx = (b - a) / steps;
    for (let i = 0; i <= steps; i++) {
      const curX = a + i * dx;
      const val = evaluateMath(expr, { x: curX });
      if (val !== null) pts.push({ x: Number(curX.toFixed(4)), y: Number(val.toFixed(4)) });
    }
    setGraphPoints(pts);

    if (onSaveToHistory) {
      onSaveToHistory({
        method: 'Sección Dorada 1D',
        expr,
        result: `${optType === 'maximize' ? 'Máx' : 'Mín'}: x=${res.optimalX.toFixed(5)}, f=${res.optimalF.toFixed(5)}`,
        iterations: res.iterationsCount,
        date: new Date().toLocaleTimeString()
      });
    }
  };

  const tableColumns = [
    { key: 'iter', label: 'Iter' },
    { key: 'a', label: 'a (inferior)' },
    { key: 'b', label: 'b (superior)' },
    { key: 'x1', label: 'x1 (áureo 1)' },
    { key: 'x2', label: 'x2 (áureo 2)' },
    { key: 'fx1', label: 'f(x1)' },
    { key: 'fx2', label: 'f(x2)' },
    { key: 'error', label: 'Error (%)' }
  ];

  return (
    <div className="space-y-6">
      <MethodHeader
        name="Sección Dorada Univariada"
        category="D. Optimización"
        description="Encuentra el máximo o mínimo de una función unimodal en un intervalo [a, b] reduciendo la incertidumbre mediante la proporción áurea φ ≈ 0.618033."
        formula="d = (φ - 1)·(b - a), x1 = a + d, x2 = b - d"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="card-panel p-5 space-y-3">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">1. Función f(x)</span>
          <input
            type="text"
            value={expr}
            onChange={(e) => setExpr(e.target.value)}
            className="w-full bg-[#080F22] border border-[#1E2C4F] rounded-xl px-3.5 py-2.5 text-white font-mono text-sm focus:border-[#2684FF] outline-none"
          />
        </div>

        <div className="card-panel p-5 space-y-3">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">2. Intervalo de Búsqueda</span>
          <div className="grid grid-cols-2 gap-3">
            <NumberStepper label="Límite a" value={a} onChange={setA} step={0.5} />
            <NumberStepper label="Límite b" value={b} onChange={setB} step={0.5} />
          </div>
        </div>

        <div className="card-panel p-5 space-y-3">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">3. Objetivo & Parámetros</span>
          <div className="flex items-center space-x-2 text-xs mb-2">
            <button
              onClick={() => setOptType('maximize')}
              className={`flex-1 py-1.5 rounded-lg border flex items-center justify-center space-x-1 transition-all ${
                optType === 'maximize'
                  ? 'bg-[#1D3261] border-[#2684FF] text-white font-semibold'
                  : 'bg-[#0A1226] border-[#1A2644] text-slate-400'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Maximizar</span>
            </button>
            <button
              onClick={() => setOptType('minimize')}
              className={`flex-1 py-1.5 rounded-lg border flex items-center justify-center space-x-1 transition-all ${
                optType === 'minimize'
                  ? 'bg-[#1D3261] border-[#2684FF] text-white font-semibold'
                  : 'bg-[#0A1226] border-[#1A2644] text-slate-400'
              }`}
            >
              <TrendingDown className="w-3.5 h-3.5 text-blue-400" />
              <span>Minimizar</span>
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <NumberStepper label="Máx. Iter" value={maxIter} onChange={setMaxIter} min={1} max={300} />
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">Tolerancia (%)</label>
              <input
                type="number"
                value={tol}
                onChange={(e) => setTol(Number(e.target.value))}
                step={0.0001}
                className="w-full bg-[#0B1329] border border-[#1E2B4A] rounded-xl px-3 py-2 text-white font-mono text-sm outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => {
            setExpr('2*sin(x) - x^2/10');
            setA(0);
            setB(4);
            setOptType('maximize');
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
          <span>Optimizar Función</span>
        </button>
      </div>

      {errorMsg && (
        <div className="flex items-start space-x-3 p-4 rounded-xl bg-red-950/40 border border-red-800 text-red-200 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-400 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {result && (
        <ResultsCards
          optimalPoint={result.optimalX}
          optimalF={result.optimalF}
          iterations={result.iterationsCount}
          finalError={result.finalError}
          converged={result.converged}
        />
      )}

      <FunctionGraph data={graphPoints} root={result?.optimalX ?? null} title="Función objetivo y punto óptimo localizado" />

      <IterationTable
        data={result?.iterations || []}
        columns={tableColumns}
        title="Tabla de Reducción Áurea — Sección Dorada 1D"
      />
    </div>
  );
}
