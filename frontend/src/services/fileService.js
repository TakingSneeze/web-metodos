import * as XLSX from 'xlsx';
import Papa from 'papaparse';

/**
 * Parsea un archivo CSV o XLSX y retorna un array de objetos con las filas.
 */
export async function parseDataFile(file) {
  return new Promise((resolve, reject) => {
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.csv')) {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            resolve({
              headers: Object.keys(results.data[0]),
              rows: results.data
            });
          } else {
            reject(new Error('El archivo CSV está vacío o no tiene formato válido.'));
          }
        },
        error: (err) => reject(err)
      });
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const json = XLSX.utils.sheet_to_json(worksheet, { defval: null });

          if (json.length > 0) {
            resolve({
              headers: Object.keys(json[0]),
              rows: json
            });
          } else {
            reject(new Error('La primera hoja del archivo Excel está vacía.'));
          }
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsArrayBuffer(file);
    } else {
      reject(new Error('Formato no soportado. Sube un archivo .csv o .xlsx.'));
    }
  });
}

/**
 * Exporta un arreglo de objetos a archivo Excel (.xlsx)
 */
export function exportToExcel(data, fileName = 'resultados_numerisolve.xlsx') {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Resultados');
  XLSX.writeFile(wb, fileName);
}

/**
 * Exporta un arreglo de objetos a archivo CSV
 */
export function exportToCSV(data, fileName = 'resultados_numerisolve.csv') {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
