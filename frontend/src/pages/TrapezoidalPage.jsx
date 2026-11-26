import React, { useState } from 'react';
import { MethodHeader } from '../components/MethodHeader';
import { ResultsCards } from '../components/ResultsCards';
import { FunctionGraph } from '../components/FunctionGraph';
import { IterationTable } from '../components/IterationTable';
import { NumberStepper } from '../components/NumberStepper';
import { FileUploadModule } from '../components/FileUploadModule';
import { solveTrapezoidal, evaluateMath } from '../services/mathEngine';
import { Play, RotateCcw, AlertCircle, FileSpreadsheet } from 'lucide-react';

export function TrapezoidalPage({ onSaveToHistory }) {
  const [mode, setMode] = useState('function'); // 'function' | 'data'
  const [expr, setExpr] = useState('x^2 * exp(-x)');
  const [a, setA] = useState(0);
  const [b, setB] = useState(4);
  const [n, setN] = useState(10);
  const [loadedPoints, setLoadedPoints] = useState(null);

  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [graphPoints, setGraphPoints] = useState([]);

  const handleSolve = () => {
    setErrorMsg('');
    const res = solveTrapezoidal({
      expr,
      a,
      b,
      n,
      points: mode === 'data' ? loadedPoints : null
    });

    if (!res.success) {
      setErrorMsg(res.error);
      setResult(null);
      return;
    }

    setResult(res);

    // Gráfica
    if (mode === 'function') {
      const pts = [];
      const steps = 100;
      const dx = (b - a) / steps;
      for (let i = 0; i <= steps; i++) {
        const curX = a + i * dx;
        const val = evaluateMath(expr, { x: curX });
        if (val !== null) pts.push({ x: Number(curX.toFixed(4)), y: Number(val.toFixed(4)) });
      }
      setGraphPoints(pts);
    } else if (loadedPoints) {
      setGraphPoints(loadedPoints);
    }

    if (onSaveToHistory) {
      onSaveToHistory({
        method: 'Trapecio',
        expr: mode === 'function' ? expr : 'Datos experimentales',
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
    { key: 'partialArea', label: 'Área parcial' },
    { key: 'accumArea', label: 'Área acumulada' }
  ];

  return (
    <div className="space-y-6">
      <MethodHeader
        name="Regla del Trapecio"
        category="B. Integración Numérica"
        description="Aproxima el área bajo la curva f(x) descomponiendo el intervalo en n trapecios contiguos de base h."
        formula="I ≈ (h/2) · [f(x0) + 2·Σf(xi) + f(xn)]"
      />

      {/* Switch de modo */}
      <div className="flex items-center space-x-2 bg-[#0C152B] p-1.5 rounded-xl w-fit border border-[#1A2645]">
        <button
          onClick={() => setMode('function')}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            mode === 'function' ? 'bg-[#2684FF] text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Función Matemática
        </button>
        <button
          onClick={() => setMode('data')}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            mode === 'data' ? 'bg-[#2684FF] text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Datos Experimentales (.xlsx / .csv)
        </button>
      </div>

      {mode === 'function' ? (
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
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">3. Subintervalos</span>
            <NumberStepper label="Número de trapecios (n)" value={n} onChange={setN} min={1} max={1000} step={2} />
          </div>
        </div>
      ) : (
        <FileUploadModule onDataLoaded={setLoadedPoints} title="Cargar tabla de puntos (X, Y) para Trapecio" />
      )}

      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => {
            setExpr('x^2 * exp(-x)');
            setA(0);
            setB(4);
            setN(10);
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
          <span>Calcular Integral</span>
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
              label: 'Ancho h (Δx)',
              value: result.h !== undefined ? result.h.toFixed(4) : 'Variable',
              sub: 'Paso entre abscisas'
            }
          ]}
        />
      )}

      <FunctionGraph data={graphPoints} title="Perfil del área integrada" />

      <IterationTable
        data={result?.table || []}
        columns={tableColumns}
        title="Desarrollo de Trapecios e Integración Acumulada"
      />
    </div>
  );
}
