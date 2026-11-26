import React from 'react';
import { Minus, Plus } from 'lucide-react';

export function NumberStepper({
  label,
  value,
  onChange,
  step = 1,
  min = -1000,
  max = 1000,
  placeholder = '0',
  prefix
}) {
  const handleDec = () => {
    const next = Number((Number(value || 0) - step).toFixed(5));
    if (next >= min) onChange(next);
  };

  const handleInc = () => {
    const next = Number((Number(value || 0) + step).toFixed(5));
    if (next <= max) onChange(next);
  };

  return (
    <div className="flex flex-col space-y-1.5">
      {label && <label className="text-xs font-medium text-slate-300">{label}</label>}
      <div className="flex items-center rounded-xl bg-[#0B1329] border border-[#1E2B4A] focus-within:border-[#2684FF] transition-all overflow-hidden p-1">
        {prefix && <span className="text-xs text-slate-500 pl-2 pr-1">{prefix}</span>}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-white px-2 py-1.5 outline-none font-mono"
        />
        <div className="flex items-center space-x-1 pr-1">
          <button
            type="button"
            onClick={handleDec}
            className="p-1.5 rounded-lg bg-[#14203A] hover:bg-[#1E2E54] text-slate-400 hover:text-white transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleInc}
            className="p-1.5 rounded-lg bg-[#14203A] hover:bg-[#1E2E54] text-slate-400 hover:text-white transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
