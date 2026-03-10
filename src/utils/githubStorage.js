// All data operations go through the /api/data Vercel serverless function.
// Each "file" maps to data/{file}.json in the GitHub repo.
// We cache the SHA returned by GitHub — required for updates.

const shaCache = {};

async function apiFetch(method, file, body = null) {
  const url = `/api/data?file=${file}`;
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}),
  };

  const res = await fetch(url, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `API error ${res.status}`);
  }
  return res.json();
}

export async function loadData(file) {
  const { data, sha } = await apiFetch('GET', file);
  shaCache[file] = sha;
  return Array.isArray(data) ? data : (data ?? []);
}

export async function saveData(file, data) {
  const sha = shaCache[file] || null;
  const result = await apiFetch('POST', file, { data, sha });
  if (result.sha) shaCache[file] = result.sha;
  return data;
}
