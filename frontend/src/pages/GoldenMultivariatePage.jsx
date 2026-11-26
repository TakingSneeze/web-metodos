import React, { useState } from 'react';
import { MethodHeader } from '../components/MethodHeader';
import { ResultsCards } from '../components/ResultsCards';
import { IterationTable } from '../components/IterationTable';
import { NumberStepper } from '../components/NumberStepper';
import { solveGoldenSectionMultivariate } from '../services/mathEngine';
import { Play, RotateCcw, AlertCircle, Info, TrendingUp, TrendingDown } from 'lucide-react';

export function GoldenMultivariatePage({ onSaveToHistory }) {
  const [expr, setExpr] = useState('(x - 2)^2 + (y - 3)^2 + 1');
  const [initX, setInitX] = useState(0);
  const [initY, setInitY] = useState(0);
  const [xMin, setXMin] = useState(-5);
  const [xMax, setXMax] = useState(5);
  const [yMin, setYMin] = useState(-5);
  const [yMax, setYMax] = useState(5);
  const [optType, setOptType] = useState('minimize'); // 'minimize' | 'maximize'
  const [tol, setTol] = useState(0.0001);
  const [maxIter, setMaxIter] = useState(20);

  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSolve = () => {
    setErrorMsg('');
    const res = solveGoldenSectionMultivariate({
      expr,
      xMin,
      xMax,
      yMin,
      yMax,
      initX,
      initY,
      optType,
      tol,
      maxIter
    });

    if (!res.success) {
      setErrorMsg(res.error);
      setResult(null);
      return;
    }
    setResult(res);

    if (onSaveToHistory) {
      onSaveToHistory({
        method: 'Sección Dorada 2D',
        expr,
        result: `(${res.optimalPoint.x.toFixed(4)}, ${res.optimalPoint.y.toFixed(4)})`,
        iterations: res.iterationsCount,
        date: new Date().toLocaleTimeString()
      });
    }
  };

  const tableColumns = [
    { key: 'iter', label: 'Ciclo' },
    { key: 'x', label: 'Coordenada X' },
    { key: 'y', label: 'Coordenada Y' },
    { key: 'fVal', label: 'f(X, Y)' },
    { key: 'error', label: 'Distancia euclídea (Δr)' }
  ];

  return (
    <div className="space-y-6">
      <MethodHeader
        name="Sección Dorada Multivariada (Coordenadas Alternadas)"
        category="D. Optimización"
        description="Extiende la sección dorada a dos o más variables optimizando cíclicamente sobre cada coordenada direccional mediante búsquedas unidimensionales de sección áurea."
        formula="min/max f(x, y) alternando búsquedas áureas en ejes X y Y"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="card-panel p-5 space-y-3">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">
            1. Función f(x, y)
          </span>
          <input
            type="text"
            value={expr}
            onChange={(e) => setExpr(e.target.value)}
            className="w-full bg-[#080F22] border border-[#1E2C4F] rounded-xl px-3.5 py-2.5 text-white font-mono text-sm focus:border-[#2684FF] outline-none"
          />
          <p className="text-[11px] text-slate-500">Expresión con dos variables: <code>x</code> e <code>y</code>.</p>
        </div>

        <div className="card-panel p-5 space-y-3">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">
            2. Punto Inicial y Límites
          </span>
          <div className="grid grid-cols-2 gap-3">
            <NumberStepper label="X inicial" value={initX} onChange={setInitX} step={0.5} />
            <NumberStepper label="Y inicial" value={initY} onChange={setInitY} step={0.5} />
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
            <span>Rango X: [{xMin}, {xMax}]</span>
            <span>Rango Y: [{yMin}, {yMax}]</span>
          </div>
        </div>

        <div className="card-panel p-5 space-y-3">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">
            3. Estrategia & Tolerancia
          </span>
          <div className="flex items-center space-x-2 text-xs mb-1">
            <button
              onClick={() => setOptType('minimize')}
              className={`flex-1 py-1.5 rounded-lg border text-center transition-all ${
                optType === 'minimize'
                  ? 'bg-[#1D3261] border-[#2684FF] text-white font-semibold'
                  : 'bg-[#0A1226] border-[#1A2644] text-slate-400'
              }`}
            >
              Minimizar
            </button>
            <button
              onClick={() => setOptType('maximize')}
              className={`flex-1 py-1.5 rounded-lg border text-center transition-all ${
                optType === 'maximize'
                  ? 'bg-[#1D3261] border-[#2684FF] text-white font-semibold'
                  : 'bg-[#0A1226] border-[#1A2644] text-slate-400'
              }`}
            >
              Maximizar
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <NumberStepper label="Máx Ciclos" value={maxIter} onChange={setMaxIter} min={1} max={100} />
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Tolerancia</label>
              <input
                type="number"
                value={tol}
                onChange={(e) => setTol(Number(e.target.value))}
                step={0.0001}
                className="w-full bg-[#0B1329] border border-[#1E2B4A] rounded-xl px-3 py-2 text-white font-mono text-xs outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => {
            setExpr('(x - 2)^2 + (y - 3)^2 + 1');
            setInitX(0);
            setInitY(0);
            setOptType('minimize');
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
          <span>Optimizar Multivariable</span>
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
          optimalPoint={result.optimalPoint}
          optimalF={result.optimalF}
          iterations={result.iterationsCount}
          finalError={result.finalError}
          converged={result.converged}
          customCards={[
            {
              label: 'Estrategia',
              value: 'Búsqueda por Coordenadas',
              sub: 'Sección Áurea unidimensional'
            }
          ]}
        />
      )}

      {result && (
        <div className="card-panel p-5 space-y-2 border-l-4 border-l-[#7547FF]">
          <h4 className="text-sm font-semibold text-white flex items-center space-x-2">
            <Info className="w-4 h-4 text-[#7547FF]" />
            <span>Documentación de la Estrategia Multivariable</span>
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Se implementó el algoritmo de <strong>Descenso/Ascenso por Coordenadas Cíclicas</strong>, donde en cada ciclo se optimiza unidimensionalmente a lo largo del eje X usando la sección dorada clásica y luego a lo largo del eje Y. El algoritmo finalizó en <strong>{result.iterationsCount}</strong> ciclos, convergiendo a las coordenadas óptimas{' '}
            <code className="text-[#00FFB2] font-mono font-bold">({result.optimalPoint.x.toFixed(5)}, {result.optimalPoint.y.toFixed(5)})</code>{' '}
            con un valor de función evaluado en <code className="text-[#A78BFA] font-mono">f(x,y) = {result.optimalF.toFixed(5)}</code>.
          </p>
        </div>
      )}

      <IterationTable
        data={result?.iterations || []}
        columns={tableColumns}
        title="Historial de Pasos por Coordenadas — Sección Dorada 2D"
      />
    </div>
  );
}
