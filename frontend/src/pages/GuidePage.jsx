import React from 'react';
import { BookOpen, CheckCircle, Code, Cpu } from 'lucide-react';

export function GuidePage() {
  return (
    <div className="space-y-6">
      <div className="card-panel p-6 bg-gradient-to-r from-[#0C1630] to-[#151D42] border border-[#1E2B4E]">
        <h1 className="text-2xl font-bold text-white">Guía y Fundamentos de Métodos Numéricos</h1>
        <p className="text-xs text-slate-300 mt-1">
          Conceptos clave, criterios de convergencia y condiciones de aplicación para cada familia de algoritmos en NumeriSolve.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="card-panel p-5 space-y-3">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <span className="text-[#2684FF]">A.</span>
            <span>Métodos para encontrar raíces</span>
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Buscan valores de <code className="text-[#2684FF]">x</code> tales que <code className="text-[#00FFB2]">f(x) = 0</code>.
          </p>
          <ul className="text-xs text-slate-400 space-y-2 list-disc list-inside">
            <li><strong>Bisección:</strong> Requiere cambio de signo <code className="text-slate-300">f(a)·f(b) &lt; 0</code>. Convergencia lineal segura.</li>
            <li><strong>Falsa Posición:</strong> Pondera los extremos mediante la recta secante.</li>
            <li><strong>Secante:</strong> No requiere derivada analítica ni cambio de signo estricto.</li>
            <li><strong>Newton-Raphson:</strong> Convergencia cuadrática mediante <code className="text-slate-300">f'(x)</code>. Precaución con derivadas cercanas a cero.</li>
          </ul>
        </div>

        <div className="card-panel p-5 space-y-3">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <span className="text-[#2684FF]">B.</span>
            <span>Integración Numérica (Cuadratura)</span>
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Calculan el área bajo la curva aproximando la integral definida.
          </p>
          <ul className="text-xs text-slate-400 space-y-2 list-disc list-inside">
            <li><strong>Trapecio:</strong> Aproxima mediante polinomios de grado 1. Válido para datos tabulados y funciones.</li>
            <li><strong>Simpson 1/3:</strong> Polinomios cuadráticos (n debe ser par).</li>
            <li><strong>Simpson 1/8 y 3/8:</strong> Polinomios cúbicos aplicados a bloques de tres subintervalos (n debe ser múltiplo de 3).</li>
          </ul>
        </div>

        <div className="card-panel p-5 space-y-3">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <span className="text-[#2684FF]">C.</span>
            <span>Interpolación y Regresión</span>
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Modelan conjuntos de datos discretos mediante funciones continuas.
          </p>
          <ul className="text-xs text-slate-400 space-y-2 list-disc list-inside">
            <li><strong>Interpolación Directa:</strong> El polinomio pasa exactamente por todos los puntos conocidos.</li>
            <li><strong>Mínimos Cuadrados:</strong> Ajusta una curva minimizando la suma de errores cuadráticos. Evalúa la bondad de ajuste con <code className="text-emerald-400">R²</code>.</li>
          </ul>
        </div>

        <div className="card-panel p-5 space-y-3">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <span className="text-[#2684FF]">D.</span>
            <span>Optimización Numérica</span>
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Localizan valores extremos (máximos o mínimos) sin requerir necesariamente cálculo diferencial.
          </p>
          <ul className="text-xs text-slate-400 space-y-2 list-disc list-inside">
            <li><strong>Sección Dorada 1D:</strong> Divide el intervalo de búsqueda mediante la proporción áurea <code className="text-[#00FFB2]">φ ≈ 0.618</code>.</li>
            <li><strong>Sección Dorada 2D:</strong> Búsqueda por coordenadas alternadas en planos ortogonales.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
