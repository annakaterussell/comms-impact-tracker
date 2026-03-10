import { useState, useMemo, useRef } from 'react';
import { calculateImpactScore, getImpactLabel, formatReach, formatDate } from '../utils/calculations.js';
import { exportCoverageCSV, getCoverageCSVTemplate, importCoverageCSV } from '../utils/exportCSV.js';

const SORT_OPTIONS = [
  { value: 'date-desc', label: 'Newest first' },
  { value: 'date-asc', label: 'Oldest first' },
  { value: 'impact-desc', label: 'Highest impact' },
  { value: 'reach-desc', label: 'Highest reach' },
  { value: 'pub', label: 'Publication A–Z' },
];

export default function CoverageLibrary({ coverage, campaigns, publicationTiers, onEdit, onDelete, onAdd, onImport }) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [filterSentiment, setFilterSentiment] = useState('');
  const [filterAudience, setFilterAudience] = useState('');
  const [filterCampaign, setFilterCampaign] = useState('');
  const fileInputRef = useRef(null);

  function handleImportFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const items = importCoverageCSV(evt.target.result, campaigns);
        if (items.length === 0) {
          alert('No valid rows found in the CSV. Make sure the file matches the template format.');
          return;
        }
        if (confirm(`Import ${items.length} coverage item(s)?`)) {
          onImport(items);
        }
      } catch (err) {
        alert('Failed to parse CSV: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  const enriched = useMemo(() => coverage.map(c => ({
    ...c,
    _score: calculateImpactScore(c, coverage, publicationTiers),
  })), [coverage, publicationTiers]);

  const filtered = useMemo(() => {
    let data = enriched;

    if (search) {
      const q = search.toLowerCase();
      data = data.filter(c =>
        c.title?.toLowerCase().includes(q) ||
        c.publication?.toLowerCase().includes(q) ||
        c.journalist?.toLowerCase().includes(q)
      );
    }
    if (filterSentiment) data = data.filter(c => c.sentiment === filterSentiment);
    if (filterAudience) data = data.filter(c => (c.targetAudience || []).includes(filterAudience));
    if (filterCampaign) data = data.filter(c => c.campaignId === filterCampaign);

    const sorted = [...data];
    if (sortBy === 'date-desc') sorted.sort((a, b) => (b.publicationDate || '').localeCompare(a.publicationDate || ''));
    if (sortBy === 'date-asc') sorted.sort((a, b) => (a.publicationDate || '').localeCompare(b.publicationDate || ''));
    if (sortBy === 'impact-desc') sorted.sort((a, b) => b._score - a._score);
    if (sortBy === 'reach-desc') sorted.sort((a, b) => (Number(b.estimatedReach) || 0) - (Number(a.estimatedReach) || 0));
    if (sortBy === 'pub') sorted.sort((a, b) => (a.publication || '').localeCompare(b.publication || ''));

    return sorted;
  }, [enriched, search, sortBy, filterSentiment, filterAudience, filterCampaign]);

  function getCampaignName(id) {
    return campaigns.find(c => c.id === id)?.name || '';
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="toolbar" style={{ marginBottom: 16, alignItems: 'flex-start', gap: 8 }}>
        <input
          className="search-input"
          placeholder="Search title, publication, journalist…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          value={filterSentiment}
          onChange={e => setFilterSentiment(e.target.value)}
          style={{ padding: '7px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13 }}
        >
          <option value="">All Sentiment</option>
          <option>Positive</option>
          <option>Neutral</option>
          <option>Negative</option>
        </select>
        <select
          value={filterAudience}
          onChange={e => setFilterAudience(e.target.value)}
          style={{ padding: '7px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13 }}
        >
          <option value="">All Audiences</option>
          <option>Consumer</option>
          <option>Business/Trade</option>
        </select>
        <select
          value={filterCampaign}
          onChange={e => setFilterCampaign(e.target.value)}
          style={{ padding: '7px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13 }}
        >
          <option value="">All Campaigns</option>
          {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          style={{ padding: '7px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13 }}
        >
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => getCoverageCSVTemplate()} title="Download blank template">⬇ Template</button>
          <button className="btn btn-secondary btn-sm" onClick={() => fileInputRef.current?.click()} title="Import coverage from CSV">⬆ Import CSV</button>
          <input ref={fileInputRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleImportFile} />
          <button className="btn btn-secondary btn-sm" onClick={() => exportCoverageCSV(coverage)}>Export CSV</button>
          <button className="btn btn-primary btn-sm" onClick={onAdd}>+ Add Coverage</button>
        </div>
      </div>

      <p className="text-sm text-muted" style={{ marginBottom: 12 }}>
        Showing {filtered.length} of {coverage.length} items
      </p>

      {filtered.length === 0 ? (
        <div className="empty-state card">
          <div className="icon">📰</div>
          <p>{coverage.length === 0 ? 'No coverage yet. Add your first piece of coverage.' : 'No results match your filters.'}</p>
          {coverage.length === 0 && <button className="btn btn-primary" onClick={onAdd}>Add Coverage</button>}
        </div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Title / Publication</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Sentiment</th>
                  <th>Audience</th>
                  <th>Reach</th>
                  <th>Key Msgs</th>
                  <th style={{ textAlign: 'right' }}>Impact</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => {
                  const { color, label } = getImpactLabel(c._score);
                  const campName = getCampaignName(c.campaignId);
                  return (
                    <tr key={c.id}>
                      <td style={{ maxWidth: 280 }}>
                        <div style={{ fontWeight: 500, fontSize: 13, lineHeight: 1.3 }}>
                          {c.articleUrl ? (
                            <a href={c.articleUrl} target="_blank" rel="noopener noreferrer">{c.title}</a>
                          ) : c.title}
                        </div>
                        <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
                          {c.publication}
                          {c.journalist && ` · ${c.journalist}`}
                          {campName && <span style={{ marginLeft: 6, color: '#8b5cf6', fontWeight: 600 }}>· {campName}</span>}
                        </div>
                      </td>
                      <td style={{ fontSize: 12, color: '#555', whiteSpace: 'nowrap' }}>{formatDate(c.publicationDate)}</td>
                      <td style={{ fontSize: 12, color: '#555' }}>{c.mediaType}</td>
                      <td>
                        {c.sentiment && (
                          <span className={`badge sentiment-${c.sentiment.toLowerCase()}`}>{c.sentiment}</span>
                        )}
                      </td>
                      <td style={{ fontSize: 12 }}>
                        {(c.targetAudience || []).map(a => (
                          <span key={a} className="badge badge-grey" style={{ marginRight: 4, fontSize: 10 }}>{a}</span>
                        ))}
                      </td>
                      <td style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{formatReach(c.estimatedReach)}</td>
                      <td style={{ fontSize: 12 }}>
                        {c.keyMessages?.length || 0}/{6}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div title={label} style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          width: 36, height: 36, borderRadius: '50%',
                          background: color, color: '#fff',
                          fontSize: 12, fontWeight: 700,
                        }}>{c._score}</div>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          title="Edit"
                          onClick={() => onEdit(c)}
                          style={{ marginRight: 4 }}
                        >✏️</button>
                        <button
                          className="btn btn-ghost btn-sm"
                          title="Delete"
                          onClick={() => {
                            if (confirm(`Delete "${c.title}"?`)) onDelete(c.id);
                          }}
                        >🗑️</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
