import React, { useState } from 'react';
import { MethodHeader } from '../components/MethodHeader';
import { ResultsCards } from '../components/ResultsCards';
import { FunctionGraph } from '../components/FunctionGraph';
import { IterationTable } from '../components/IterationTable';
import { NumberStepper } from '../components/NumberStepper';
import { FileUploadModule } from '../components/FileUploadModule';
import { solveInterpolation } from '../services/mathEngine';
import { Play, RotateCcw, AlertCircle, Plus, Trash2 } from 'lucide-react';

export function InterpolationPage({ onSaveToHistory }) {
  const [points, setPoints] = useState([
    { x: 1, y: 3 },
    { x: 2, y: 6 },
    { x: 3, y: 19 },
    { x: 5, y: 99 }
  ]);
  const [targetX, setTargetX] = useState(2.5);
  const [method, setMethod] = useState('lagrange'); // 'lagrange' | 'newton'

  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [graphData, setGraphData] = useState([]);

  const handlePointChange = (idx, field, val) => {
    const updated = [...points];
    updated[idx][field] = Number(val);
    setPoints(updated);
  };

  const addPoint = () => {
    const nextX = points.length > 0 ? points[points.length - 1].x + 1 : 0;
    setPoints([...points, { x: nextX, y: 0 }]);
  };

  const removePoint = (idx) => {
    if (points.length <= 2) return;
    setPoints(points.filter((_, i) => i !== idx));
  };

  const handleSolve = () => {
    setErrorMsg('');
    const res = solveInterpolation({ points, targetX, method });
    if (!res.success) {
      setErrorMsg(res.error);
      setResult(null);
      return;
    }
    setResult(res);

    // Curva interpolada
    const xs = points.map((p) => p.x);
    const minX = Math.min(...xs, targetX) - 0.5;
    const maxX = Math.max(...xs, targetX) + 0.5;
    const steps = 100;
    const dx = (maxX - minX) / steps;
    const pts = [];

    for (let i = 0; i <= steps; i++) {
      const curX = minX + i * dx;
      const curY = res.evalFunction(curX);
      pts.push({ x: Number(curX.toFixed(3)), y: Number(curY.toFixed(3)) });
    }
    setGraphData(pts);

    if (onSaveToHistory) {
      onSaveToHistory({
        method: 'Interpolación Directa',
        expr: `Puntos: ${points.length}, x=${targetX}`,
        result: `f(${targetX}) = ${res.interpolatedValue.toFixed(4)}`,
        iterations: points.length,
        date: new Date().toLocaleTimeString()
      });
    }
  };

  return (
    <div className="space-y-6">
      <MethodHeader
        name="Interpolación Directa (Lagrange y Newton)"
        category="C. Interpolación y Regresión"
        description="Construye un polinomio único de grado n-1 que pasa con exactitud por todos los puntos conocidos dados y predice el valor para cualquier abscisa x deseada."
        formula="P(x) = Σ yi · Li(x)  ó  P(x) = f[x0] + f[x0,x1](x-x0) + ..."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Puntos de entrada */}
        <div className="card-panel p-5 space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">
              1. Puntos conocidos (X, Y)
            </span>
            <button
              onClick={addPoint}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-[#18233C] text-xs text-[#2684FF] border border-[#2B3E68] hover:bg-[#203055]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Agregar punto</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto custom-scrollbar p-1">
            {points.map((p, idx) => (
              <div key={idx} className="flex items-center space-x-1 bg-[#091124] p-1.5 rounded-lg border border-[#1A2644]">
                <input
                  type="number"
                  value={p.x}
                  onChange={(e) => handlePointChange(idx, 'x', e.target.value)}
                  placeholder="X"
                  className="w-1/2 bg-transparent text-xs text-white font-mono px-1 outline-none text-center"
                />
                <span className="text-slate-500">:</span>
                <input
                  type="number"
                  value={p.y}
                  onChange={(e) => handlePointChange(idx, 'y', e.target.value)}
                  placeholder="Y"
                  className="w-1/2 bg-transparent text-xs text-[#00FFB2] font-mono px-1 outline-none text-center"
                />
                {points.length > 2 && (
                  <button onClick={() => removePoint(idx)} className="text-slate-500 hover:text-red-400 p-0.5">
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="pt-2">
            <FileUploadModule onDataLoaded={(pts) => setPoints(pts)} title="O importar puntos desde archivo" />
          </div>
        </div>

        {/* Parámetros de interpolación */}
        <div className="card-panel p-5 space-y-4">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">
            2. Configuración
          </span>
          <NumberStepper
            label="Valor a interpolar (x)"
            value={targetX}
            onChange={setTargetX}
            step={0.1}
          />
          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1">Método polinómico:</label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => setMethod('lagrange')}
                className={`py-2 rounded-lg border text-center font-medium transition-all ${
                  method === 'lagrange'
                    ? 'bg-[#1D3261] border-[#2684FF] text-white'
                    : 'bg-[#0B1329] border-[#1E2B4A] text-slate-400'
                }`}
              >
                Lagrange
              </button>
              <button
                onClick={() => setMethod('newton')}
                className={`py-2 rounded-lg border text-center font-medium transition-all ${
                  method === 'newton'
                    ? 'bg-[#1D3261] border-[#2684FF] text-white'
                    : 'bg-[#0B1329] border-[#1E2B4A] text-slate-400'
                }`}
              >
                Newton
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => {
            setPoints([
              { x: 1, y: 3 },
              { x: 2, y: 6 },
              { x: 3, y: 19 },
              { x: 5, y: 99 }
            ]);
            setTargetX(2.5);
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
          <span>Calcular Interpolación</span>
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
          root={null}
          converged={true}
          customCards={[
            {
              label: `f(${result.targetX}) interpolado`,
              value: result.interpolatedValue.toFixed(5),
              sub: `Método ${method}`
            },
            {
              label: 'Grado del polinomio',
              value: result.degree,
              sub: `${points.length} puntos base`
            }
          ]}
        />
      )}

      {result && (
        <div className="card-panel p-4 bg-[#091124] border border-[#1A2748]">
          <span className="text-xs text-slate-400 block mb-1">Polinomio de interpolación resultante:</span>
          <code className="text-sm text-[#00FFB2] font-mono break-all">{result.polynomialString}</code>
        </div>
      )}

      <FunctionGraph data={graphData} root={targetX} title="Curva polinómica interpolada y punto evaluado" />
    </div>
  );
}
