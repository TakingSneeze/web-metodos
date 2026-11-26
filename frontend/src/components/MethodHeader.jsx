import React from 'react';
import { BookOpen, CheckCircle, Info } from 'lucide-react';

export function MethodHeader({
  name,
  category,
  description,
  objective,
  formula,
  onOpenTheory
}) {
  return (
    <div className="card-panel p-6 bg-gradient-to-r from-[#0C1630] via-[#101B3B] to-[#151D42] border border-[#1E2B4E]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#2684FF] px-2 py-0.5 rounded bg-[#182852]">
              {category}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{name}</h1>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">{description}</p>
        </div>

        <div className="flex items-center space-x-3">
          {formula && (
            <div className="px-4 py-2 rounded-xl bg-[#080E21] border border-[#1F2C4E] text-xs font-mono text-[#00FFB2]">
              <span className="text-slate-400 block text-[10px]">Fórmula:</span>
              <span>{formula}</span>
            </div>
          )}
          {onOpenTheory && (
            <button
              onClick={onOpenTheory}
              className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-[#1A264A] hover:bg-[#253768] text-xs font-medium text-white border border-[#2B3E75] transition-all"
            >
              <BookOpen className="w-4 h-4 text-[#2684FF]" />
              <span>Teoría</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
