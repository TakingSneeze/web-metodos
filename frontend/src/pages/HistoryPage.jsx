import React from 'react';
import { History, Trash2, ArrowUpRight, Clock, CheckCircle } from 'lucide-react';

export function HistoryPage({ history = [], onClear, onSelectHistoryItem }) {
  if (!history || history.length === 0) {
    return (
      <div className="card-panel p-12 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-[#0F1B38] border border-[#1E2E59] flex items-center justify-center text-[#2684FF]">
          <History className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-white">Historial de Cálculos Vacío</h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Los problemas resueltos aparecerán aquí de forma automática para que puedas consultarlos, exportarlos y comparar sus resultados.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Historial de Problemas Resueltos</h2>
          <p className="text-xs text-slate-400">Consultas y ejecuciones registradas durante esta sesión</p>
        </div>
        <button
          onClick={onClear}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-red-950/40 border border-red-800 text-red-300 hover:bg-red-900/60 text-xs transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Borrar todo</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {history.map((item, idx) => (
          <div
            key={idx}
            className="card-panel p-4 space-y-3 hover:border-[#2684FF] transition-all border border-[#1A2645]"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#2684FF] px-2 py-0.5 rounded bg-[#101D3D]">
                {item.method}
              </span>
              <span className="text-slate-500 flex items-center space-x-1 text-[11px]">
                <Clock className="w-3 h-3" />
                <span>{item.date}</span>
              </span>
            </div>

            <div className="text-xs font-mono text-slate-300 bg-[#080E21] p-2.5 rounded-lg border border-[#16223F] truncate">
              {item.expr}
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-[#16223F] text-xs">
              <div className="text-[#00FFB2] font-mono font-bold truncate">
                {item.result}
              </div>
              <span className="text-[11px] text-slate-500 font-mono">
                {item.iterations} iter
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
