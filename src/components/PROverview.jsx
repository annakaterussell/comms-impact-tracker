import { useState, useMemo } from 'react';
import { KEY_MESSAGES, LLM_PLATFORMS } from '../config/defaultConfig.js';
import { formatReach, computeStats } from '../utils/calculations.js';

const DATE_PRESETS = [
  { label: 'All time', value: 'all' },
  { label: 'This month', value: 'month' },
  { label: 'This quarter', value: 'quarter' },
  { label: 'This year', value: 'year' },
  { label: 'Custom', value: 'custom' },
];

function getPresetRange(preset) {
  const now = new Date();
  if (preset === 'month') {
    return {
      from: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0],
      to: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0],
    };
  }
  if (preset === 'quarter') {
    const q = Math.floor(now.getMonth() / 3);
    return {
      from: new Date(now.getFullYear(), q * 3, 1).toISOString().split('T')[0],
      to: new Date(now.getFullYear(), q * 3 + 3, 0).toISOString().split('T')[0],
    };
  }
  if (preset === 'year') {
    return {
      from: `${now.getFullYear()}-01-01`,
      to: `${now.getFullYear()}-12-31`,
    };
  }
  return null;
}

export default function PROverview({ coverage, publicationTiers, queries, onAddQuery, onDeleteQuery, onAddCoverage }) {
  const [preset, setPreset] = useState('all');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  const filteredCoverage = useMemo(() => {
    let range = null;
    if (preset !== 'all' && preset !== 'custom') range = getPresetRange(preset);
    else if (preset === 'custom' && (customFrom || customTo)) range = { from: customFrom, to: customTo };

    if (!range) return coverage;
    return coverage.filter(c => {
      if (!c.publicationDate) return true;
      if (range.from && c.publicationDate < range.from) return false;
      if (range.to && c.publicationDate > range.to) return false;
      return true;
    });
  }, [coverage, preset, customFrom, customTo]);

  const stats = useMemo(() => computeStats(filteredCoverage, publicationTiers), [filteredCoverage, publicationTiers]);

  const {
    totalCoverage, sentimentCounts, keyMessageCounts,
    llmVisibilityCounts, topPublications,
    execInterviews, execSpeaking, execQuotes, execVisibilityRatio,
    consumerCount, businessCount,
  } = stats;

  // Sentiment pie
  const total = (sentimentCounts.Positive || 0) + (sentimentCounts.Neutral || 0) + (sentimentCounts.Negative || 0);
  const pctPos = total ? Math.round((sentimentCounts.Positive / total) * 100) : 0;
  const pctNeu = total ? Math.round((sentimentCounts.Neutral / total) * 100) : 0;
  const pctNeg = total ? Math.round((sentimentCounts.Negative / total) * 100) : 0;

  const pieGradient = total
    ? `conic-gradient(#22c55e 0% ${pctPos}%, #9ca3af ${pctPos}% ${pctPos + pctNeu}%, #ef4444 ${pctPos + pctNeu}% 100%)`
    : 'conic-gradient(#e0e0e0 0% 100%)';

  return (
    <div>
      {/* Date range filter */}
      <div className="card" style={{ marginBottom: 16, padding: '12px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Filter by date:</span>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {DATE_PRESETS.map(p => (
              <button
                key={p.value}
                className={`filter-btn${preset === p.value ? ' active' : ''}`}
                onClick={() => setPreset(p.value)}
              >{p.label}</button>
            ))}
          </div>
          {preset === 'custom' && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="date"
                value={customFrom}
                onChange={e => setCustomFrom(e.target.value)}
                style={{ padding: '6px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13 }}
                placeholder="From"
              />
              <span style={{ fontSize: 12, color: '#888' }}>to</span>
              <input
                type="date"
                value={customTo}
                onChange={e => setCustomTo(e.target.value)}
                style={{ padding: '6px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13 }}
                placeholder="To"
              />
            </div>
          )}
          {preset !== 'all' && (
            <span className="text-sm text-muted" style={{ marginLeft: 4 }}>
              Showing {filteredCoverage.length} of {coverage.length} items
            </span>
          )}
        </div>
      </div>

      {/* Row 1: Key Messages + Audience */}
      <div className="grid-2" style={{ marginBottom: 16 }}>

        {/* Key Message Pull-Through */}
        <div className="card">
          <div className="card-header"><h2>Key Message Pull-Through</h2></div>
          <div className="card-body" style={{ padding: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Message</th>
                  <th style={{ width: 60, textAlign: 'right' }}>Mentions</th>
                  <th style={{ width: 60, textAlign: 'right' }}>%</th>
                </tr>
              </thead>
              <tbody>
                {KEY_MESSAGES.map(m => {
                  const count = keyMessageCounts[m] || 0;
                  const pct = totalCoverage ? Math.round((count / totalCoverage) * 100) : 0;
                  return (
                    <tr key={m}>
                      <td style={{ fontSize: 12 }}>{m}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{count}</td>
                      <td style={{ textAlign: 'right' }}>
                        <span className={`badge ${pct >= 50 ? 'badge-green' : pct >= 25 ? 'badge-amber' : 'badge-grey'}`}>{pct}%</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Target Audience + Executive Visibility */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="card-header"><h2>Target Audience Reach</h2></div>
            <div className="card-body">
              <p className="text-sm text-muted" style={{ marginBottom: 12 }}>Consumer audience is weighted 2× (primary target)</p>
              <AudienceBar label="Consumer" count={consumerCount} total={totalCoverage} primary />
              <AudienceBar label="Business / Trade" count={businessCount} total={totalCoverage} />
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2>Executive Visibility</h2>
              <span className="badge badge-blue">{execVisibilityRatio}% of coverage</span>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <ExecStat label="Interviews" count={execInterviews} />
                <ExecStat label="Speaking" count={execSpeaking} />
                <ExecStat label="Quotes" count={execQuotes} />
              </div>
              <p className="text-sm text-muted" style={{ marginTop: 10 }}>
                Ratio = unique articles with exec presence ÷ total coverage (never exceeds 100%)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Sentiment + LLM */}
      <div className="grid-2" style={{ marginBottom: 16 }}>

        {/* Sentiment */}
        <div className="card">
          <div className="card-header"><h2>Sentiment Distribution</h2></div>
          <div className="card-body">
            {total === 0 ? (
              <p className="text-sm text-muted">No coverage with sentiment data yet.</p>
            ) : (
              <div className="pie-wrap">
                <div className="pie" style={{ width: 120, height: 120, background: pieGradient }} />
                <div className="pie-legend">
                  <PieLegendItem color="#22c55e" label="Positive" count={sentimentCounts.Positive} pct={pctPos} />
                  <PieLegendItem color="#9ca3af" label="Neutral" count={sentimentCounts.Neutral} pct={pctNeu} />
                  <PieLegendItem color="#ef4444" label="Negative" count={sentimentCounts.Negative} pct={pctNeg} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* LLM Visibility */}
        <div className="card">
          <div className="card-header"><h2>LLM Visibility</h2></div>
          <div className="card-body">
            {LLM_PLATFORMS.map(p => {
              const count = llmVisibilityCounts[p] || 0;
              const pct = totalCoverage ? Math.round((count / totalCoverage) * 100) : 0;
              return (
                <div key={p} style={{ marginBottom: 12 }}>
                  <div className="flex justify-between" style={{ marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{p}</span>
                    <span style={{ fontSize: 13, color: '#555' }}>{pct}% ({count})</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill progress-fill-blue" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 3: LLM Queries + Top Publications */}
      <div className="grid-2" style={{ marginBottom: 16 }}>

        {/* LLM Queries */}
        <div className="card">
          <div className="card-header">
            <h2>LLM Queries to Support</h2>
            <button className="btn btn-secondary btn-sm" onClick={onAddQuery}>+ Add Query</button>
          </div>
          <div className="card-body">
            {queries.length === 0 ? (
              <p className="text-sm text-muted">No queries tracked yet. Add queries you want your PR coverage to support in AI search results.</p>
            ) : (
              queries.map(q => {
                const linkedCoverage = coverage.filter(c => c.llmQuery === q.query);
                return (
                  <div key={q.id} className="query-item">
                    <div style={{ flex: 1 }}>
                      <p className="query-text">"{q.query}"</p>
                      <p className="query-links">
                        {linkedCoverage.length === 0
                          ? 'No coverage linked yet'
                          : `${linkedCoverage.length} piece(s) of coverage linked`}
                        {q.campaign && <span> · Campaign: {q.campaign}</span>}
                        {q.fromCampaign && <span style={{ color: '#8b5cf6', fontWeight: 600 }}> · From campaign</span>}
                      </p>
                    </div>
                    {!q.fromCampaign && (
                      <button className="btn-ghost btn btn-sm" onClick={() => onDeleteQuery(q.id)} title="Remove query">×</button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Top Publications */}
        <div className="card">
          <div className="card-header"><h2>Top Publications</h2></div>
          <div className="card-body" style={{ padding: 0 }}>
            {topPublications.length === 0 ? (
              <p className="text-sm text-muted" style={{ padding: 16 }}>No coverage yet.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Publication</th>
                    <th style={{ textAlign: 'right' }}>Coverage</th>
                  </tr>
                </thead>
                <tbody>
                  {topPublications.map((pub, i) => (
                    <tr key={pub.name}>
                      <td style={{ color: '#888', width: 32 }}>{i + 1}</td>
                      <td>{pub.name}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{pub.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AudienceBar({ label, count, total, primary }) {
  const pct = total ? Math.round((count / total) * 100) : 0;
  return (
    <div style={{ marginBottom: 14 }}>
      <div className="flex justify-between" style={{ marginBottom: 4 }}>
        <span style={{ fontSize: 13, fontWeight: 500 }}>
          {label}
          {primary && <span style={{ marginLeft: 6, fontSize: 10, color: '#22c55e', fontWeight: 700 }}>2× weight</span>}
        </span>
        <span style={{ fontSize: 13, color: '#555' }}>{count} ({pct}%)</span>
      </div>
      <div className="progress-bar">
        <div className={`progress-fill ${primary ? 'progress-fill-green' : 'progress-fill-blue'}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function ExecStat({ label, count }) {
  return (
    <div style={{ textAlign: 'center', padding: '12px 8px', background: '#f5f5f5', borderRadius: 8 }}>
      <div style={{ fontSize: 22, fontWeight: 700 }}>{count}</div>
      <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{label}</div>
    </div>
  );
}

function PieLegendItem({ color, label, count, pct }) {
  return (
    <div className="pie-legend-item">
      <div className="pie-dot" style={{ background: color }} />
      <span style={{ fontWeight: 500 }}>{label}</span>
      <span className="text-muted text-sm">{count} ({pct}%)</span>
    </div>
  );
}
