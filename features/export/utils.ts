import Papa from 'papaparse';
import * as XLSX from 'xlsx';

type ExportTransaction = {
  date: string;
  type: string;
  amount: number;
  categoryName: string;
  accountName: string;
  tags: string[];
  note: string | null;
  status: string;
};

function formatRow(tx: ExportTransaction) {
  return {
    Fecha: tx.date,
    Tipo: tx.type === 'income' ? 'Ingreso' : 'Gasto',
    Categoría: tx.categoryName,
    Monto: tx.amount,
    Cuenta: tx.accountName,
    Tags: tx.tags.join(', '),
    Nota: tx.note || '',
    Estado: tx.status === 'confirmed' ? 'Confirmada' : 'Pendiente',
  };
}

export function generateCSV(transactions: ExportTransaction[]): string {
  const data = transactions.map(formatRow);
  return Papa.unparse(data, { header: true });
}

export function generateExcel(transactions: ExportTransaction[]): Buffer {
  const data = transactions.map(formatRow);
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Transacciones');
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
}
