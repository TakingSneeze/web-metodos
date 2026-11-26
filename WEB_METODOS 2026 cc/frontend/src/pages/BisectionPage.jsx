import React, { useState } from 'react';
import { MethodHeader } from '../components/MethodHeader';
import { ResultsCards } from '../components/ResultsCards';
import { FunctionGraph } from '../components/FunctionGraph';
import { IterationTable } from '../components/IterationTable';
import { NumberStepper } from '../components/NumberStepper';
import { solveBisection, evaluateMath } from '../services/mathEngine';
import { Play, RotateCcw, Trash2, AlertCircle, Info } from 'lucide-react';

export function BisectionPage({ onSaveToHistory }) {
  const [expr, setExpr] = useState('sin(x) - x/2');
  const [a, setA] = useState(-10);
  const [b, setB] = useState(10);
  const [tol, setTol] = useState(0.0001);
  const [maxIter, setMaxIter] = useState(50);
  const [errorType, setErrorType] = useState('relative'); // 'relative' o 'absolute'

  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [graphPoints, setGraphPoints] = useState([]);

  const handleSolve = () => {
    setErrorMsg('');
    const res = solveBisection({ expr, a, b, tol, maxIter, errorType });

    if (!res.success) {
      setErrorMsg(res.error);
      setResult(null);
      return;
    }

    setResult(res);

    // Generar puntos para la curva continua de f(x)
    const points = [];
    const minX = Math.min(a, b, res.root - 2);
    const maxX = Math.max(a, b, res.root + 2);
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
        method: 'Bisección',
        expr,
        result: `Raíz: ${res.root.toFixed(6)}`,
        iterations: res.iterationsCount,
        date: new Date().toLocaleTimeString()
      });
    }
  };

  const handleClear = () => {
    setExpr('');
    setErrorMsg('');
    setResult(null);
    setGraphPoints([]);
  };

  const handleReset = () => {
    setExpr('sin(x) - x/2');
    setA(-10);
    setB(10);
    setTol(0.0001);
    setMaxIter(50);
    setErrorMsg('');
    setResult(null);
    setGraphPoints([]);
  };

  const tableColumns = [
    { key: 'iter', label: 'Iteración' },
    { key: 'a', label: 'a' },
    { key: 'b', label: 'b' },
    { key: 'xr', label: 'xr' },
    { key: 'fxr', label: 'f(xr)' },
    { key: 'absError', label: 'Error absoluto' },
    { key: 'relError', label: 'Error relativo (%)' }
  ];

  return (
    <div className="space-y-6">
      <MethodHeader
        name="Método de Bisección"
        category="A. Búsqueda de Raíces"
        description="Divide repetidamente el intervalo a la mitad y selecciona el subintervalo donde la función f(x) cambia de signo mediante el teorema del valor intermedio."
        formula="xr = (a + b) / 2"
      />

      {/* Grid Superior: Entradas y Configuración */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Panel 1: Función */}
        <div className="card-panel p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
              <span className="text-[#2684FF]">1.</span> Función f(x)
            </span>
            <button
              onClick={handleClear}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-[#131D38] border border-[#1E2B4B] transition-colors"
            >
              Limpiar
            </button>
          </div>
          <div className="relative">
            <input
              type="text"
              value={expr}
              onChange={(e) => setExpr(e.target.value)}
              placeholder="Ej: sin(x) - x/2"
              className="w-full bg-[#080F22] border border-[#1E2C4F] rounded-xl px-3.5 py-2.5 text-white font-mono text-sm focus:border-[#2684FF] outline-none"
            />
          </div>
          <p className="text-[11px] text-slate-500">
            Admite funciones matemáticas: <code>sin(x)</code>, <code>cos(x)</code>, <code>exp(x)</code>, <code>log(x)</code>, <code>x^3</code>.
          </p>
        </div>

        {/* Panel 2: Límites del intervalo */}
        <div className="card-panel p-5 space-y-3">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
            <span className="text-[#2684FF]">2.</span> Límites del Intervalo
          </span>
          <div className="grid grid-cols-2 gap-3">
            <NumberStepper
              label="Límite A (inferior)"
              value={a}
              onChange={setA}
              step={0.5}
            />
            <NumberStepper
              label="Límite B (superior)"
              value={b}
              onChange={setB}
              step={0.5}
            />
          </div>
          <span className="text-[11px] text-slate-500 block">
            Condición requerida: f(a) · f(b) &lt; 0
          </span>
        </div>

        {/* Panel 3: Parámetros */}
        <div className="card-panel p-5 space-y-3">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
            <span className="text-[#2684FF]">3.</span> Parámetros de parada
          </span>
          <div className="grid grid-cols-2 gap-3">
            <NumberStepper
              label="Máx. Iteraciones"
              value={maxIter}
              onChange={setMaxIter}
              min={1}
              max={500}
              step={5}
            />
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">Tolerancia</label>
              <input
                type="number"
                value={tol}
                onChange={(e) => setTol(Number(e.target.value))}
                step={0.00001}
                className="w-full bg-[#0B1329] border border-[#1E2B4A] rounded-xl px-3 py-2 text-white font-mono text-sm outline-none"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2 pt-1 text-xs">
            <button
              onClick={() => setErrorType('relative')}
              className={`flex-1 py-1 rounded-lg border text-center transition-all ${
                errorType === 'relative'
                  ? 'bg-[#1D3261] border-[#2684FF] text-white font-semibold'
                  : 'bg-[#0A1226] border-[#1A2644] text-slate-400'
              }`}
            >
              Error Relativo %
            </button>
            <button
              onClick={() => setErrorType('absolute')}
              className={`flex-1 py-1 rounded-lg border text-center transition-all ${
                errorType === 'absolute'
                  ? 'bg-[#1D3261] border-[#2684FF] text-white font-semibold'
                  : 'bg-[#0A1226] border-[#1A2644] text-slate-400'
              }`}
            >
              Error Absoluto
            </button>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={handleReset}
          className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-[#131D38] hover:bg-[#1A284D] text-slate-300 text-xs font-medium border border-[#223359] transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Restablecer valores</span>
        </button>

        <button
          onClick={handleSolve}
          className="flex-1 max-w-sm flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#2684FF] to-[#7547FF] hover:brightness-110 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition-all"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Resolver Bisección</span>
        </button>
      </div>

      {/* Mensaje de error si falla */}
      {errorMsg && (
        <div className="flex items-start space-x-3 p-4 rounded-xl bg-red-950/40 border border-red-800 text-red-200 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-400 mt-0.5" />
          <div>
            <strong className="block font-semibold">Error al resolver:</strong>
            <span>{errorMsg}</span>
          </div>
        </div>
      )}

      {/* Resultados destacados */}
      {result && (
        <ResultsCards
          root={result.root}
          iterations={result.iterationsCount}
          finalError={result.finalError}
          converged={result.converged}
        />
      )}

      {/* Gráfica */}
      <FunctionGraph
        data={graphPoints}
        root={result?.root ?? null}
        title={`Gráfica de f(x) = ${expr}`}
      />

      {/* Análisis del resultado */}
      {result && (
        <div className="card-panel p-5 space-y-2 border-l-4 border-l-[#2684FF]">
          <h4 className="text-sm font-semibold text-white flex items-center space-x-2">
            <Info className="w-4 h-4 text-[#2684FF]" />
            <span>Análisis del Resultado</span>
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            El método de bisección convergió exitosamente en <strong>{result.iterationsCount}</strong> iteraciones.
            La raíz se localizó en <code className="text-[#00FFB2] font-mono font-bold">x ≈ {result.root.toFixed(7)}</code> dentro del intervalo final{' '}
            <code className="text-slate-200">[{result.finalInterval[0].toFixed(5)}, {result.finalInterval[1].toFixed(5)}]</code> con un error de{' '}
            <code className="text-amber-300 font-mono">{result.finalError.toFixed(5)}{errorType === 'relative' ? '%' : ''}</code>.
            Dado que la bisección reduce el intervalo exactamente a la mitad en cada paso, la convergencia es lineal y garantizada siempre que haya cambio de signo inicial.
          </p>
        </div>
      )}

      {/* Tabla de Iteraciones */}
      <IterationTable
        data={result?.iterations || []}
        columns={tableColumns}
        title="Tabla de Iteraciones — Bisección"
      />
    </div>
  );
}
