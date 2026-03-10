// All data operations go through the /api/data Vercel serverless function.
// Each "file" maps to data/{file}.json in the GitHub repo.
// We cache the SHA returned by GitHub — required for updates.
//
// LOCAL PREVIEW FALLBACK:
// When running via `npm run dev` (no Vercel API), the app automatically
// falls back to localStorage so you can preview and tweak the UI freely.
// Data saved locally is NOT synced to GitHub — it's just for previewing.

const shaCache = {};

// Detect whether the Vercel API is available
let _useLocalFallback = null;
async function usingLocalFallback() {
  if (_useLocalFallback !== null) return _useLocalFallback;
  try {
    const res = await fetch('/api/data?file=config', { method: 'GET' });
    _useLocalFallback = !res.ok && res.status !== 200;
  } catch {
    _useLocalFallback = true;
  }
  return _useLocalFallback;
}

// ── localStorage fallback ─────────────────────────────────────────────────
function localLoad(file) {
  try {
    const raw = localStorage.getItem(`cit_${file}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function localSave(file, data) {
  localStorage.setItem(`cit_${file}`, JSON.stringify(data));
}

// ── GitHub API via Vercel serverless ──────────────────────────────────────
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

// ── Public API ────────────────────────────────────────────────────────────
export async function loadData(file) {
  if (await usingLocalFallback()) {
    console.info(`[storage] Using localStorage for "${file}" (local preview mode)`);
    return localLoad(file);
  }
  const { data, sha } = await apiFetch('GET', file);
  shaCache[file] = sha;
  return Array.isArray(data) ? data : (data ?? []);
}

export async function saveData(file, data) {
  if (await usingLocalFallback()) {
    localSave(file, data);
    return data;
  }
  const sha = shaCache[file] || null;
  const result = await apiFetch('POST', file, { data, sha });
  if (result.sha) shaCache[file] = result.sha;
  return data;
}
