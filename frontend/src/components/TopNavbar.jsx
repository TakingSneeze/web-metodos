import React from 'react';
import {
  HelpCircle,
  Moon,
  Sun,
  LayoutGrid,
  History,
  Info
} from 'lucide-react';

export function TopNavbar({ activeTab, onTabChange, isDark = true, onToggleTheme }) {
  return (
    <header className="h-16 px-6 border-b border-[#1A2644] bg-[#070B18]/90 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between">
      {/* Logo & Marca */}
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#2684FF] via-[#7547FF] to-[#00FFB2] p-[1.5px] flex items-center justify-center shadow-lg shadow-blue-500/20">
          <div className="w-full h-full bg-[#070B18] rounded-[10px] flex items-center justify-center">
            <span className="font-extrabold text-base bg-gradient-to-r from-[#2684FF] to-[#7547FF] bg-clip-text text-transparent">
              N
            </span>
          </div>
        </div>
        <div>
          <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1">
            Numeri<span className="text-[#2684FF]">Solve</span>
          </span>
          <span className="text-[10px] block text-slate-400 font-mono -mt-1 tracking-wider uppercase">
            Plataforma de Métodos Numéricos
          </span>
        </div>
      </div>

      {/* Navegación rápida central */}
      <div className="hidden md:flex items-center space-x-1 bg-[#0F172E] p-1 rounded-xl border border-[#1A2744]">
        <button
          onClick={() => onTabChange('calculator')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'calculator'
              ? 'bg-[#2684FF] text-white shadow-md shadow-blue-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Calculadora</span>
        </button>
        <button
          onClick={() => onTabChange('history')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'history'
              ? 'bg-[#2684FF] text-white shadow-md shadow-blue-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Historial</span>
        </button>
        <button
          onClick={() => onTabChange('guide')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'guide'
              ? 'bg-[#2684FF] text-white shadow-md shadow-blue-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Info className="w-3.5 h-3.5" />
          <span>Guía del Curso</span>
        </button>
      </div>

      {/* Acciones de usuario y tema */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-xl bg-[#0F172E] hover:bg-[#182342] text-slate-300 hover:text-white border border-[#1A2744] transition-all"
          title="Cambiar tema"
        >
          {isDark ? <Moon className="w-4 h-4 text-[#2684FF]" /> : <Sun className="w-4 h-4 text-amber-400" />}
        </button>
        <button
          onClick={() => onTabChange('guide')}
          className="p-2 rounded-xl bg-[#0F172E] hover:bg-[#182342] text-slate-300 hover:text-white border border-[#1A2744] transition-all"
          title="Ayuda y documentación"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
