let BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
if (BASE.endsWith('/api')) BASE = BASE.slice(0, -4);
const API_BASE = `${BASE}/api`;

export async function parseCsv(file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/parse-csv`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Failed to parse CSV');
  }

  return res.json();
}

export async function importCsv(file, onProgress) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/import`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'AI extraction failed');
  }

  return res.json();
}
