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
    'Target Audience', 'Executive Visibility',
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
    'Title', 'Journalist', 'Publication', 'Publication Date (YYYY-MM-DD)',
    'Media Type (Online News|Print News|Newsletter|Influencer|Podcast|Broadcast|Social Media)',
    'Estimated Reach', 'Publication Tier ID (tier1–tier5)',
    'Placement Type (Proactive|Reactive|Organic)',
    'Sentiment (Positive|Neutral|Negative)',
    'Target Audience (Consumer; Business/Trade)',
    'Executive Visibility (Interview; Speaking; Quote)',
    ...KEY_MESSAGES.map(m => `KM: ${m} (Yes/No)`),
    ...LLM_PLATFORMS.map(p => `LLM: ${p} (Yes/No)`),
    'LLM Query', 'Article URL', 'Notes',
  ];
  downloadCSV(row(headers) + '\n', 'coverage-template.csv');
}

function downloadCSV(csv, filename) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

// ── CSV Import ────────────────────────────────────────────────────────────────

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

export function importCoverageCSV(text, campaigns = []) {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return [];

  const headers = parseCSVRow(lines[0]).map(h => h.trim());

  const idx = (name) => {
    const i = headers.findIndex(h => h.toLowerCase() === name.toLowerCase());
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
    if (!cols[idx('Title')]) continue;

    const get = (name) => {
      const i2 = idx(name);
      return i2 >= 0 ? (cols[i2] || '') : '';
    };

    const keyMessages = kmIndices
      .filter(({ col }) => col >= 0 && (cols[col] || '').toLowerCase() === 'yes')
      .map(({ message }) => message);

    const llmVisibility = llmIndices
      .filter(({ col }) => col >= 0 && (cols[col] || '').toLowerCase() === 'yes')
      .map(({ platform }) => platform);

    const targetAudience = (get('Target Audience') || '').split(';').map(s => s.trim()).filter(Boolean);
    const executiveVisibility = (get('Executive Visibility') || '').split(';').map(s => s.trim()).filter(Boolean);

    // Map campaign name to ID if present
    const campaignRaw = get('Campaign');
    const campaignId = campaignMap[campaignRaw] || campaignRaw || '';

    items.push({
      id: `cov-${Date.now()}-${i}`,
      title: get('Title'),
      journalist: get('Journalist'),
      publication: get('Publication'),
      publicationDate: get('Publication Date') || get('Publication Date (YYYY-MM-DD)'),
      mediaType: get('Media Type') || get('Media Type (Online News|Print News|Newsletter|Influencer|Podcast|Broadcast|Social Media)'),
      estimatedReach: get('Estimated Reach'),
      publicationTierId: get('Publication Tier') || get('Publication Tier ID (tier1–tier5)'),
      placementType: get('Placement Type') || get('Placement Type (Proactive|Reactive|Organic)'),
      sentiment: get('Sentiment') || get('Sentiment (Positive|Neutral|Negative)'),
      targetAudience,
      executiveVisibility,
      keyMessages,
      llmVisibility,
      llmQuery: get('LLM Query'),
      articleUrl: get('Article URL'),
      campaignId,
      notes: get('Notes'),
      quote: get('Quote') || '',
      nameInTitle: false,
    });
  }
  return items;
}
