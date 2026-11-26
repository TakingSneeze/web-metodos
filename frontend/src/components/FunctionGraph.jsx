import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
  ReferenceLine
} from 'recharts';

export function FunctionGraph({
  data = [],
  root = null,
  title = 'Gráfica de la función',
  xLabel = 'x',
  yLabel = 'f(x)',
  tangentData = null
}) {
  return (
    <div className="card-panel p-5 flex flex-col h-[340px]">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2684FF]"></span>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
        </div>
        {root !== null && (
          <div className="flex items-center space-x-2 text-xs">
            <span className="inline-block w-3 h-3 rounded-full bg-[#00FFB2] border border-black"></span>
            <span className="text-slate-300 font-mono">
              Raíz aproximada: <strong className="text-[#00FFB2]">{typeof root === 'number' ? root.toFixed(5) : root}</strong>
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1A2642" />
            <XAxis
              dataKey="x"
              stroke="#64748B"
              tick={{ fill: '#94A3B8', fontSize: 11 }}
              type="number"
              domain={['dataMin', 'dataMax']}
            />
            <YAxis
              stroke="#64748B"
              tick={{ fill: '#94A3B8', fontSize: 11 }}
              domain={['auto', 'auto']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0E172E',
                borderColor: '#1E2B4A',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '12px'
              }}
              formatter={(value, name) => [typeof value === 'number' ? value.toFixed(5) : value, name]}
              labelFormatter={(label) => `x = ${Number(label).toFixed(4)}`}
            />
            {/* Ejes x=0 e y=0 */}
            <ReferenceLine y={0} stroke="#334155" strokeWidth={1.5} />
            <ReferenceLine x={0} stroke="#334155" strokeWidth={1} strokeDasharray="2 2" />

            {/* Curva principal */}
            <Line
              type="monotone"
              dataKey="y"
              name="f(x)"
              stroke="#2684FF"
              strokeWidth={2.5}
              dot={false}
              isAnimationActive={false}
            />

            {/* Punto de la raíz destacado con color distinto (cyan/verde neón) */}
            {root !== null && (
              <ReferenceDot
                x={Number(root.toFixed(5))}
                y={0}
                r={6}
                fill="#00FFB2"
                stroke="#042F2E"
                strokeWidth={2}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
