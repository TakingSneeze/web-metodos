import React, { useState } from 'react';
import { MethodHeader } from '../components/MethodHeader';
import { ResultsCards } from '../components/ResultsCards';
import { FunctionGraph } from '../components/FunctionGraph';
import { IterationTable } from '../components/IterationTable';
import { NumberStepper } from '../components/NumberStepper';
import { solveSimpson13, evaluateMath } from '../services/mathEngine';
import { Play, RotateCcw, AlertCircle } from 'lucide-react';

export function Simpson13Page({ onSaveToHistory }) {
  const [expr, setExpr] = useState('sin(x)');
  const [a, setA] = useState(0);
  const [b, setB] = useState(3.14159265);
  const [n, setN] = useState(6);

  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [graphPoints, setGraphPoints] = useState([]);

  const handleSolve = () => {
    setErrorMsg('');
    const res = solveSimpson13({ expr, a, b, n });
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
        method: 'Simpson 1/3',
        expr,
        result: `Integral: ${res.integral.toFixed(6)}`,
        iterations: res.subintervals,
        date: new Date().toLocaleTimeString()
      });
    }
  };

  const tableColumns = [
    { key: 'i', label: 'i' },
    { key: 'xi', label: 'xi' },
    { key: 'fxi', label: 'f(xi)' },
    { key: 'coeff', label: 'Coeficiente (1, 4, 2, ...)' },
    { key: 'weighted', label: 'Término ponderado' }
  ];

  return (
    <div className="space-y-6">
      <MethodHeader
        name="Regla Compuesta de Simpson 1/3"
        category="B. Integración Numérica"
        description="Aproxima la función por polinomios de segundo grado (parábolas) a través de pares de subintervalos contiguos (n debe ser par)."
        formula="I ≈ (h/3) · [f(x0) + 4·Σf_impares + 2·Σf_pares + f(xn)]"
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
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">2. Límites de Integración</span>
          <div className="grid grid-cols-2 gap-3">
            <NumberStepper label="Límite inferior a" value={a} onChange={setA} step={0.5} />
            <NumberStepper label="Límite superior b" value={b} onChange={setB} step={0.5} />
          </div>
        </div>

        <div className="card-panel p-5 space-y-3">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">3. Subintervalos (n par)</span>
          <NumberStepper label="Número de subintervalos n" value={n} onChange={setN} min={2} max={500} step={2} />
          <span className="text-[11px] text-amber-400 block font-mono">Restricción obligatoria: n par (2, 4, 6...)</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => {
            setExpr('sin(x)');
            setA(0);
            setB(3.14159265);
            setN(6);
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
          <span>Calcular Simpson 1/3</span>
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
          integral={result.integral}
          iterations={result.subintervals}
          converged={true}
          customCards={[
            {
              label: 'Ancho de paso h',
              value: result.h.toFixed(5),
              sub: 'h = (b - a) / n'
            }
          ]}
        />
      )}

      <FunctionGraph data={graphPoints} title="Curva f(x) e intervalo de integración" />

      <IterationTable
        data={result?.table || []}
        columns={tableColumns}
        title="Tabla de Ponderación — Simpson 1/3"
      />
    </div>
  );
}
