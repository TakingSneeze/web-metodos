import React from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';
import { exportToExcel, exportToCSV } from '../services/fileService';

export function IterationTable({ data = [], columns = [], title = 'Tabla de iteraciones' }) {
  if (!data || data.length === 0) {
    return (
      <div className="card-panel p-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#1E293B]">
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-lg bg-[#1E293B] text-[#2684FF]">📊</span>
            <h3 className="font-semibold text-white">{title}</h3>
          </div>
        </div>
        <div className="py-12 text-center text-slate-400">
          Aún no hay resultados. Configura los parámetros y presiona <span className="text-[#2684FF] font-semibold">"Resolver"</span> para comenzar.
        </div>
      </div>
    );
  }

  const handleExportXlsx = () => exportToExcel(data, `${title.toLowerCase().replace(/\s+/g, '_')}.xlsx`);
  const handleExportCsv = () => exportToCSV(data, `${title.toLowerCase().replace(/\s+/g, '_')}.csv`);

  return (
    <div className="card-panel p-6">
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-[#1E293B] gap-4">
        <div className="flex items-center space-x-2">
          <span className="p-2 rounded-lg bg-[#1E293B] text-[#2684FF]">📊</span>
          <h3 className="font-semibold text-white">{title}</h3>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#18233C] text-[#2684FF] font-mono">
            {data.length} registros
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportXlsx}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#18233C] hover:bg-[#203052] text-xs text-white border border-[#2D3E64] transition-colors"
            title="Exportar a Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Excel</span>
          </button>
          <button
            onClick={handleExportCsv}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#18233C] hover:bg-[#203052] text-xs text-white border border-[#2D3E64] transition-colors"
            title="Exportar a CSV"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto max-h-[380px] overflow-y-auto mt-4 custom-scrollbar">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-[#0B132B] text-xs uppercase text-slate-400 border-b border-[#1E293B] z-10">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className="py-3 px-4 font-semibold tracking-wider">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1A2642]">
            {data.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-[#131E38] transition-colors">
                {columns.map((col, cIdx) => (
                  <td key={cIdx} className="py-2.5 px-4 font-mono text-slate-300">
                    {typeof row[col.key] === 'number'
                      ? Number.isInteger(row[col.key])
                        ? row[col.key]
                        : row[col.key].toFixed(6)
                      : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
