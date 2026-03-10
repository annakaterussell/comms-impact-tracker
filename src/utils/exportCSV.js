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
