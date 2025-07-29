// General CSV export (handles escaping commas, quotes, nulls, etc.)
export function exportToCSV(data, filename = 'export.csv') {
  if (!data || !data.length) return;

  const headers = Object.keys(data[0]);
  const escape = (val) => {
    if (val == null) return '';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvRows = [
    headers.join(","),
    ...data.map(row => headers.map(field => escape(row[field])).join(","))
  ];

  const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

// Raw/flat KYC-style export (just values, no escaping)
export function exportKycCSV(data, filename = 'kyc_export.csv') {
  if (!data || !data.length) return;

  const csv = [
    Object.keys(data[0]).join(','),
    ...data.map(row => Object.values(row).join(','))
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}
