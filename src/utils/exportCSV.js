import { KEY_MESSAGES, LLM_PLATFORMS } from '../config/defaultConfig.js';

function escape(val) {
  if (val == null) return '';
  const s = String(val);
  return s.includes(',') || s.includes('"') || s.includes('\n')
    ? `"${s.replace(/"/g, '""')}"`
    : s;
}

function row(cols) {
  return cols.map(escape).join(',');
}

export function exportCoverageCSV(coverage) {
  const headers = [
    'Title', 'Journalist', 'Publication', 'Publication Date', 'Media Type',
    'Estimated Reach', 'Publication Tier', 'Placement Type', 'Sentiment',
    'Target Audience', 'Executive Visibility', 'Name in Title',
    ...KEY_MESSAGES.map(m => `KM: ${m}`),
    ...LLM_PLATFORMS.map(p => `LLM: ${p}`),
    'LLM Query', 'Article URL', 'Campaign', 'Impact Score', 'Notes',
  ];

  const rows = coverage.map(c => row([
    c.title,
    c.journalist,
    c.publication,
    c.publicationDate,
    c.mediaType,
    c.estimatedReach,
    c.publicationTierId,
    c.placementType,
    c.sentiment,
    (c.targetAudience || []).join('; '),
    (c.executiveVisibility || []).join('; '),
    c.nameInTitle ? 'Yes' : 'No',
    ...KEY_MESSAGES.map(m => (c.keyMessages || []).includes(m) ? 'Yes' : 'No'),
    ...LLM_PLATFORMS.map(p => (c.llmVisibility || []).includes(p) ? 'Yes' : 'No'),
    c.llmQuery,
    c.articleUrl,
    c.campaignId,
    c.impactScore,
    c.notes,
  ]));

  const csv = [row(headers), ...rows].join('\n');
  downloadCSV(csv, 'coverage-export.csv');
}

export function getCoverageCSVTemplate() {
  const headers = [
    'Title',
    'Journalist',
    'Publication',
    'Publication Date',
    'Media Type',
    'Estimated Reach',
    'Publication Tier',
    'Placement Type',
    'Sentiment',
    'Target Audience',
    'Executive Visibility',
    'Name in Title',
    ...KEY_MESSAGES.map(m => `KM: ${m}`),
    ...LLM_PLATFORMS.map(p => `LLM: ${p}`),
    'LLM Query', 'Article URL', 'Notes',
  ];

  // Second row provides format instructions for each column
  const instructions = [
    'Required — article headline',
    'Journalist full name',
    'Required — publication name',
    'YYYY-MM-DD (e.g. 2026-03-15)',
    'Online News | Print News | Newsletter | Influencer | Podcast | Broadcast | Social Media',
    'Number only (e.g. 500000)',
    'tier1 | tier2 | tier3 | tier4 | tier5',
    'Proactive | Reactive | Organic',
    'Positive | Neutral | Negative (exact spelling required)',
    'Consumer; Business/Trade (exact spelling; semicolon-separated for multiple)',
    'Interview; Speaking; Quote (semicolon-separated for multiple)',
    'Yes | No',
    ...KEY_MESSAGES.map(() => 'Yes | No (leave blank for No)'),
    ...LLM_PLATFORMS.map(() => 'Yes | No (leave blank for No)'),
    'LLM query text', 'Full URL https://...', 'Any notes',
  ];

  const csv = [row(headers), row(instructions)].join('\n') + '\n';
  downloadCSV(csv, 'coverage-template.csv');
}

function downloadCSV(csv, filename) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

// ── Normalizers ──────────────────────────────────────────────────────────────

function normalizeSentiment(v) {
  const lower = (v || '').toLowerCase().trim();
  if (lower === 'positive') return 'Positive';
  if (lower === 'neutral') return 'Neutral';
  if (lower === 'negative') return 'Negative';
  return v || '';
}

function normalizeAudience(v) {
  const lower = (v || '').toLowerCase().trim();
  if (lower === 'consumer') return 'Consumer';
  if (lower === 'business/trade' || lower === 'business' || lower === 'trade') return 'Business/Trade';
  return v;
}

// Treat Yes/Y/True/1 as yes; everything else (including blank) is no
function isYes(v) {
  const lower = (v || '').toLowerCase().trim();
  return lower === 'yes' || lower === 'y' || lower === 'true' || lower === '1';
}

// ── CSV Parser ───────────────────────────────────────────────────────────────

function parseCSVRow(line) {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += ch;
    }
  }
  result.push(cur.trim());
  return result;
}

// ── CSV Import ────────────────────────────────────────────────────────────────

export function importCoverageCSV(text, campaigns = []) {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return [];

  const headers = parseCSVRow(lines[0]).map(h => h.trim());

  // Find column index by name: tries exact match first, then prefix match
  // to handle template headers that include instructions (e.g. "Publication Date (YYYY-MM-DD)")
  const idx = (name) => {
    let i = headers.findIndex(h => h.toLowerCase() === name.toLowerCase());
    if (i >= 0) return i;
    i = headers.findIndex(h => h.toLowerCase().startsWith(name.toLowerCase()));
    return i;
  };

  // Build key message column indices
  const kmIndices = KEY_MESSAGES.map(m => ({
    message: m,
    col: headers.findIndex(h => h.startsWith('KM:') && h.includes(m.substring(0, 20))),
  }));

  const llmIndices = LLM_PLATFORMS.map(p => ({
    platform: p,
    col: headers.findIndex(h => h.startsWith('LLM:') && h.includes(p)),
  }));

  const campaignMap = {};
  campaigns.forEach(c => { campaignMap[c.name] = c.id; });

  const items = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVRow(lines[i]);
    const titleVal = cols[idx('Title')];
    if (!titleVal) continue;
    // Skip the instructions row that the template includes as the second row
    if (titleVal.toLowerCase().startsWith('required') || titleVal === 'Required — article headline') continue;

    const get = (name) => {
      const i2 = idx(name);
      return i2 >= 0 ? (cols[i2] || '') : '';
    };

    // Only include key messages where value is explicitly yes — blank = no
    const keyMessages = kmIndices
      .filter(({ col }) => col >= 0 && isYes(cols[col]))
      .map(({ message }) => message);

    const llmVisibility = llmIndices
      .filter(({ col }) => col >= 0 && isYes(cols[col]))
      .map(({ platform }) => platform);

    const targetAudience = (get('Target Audience') || '')
      .split(';').map(s => normalizeAudience(s.trim())).filter(Boolean);

    const executiveVisibility = (get('Executive Visibility') || '')
      .split(';').map(s => s.trim()).filter(Boolean);

    const campaignRaw = get('Campaign');
    const campaignId = campaignMap[campaignRaw] || campaignRaw || '';

    items.push({
      id: `cov-${Date.now()}-${i}`,
      title: titleVal,
      journalist: get('Journalist'),
      publication: get('Publication'),
      publicationDate: get('Publication Date'),
      mediaType: get('Media Type'),
      estimatedReach: get('Estimated Reach'),
      publicationTierId: get('Publication Tier'),
      placementType: get('Placement Type'),
      sentiment: normalizeSentiment(get('Sentiment')),
      targetAudience,
      executiveVisibility,
      keyMessages,
      llmVisibility,
      llmQuery: get('LLM Query'),
      articleUrl: get('Article URL'),
      campaignId,
      notes: get('Notes'),
      quote: get('Quote') || '',
      nameInTitle: isYes(get('Name in Title')),
    });
  }
  return items;
}
