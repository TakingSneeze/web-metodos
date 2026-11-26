import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { parseDataFile } from '../services/fileService';

export function FileUploadModule({ onDataLoaded, title = 'Cargar datos experimentales' }) {
  const [fileInfo, setFileInfo] = useState(null);
  const [previewRows, setPreviewRows] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [selectedX, setSelectedX] = useState('');
  const [selectedY, setSelectedY] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    setErrorMsg('');
    try {
      const parsed = await parseDataFile(file);
      setHeaders(parsed.headers);
      setPreviewRows(parsed.rows.slice(0, 5));
      setFileInfo({ name: file.name, size: (file.size / 1024).toFixed(1) + ' KB', totalRows: parsed.rows.length });

      // Seleccionar automáticamente las primeras dos columnas
      if (parsed.headers.length >= 2) {
        setSelectedX(parsed.headers[0]);
        setSelectedY(parsed.headers[1]);
        sendPoints(parsed.rows, parsed.headers[0], parsed.headers[1]);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error al procesar el archivo');
    }
  };

  const sendPoints = (rows, colX, colY) => {
    const validPoints = [];
    for (const row of rows) {
      const vx = Number(row[colX]);
      const vy = Number(row[colY]);
      if (!isNaN(vx) && !isNaN(vy) && vx !== null && vy !== null) {
        validPoints.push({ x: vx, y: vy });
      }
    }
    if (validPoints.length >= 2) {
      onDataLoaded(validPoints);
    }
  };

  return (
    <div className="card-panel p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
          <UploadCloud className="w-4 h-4 text-[#2684FF]" />
          <span>{title}</span>
        </h3>
        <span className="text-[11px] text-slate-400">Formatos: .xlsx, .csv</span>
      </div>

      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
        }}
        className="border-2 border-dashed border-[#1E2B4A] hover:border-[#2684FF] rounded-xl p-6 text-center cursor-pointer transition-all bg-[#091124] hover:bg-[#0D1833]"
      >
        <UploadCloud className="w-8 h-8 mx-auto text-[#2684FF] mb-2" />
        <p className="text-xs text-white font-medium">Haz clic o arrastra un archivo aquí</p>
        <p className="text-[11px] text-slate-500 mt-1">Hojas de cálculo con columnas numéricas</p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
      </div>

      {errorMsg && (
        <div className="flex items-center space-x-2 p-3 rounded-lg bg-red-950/40 border border-red-800 text-red-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {fileInfo && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-xs text-slate-300 bg-[#0F1A33] p-2.5 rounded-lg border border-[#1E2A48]">
            <div className="flex items-center space-x-2 truncate">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span className="font-mono truncate">{fileInfo.name}</span>
            </div>
            <span className="text-slate-400 text-[11px] shrink-0 font-mono">
              {fileInfo.totalRows} filas ({fileInfo.size})
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Columna X:</label>
              <select
                value={selectedX}
                onChange={(e) => {
                  setSelectedX(e.target.value);
                  // Recargar
                }}
                className="w-full bg-[#0B1329] border border-[#1E2B4A] rounded-lg px-2.5 py-1.5 text-white"
              >
                {headers.map((h, i) => (
                  <option key={i} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Columna Y:</label>
              <select
                value={selectedY}
                onChange={(e) => {
                  setSelectedY(e.target.value);
                }}
                className="w-full bg-[#0B1329] border border-[#1E2B4A] rounded-lg px-2.5 py-1.5 text-white"
              >
                {headers.map((h, i) => (
                  <option key={i} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
