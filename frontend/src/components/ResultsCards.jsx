import React from 'react';
import { CheckCircle, AlertTriangle, Clock, RefreshCw, Crosshair, Percent } from 'lucide-react';

export function ResultsCards({
  root = null,
  iterations = null,
  finalError = null,
  converged = true,
  integral = null,
  equation = null,
  r2 = null,
  rmse = null,
  optimalPoint = null,
  optimalF = null,
  customCards = []
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {root !== null && (
        <div className="card-panel p-4 flex flex-col justify-between border-l-4 border-l-[#00FFB2]">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Raíz aproximada (xr)</span>
            <Crosshair className="w-4 h-4 text-[#00FFB2]" />
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-white truncate">
            {typeof root === 'number' ? root.toFixed(6) : root}
          </div>
          <span className="text-[10px] text-slate-400 mt-1">Intersección f(x) ≈ 0</span>
        </div>
      )}

      {integral !== null && (
        <div className="card-panel p-4 flex flex-col justify-between border-l-4 border-l-[#2684FF]">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Integral aproximada</span>
            <span className="text-sm font-serif text-[#2684FF]">∫</span>
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-white truncate">
            {typeof integral === 'number' ? integral.toFixed(6) : integral}
          </div>
          <span className="text-[10px] text-slate-400 mt-1">Área bajo la curva</span>
        </div>
      )}

      {equation !== null && (
        <div className="card-panel p-4 col-span-2 flex flex-col justify-between border-l-4 border-l-[#7547FF]">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Ecuación del modelo</span>
            <span className="text-xs text-[#7547FF] font-semibold">f(x)</span>
          </div>
          <div className="mt-2 text-base font-bold font-mono text-[#A78BFA] truncate">
            {equation}
          </div>
          <span className="text-[10px] text-slate-400 mt-1">Coeficientes ajustados</span>
        </div>
      )}

      {r2 !== null && (
        <div className="card-panel p-4 flex flex-col justify-between border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Coeficiente R²</span>
            <Percent className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-emerald-300">
            {(r2 * 100).toFixed(2)}%
          </div>
          <span className="text-[10px] text-slate-400 mt-1">Bondad de ajuste (R² = {r2})</span>
        </div>
      )}

      {optimalPoint !== null && (
        <div className="card-panel p-4 flex flex-col justify-between border-l-4 border-l-[#2684FF]">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Punto óptimo</span>
            <Crosshair className="w-4 h-4 text-[#2684FF]" />
          </div>
          <div className="mt-2 text-lg font-bold font-mono text-white truncate">
            {typeof optimalPoint === 'object'
              ? `(${optimalPoint.x.toFixed(4)}, ${optimalPoint.y.toFixed(4)})`
              : Number(optimalPoint).toFixed(5)}
          </div>
          <span className="text-[10px] text-slate-400 mt-1">f = {optimalF !== null ? optimalF.toFixed(5) : '-'}</span>
        </div>
      )}

      {iterations !== null && (
        <div className="card-panel p-4 flex flex-col justify-between border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Iteraciones</span>
            <RefreshCw className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-white">
            {iterations}
          </div>
          <span className="text-[10px] text-slate-400 mt-1">Pasos ejecutados</span>
        </div>
      )}

      {finalError !== null && (
        <div className="card-panel p-4 flex flex-col justify-between border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Error final</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-white truncate">
            {typeof finalError === 'number' ? finalError.toExponential(3) : finalError}
          </div>
          <span className="text-[10px] text-slate-400 mt-1">Criterio alcanzado</span>
        </div>
      )}

      <div className="card-panel p-4 flex flex-col justify-between border-l-4 border-l-indigo-500">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Estado de convergencia</span>
          {converged ? (
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          )}
        </div>
        <div className="mt-2 text-base font-semibold text-white">
          {converged ? 'Convergencia exitosa' : 'Límite alcanzado'}
        </div>
        <span className="text-[10px] text-slate-400 mt-1">
          {converged ? 'Tolerancia satisfecha' : 'Revisar iteraciones / límites'}
        </span>
      </div>

      {customCards.map((c, idx) => (
        <div key={idx} className="card-panel p-4 flex flex-col justify-between border-l-4 border-l-sky-500">
          <div className="text-xs text-slate-400">{c.label}</div>
          <div className="mt-2 text-xl font-bold font-mono text-white">{c.value}</div>
          <span className="text-[10px] text-slate-400 mt-1">{c.sub}</span>
        </div>
      ))}
    </div>
  );
}
