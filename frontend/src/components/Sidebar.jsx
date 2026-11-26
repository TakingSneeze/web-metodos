import React from 'react';
import {
  Calculator,
  Compass,
  Layers,
  TrendingUp,
  Maximize2,
  ChevronDown,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export const METHOD_CATEGORIES = [
  {
    id: 'roots',
    title: 'A. Métodos para encontrar raíces',
    icon: Compass,
    methods: [
      { id: 'bisection', name: 'Bisección', shortDesc: 'Intervalo mitad y cambio de signo' },
      { id: 'false_position', name: 'Falsa Posición', shortDesc: 'Regula falsi con recta secante' },
      { id: 'secant', name: 'Secante', shortDesc: 'Dos puntos iniciales sucesivos' },
      { id: 'newton_raphson', name: 'Newton-Raphson', shortDesc: 'Diferenciación y recta tangente' }
    ]
  },
  {
    id: 'integration',
    title: 'B. Integración numérica',
    icon: Layers,
    methods: [
      { id: 'trapezoidal', name: 'Trapecio', shortDesc: 'Función o datos experimentales' },
      { id: 'simpson_13', name: 'Simpson 1/3', shortDesc: 'Parábolas (subintervalos pares)' },
      { id: 'simpson_18', name: 'Simpson 1/8', shortDesc: 'Regla cúbica de 1/8 (múltiplos de 3)' },
      { id: 'simpson_38', name: 'Simpson 3/8', shortDesc: 'Regla compuesta 3/8 (múltiplos de 3)' }
    ]
  },
  {
    id: 'interpolation',
    title: 'C. Interpolación y regresión',
    icon: TrendingUp,
    methods: [
      { id: 'interpolation_direct', name: 'Interpolación directa', shortDesc: 'Lagrange y Newton diferencias' },
      { id: 'least_squares', name: 'Regresión Mínimos Cuadrados', shortDesc: 'Lineal, polinómica, exponencial' }
    ]
  },
  {
    id: 'optimization',
    title: 'D. Optimización',
    icon: Maximize2,
    methods: [
      { id: 'golden_univariate', name: 'Sección dorada univariada', shortDesc: 'Búsqueda áurea en 1D' },
      { id: 'golden_multivariate', name: 'Sección dorada multivariada', shortDesc: 'Coordenadas alternadas 2D' }
    ]
  }
];

export function Sidebar({ currentMethodId, onSelectMethod }) {
  return (
    <aside className="w-72 bg-[#070D1E] border-r border-[#15203A] flex flex-col h-[calc(100vh-4rem)] sticky top-16 shrink-0 overflow-y-auto custom-scrollbar p-3">
      <div className="px-3 py-2 text-xs font-semibold uppercase text-slate-400 tracking-wider flex items-center justify-between">
        <span>Catálogo de Métodos</span>
        <Sparkles className="w-3.5 h-3.5 text-[#2684FF]" />
      </div>

      <div className="space-y-4 mt-2">
        {METHOD_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <div key={cat.id} className="space-y-1">
              <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Icon className="w-3.5 h-3.5 text-[#7547FF]" />
                <span>{cat.title}</span>
              </div>

              <div className="space-y-0.5">
                {cat.methods.map((method) => {
                  const isActive = currentMethodId === method.id;
                  return (
                    <button
                      key={method.id}
                      onClick={() => onSelectMethod(method.id)}
                      className={`w-full text-left px-3 py-2 rounded-xl transition-all flex items-start space-x-2.5 ${
                        isActive
                          ? 'bg-gradient-to-r from-[#1B3566] to-[#122345] text-white border-l-4 border-l-[#2684FF] shadow-md shadow-blue-900/20'
                          : 'text-slate-400 hover:text-white hover:bg-[#0D1833]'
                      }`}
                    >
                      <div className="pt-0.5">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            isActive ? 'bg-[#00FFB2]' : 'bg-[#1E2B48]'
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold leading-tight truncate">
                          {method.name}
                        </div>
                        <div className="text-[10px] text-slate-500 leading-tight truncate mt-0.5">
                          {method.shortDesc}
                        </div>
                      </div>
                      {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#2684FF] shrink-0 mt-0.5" />}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
