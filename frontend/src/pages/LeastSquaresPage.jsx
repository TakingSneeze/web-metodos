import React, { useState } from 'react';
import { MethodHeader } from '../components/MethodHeader';
import { ResultsCards } from '../components/ResultsCards';
import { FunctionGraph } from '../components/FunctionGraph';
import { IterationTable } from '../components/IterationTable';
import { NumberStepper } from '../components/NumberStepper';
import { FileUploadModule } from '../components/FileUploadModule';
import { solveLeastSquares } from '../services/mathEngine';
import { Play, RotateCcw, AlertCircle, Plus, Trash2 } from 'lucide-react';

export function LeastSquaresPage({ onSaveToHistory }) {
  const [points, setPoints] = useState([
    { x: 1, y: 2.1 },
    { x: 2, y: 3.9 },
    { x: 3, y: 6.2 },
    { x: 4, y: 8.1 },
    { x: 5, y: 9.8 }
  ]);
  const [modelType, setModelType] = useState('linear'); // 'linear' | 'poly' | 'exponential' | 'power'
  const [polyDegree, setPolyDegree] = useState(2);

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
    const res = solveLeastSquares({ points, modelType, polyDegree });
    if (!res.success) {
      setErrorMsg(res.error);
      setResult(null);
      return;
    }
    setResult(res);

    const xs = points.map((p) => p.x);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const padding = (maxX - minX) * 0.1 || 1;
    const startX = minX - padding;
    const endX = maxX + padding;
    const steps = 100;
    const dx = (endX - startX) / steps;
    const pts = [];

    for (let i = 0; i <= steps; i++) {
      const curX = startX + i * dx;
      const curY = res.predict(curX);
      pts.push({ x: Number(curX.toFixed(3)), y: Number(curY.toFixed(3)) });
    }
    setGraphData(pts);

    if (onSaveToHistory) {
      onSaveToHistory({
        method: 'Mínimos Cuadrados',
        expr: `${modelType} (R² = ${res.r2})`,
        result: res.equation,
        iterations: points.length,
        date: new Date().toLocaleTimeString()
      });
    }
  };

  const tableColumns = [
    { key: 'x', label: 'X' },
    { key: 'yExp', label: 'Y experimental' },
    { key: 'yEst', label: 'Y estimado' },
    { key: 'residual', label: 'Residuo (e)' },
    { key: 'residualSquared', label: 'Residuo² (e²)' }
  ];

  return (
    <div className="space-y-6">
      <MethodHeader
        name="Regresión por Mínimos Cuadrados"
        category="C. Interpolación y Regresión"
        description="Ajusta un modelo matemático minimizando la suma de los cuadrados de los residuos entre los valores experimentales y las estimaciones del modelo."
        formula="Minimizar S = Σ (yi - f(xi))²"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="card-panel p-5 space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">
              1. Datos Experimentales (X, Y)
            </span>
            <button
              onClick={addPoint}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-[#18233C] text-xs text-[#2684FF] border border-[#2B3E68] hover:bg-[#203055]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Agregar par</span>
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
            <FileUploadModule onDataLoaded={(pts) => setPoints(pts)} title="O subir datos en Excel (.xlsx) / CSV" />
          </div>
        </div>

        <div className="card-panel p-5 space-y-4">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">
            2. Modelo de Regresión
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { id: 'linear', label: 'Lineal' },
              { id: 'poly', label: 'Polinómico' },
              { id: 'exponential', label: 'Exponencial' },
              { id: 'power', label: 'Potencial' }
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setModelType(m.id)}
                className={`py-2 rounded-lg border text-center font-medium transition-all ${
                  modelType === m.id
                    ? 'bg-[#1D3261] border-[#2684FF] text-white'
                    : 'bg-[#0B1329] border-[#1E2B4A] text-slate-400'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {modelType === 'poly' && (
            <NumberStepper
              label="Grado del polinomio"
              value={polyDegree}
              onChange={setPolyDegree}
              min={2}
              max={6}
              step={1}
            />
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => {
            setPoints([
              { x: 1, y: 2.1 },
              { x: 2, y: 3.9 },
              { x: 3, y: 6.2 },
              { x: 4, y: 8.1 },
              { x: 5, y: 9.8 }
            ]);
            setModelType('linear');
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
          <span>Ajustar Modelo</span>
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
          equation={result.equation}
          r2={result.r2}
          converged={true}
          customCards={[
            {
              label: 'MSE (Error Cuadrático Medio)',
              value: result.mse.toFixed(5),
              sub: `RMSE: ${result.rmse.toFixed(4)}`
            },
            {
              label: 'Suma de residuos',
              value: result.sumResiduals.toFixed(5),
              sub: 'Tendencia cercana a 0'
            }
          ]}
        />
      )}

      <FunctionGraph data={graphData} title="Curva de regresión ajustada y dispersión experimental" />

      <IterationTable
        data={result?.table || []}
        columns={tableColumns}
        title="Análisis de Residuos por Mínimos Cuadrados"
      />
    </div>
  );
}
