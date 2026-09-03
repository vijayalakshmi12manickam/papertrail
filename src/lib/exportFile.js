// expo-file-system's default export (SDK 54+) is the new `File`/`Paths` API,
// which has no `EncodingType` — that's what threw "Cannot read property UTF8
// of undefined" here. `expo-file-system/legacy` keeps the old
// documentDirectory/writeAsStringAsync/EncodingType API this file relies on.
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as XLSX from 'xlsx';
import { buildExportRows, buildCsv, HEADERS } from './exportRows';

async function shareFile(uri, mimeType) {
  const available = await Sharing.isAvailableAsync();
  if (!available) {
    throw new Error('Sharing is not available on this device.');
  }
  await Sharing.shareAsync(uri, { mimeType, UTI: mimeType });
}

export async function exportExpensesAsCsv(expenses, categoryById, accountById) {
  const rows = buildExportRows(expenses, categoryById, accountById);
  const csv = buildCsv(rows);
  const filename = `papertrail-export-${Date.now()}.csv`;
  const uri = FileSystem.documentDirectory + filename;
  await FileSystem.writeAsStringAsync(uri, csv, { encoding: FileSystem.EncodingType.UTF8 });
  await shareFile(uri, 'text/csv');
  return uri;
}

export async function exportExpensesAsXlsx(expenses, categoryById, accountById) {
  const rows = buildExportRows(expenses, categoryById, accountById);
  const worksheet = XLSX.utils.json_to_sheet(rows, { header: HEADERS });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Expenses');
  const base64 = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });

  const filename = `papertrail-export-${Date.now()}.xlsx`;
  const uri = FileSystem.documentDirectory + filename;
  await FileSystem.writeAsStringAsync(uri, base64, { encoding: FileSystem.EncodingType.Base64 });
  await shareFile(uri, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  return uri;
}
