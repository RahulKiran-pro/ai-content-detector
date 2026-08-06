export function exportHistoryToCSV(history, filename = 'TruthLens_Audit_History.csv') {
  if (!history || history.length === 0) return;

  const headers = ['Verification ID', 'Date & Time', 'Content Type', 'Input Summary', 'Verdict', 'Score'];

  const rows = history.map((item) => [
    `"${item._id || ''}"`,
    `"${new Date(item.createdAt).toLocaleString()}"`,
    `"${item.contentType || ''}"`,
    `"${(item.inputSummary || '').replace(/"/g, '""')}"`,
    `"${item.verdict || ''}"`,
    `"${item.score || item.result || 0}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
