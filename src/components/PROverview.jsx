import { useState, useMemo } from 'react';
import { KEY_MESSAGES, LLM_PLATFORMS } from '../config/defaultConfig.js';
import { formatReach, computeStats } from '../utils/calculations.js';

// PROverview now receives pre-filtered coverage from App.jsx (shared date range).
// targets = { outlets: string[], journalists: string[] }
export default function PROverview({
  coverage, totalCoverage, publicationTiers, queries,
  onAddQuery, onDeleteQuery, onAddCoverage,
  targets, onUpdateTargets,
}) {
  const [newOutlet, setNewOutlet] = useState('');
  const [newJournalist, setNewJournalist] = useState('');

  const stats = useMemo(() => computeStats(coverage, publicationTiers, targets), [coverage, publicationTiers, targets]);

  const {
    totalCoverage: filteredTotal, sentimentCounts, keyMessageCounts,
    llmVisibilityCounts, topPublications,
    execInterviews, execSpeaking, execQuotes, execVisibilityRatio,
    consumerCount, businessCount, proactiveCount, targetHitCount,
  } = stats;

  // Sentiment pie
  const sentTotal = (sentimentCounts.Positive || 0) + (sentimentCounts.Neutral || 0) + (sentimentCounts.Negative || 0);
  const pctPos = sentTotal ? Math.round((sentimentCounts.Positive / sentTotal) * 100) : 0;
  const pctNeu = sentTotal ? Math.round((sentimentCounts.Neutral / sentTotal) * 100) : 0;
  const pctNeg = sentTotal ? Math.round((sentimentCounts.Negative / sentTotal) * 100) : 0;

  const pieGradient = sentTotal
    ? `conic-gradient(#22c55e 0% ${pctPos}%, #9ca3af ${pctPos}% ${pctPos + pctNeu}%, #ef4444 ${pctPos + pctNeu}% 100%)`
    : 'conic-gradient(#e0e0e0 0% 100%)';

  const proactivePct = filteredTotal ? Math.round((proactiveCount / filteredTotal) * 100) : 0;

  // Targets helpers
  const outlets = targets?.outlets || [];
  const journalists = targets?.journalists || [];

  function addOutlet() {
    const val = newOutlet.trim();
    if (!val) return;
    onUpdateTargets({ targetOutlets: [...outlets, val], targetJournalists: journalists });
    setNewOutlet('');
  }

  function removeOutlet(i) {
    onUpdateTargets({ targetOutlets: outlets.filter((_, idx) => idx !== i), targetJournalists: journalists });
  }

  function addJournalist() {
    const val = newJournalist.trim();
    if (!val) return;
    onUpdateTargets({ targetOutlets: outlets, targetJournalists: [...journalists, val] });
    setNewJournalist('');
  }

  function removeJournalist(i) {
    onUpdateTargets({ targetOutlets: outlets, targetJournalists: journalists.filter((_, idx) => idx !== i) });
  }

  // Coverage earned from target outlets
  const targetOutletHits = useMemo(() => {
    if (!outlets.length) return {};
    const hits = {};
    outlets.forEach(o => {
      hits[o] = coverage.filter(c => c.publication?.toLowerCase().includes(o.toLowerCase())).length;
    });
    return hits;
  }, [coverage, outlets]);

  // Coverage earned from target journalists
  const targetJournalistHits = useMemo(() => {
    if (!journalists.length) return {};
    const hits = {};
    journalists.forEach(j => {
      hits[j] = coverage.filter(c => c.journalist?.toLowerCase().includes(j.toLowerCase())).length;
    });
    return hits;
  }, [coverage, journalists]);

  return (
    <div>
      {/* Proactive Coverage summary */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header"><h2>Marketing &amp; Communications Objectives</h2></div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
            <MetricTile
              label="Total Coverage"
              value={filteredTotal}
              sub={filteredTotal !== totalCoverage ? `of ${totalCoverage} all time` : undefined}
            />
            <MetricTile
              label="Proactive Coverage"
              value={`${proactiveCount} / ${filteredTotal}`}
              sub={`${proactivePct}% proactive`}
              highlight={proactivePct >= 50}
            />
            {(outlets.length > 0 || journalists.length > 0) && (
              <MetricTile
                label="Target Coverage Earned"
                value={targetHitCount}
                sub={`of ${outlets.length + journalists.length} targets tracked`}
                highlight={targetHitCount > 0}
              />
            )}
          </div>
        </div>
      </div>

      {/* Target Outlets & Reporters */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header"><h2>Target Outlets &amp; Reporters</h2></div>
        <div className="card-body">
          <p className="text-sm text-muted" style={{ marginBottom: 16 }}>
            Track target publications and journalists. Coverage from these targets earns a 1.15× impact score bonus.
          </p>
          <div className="grid-2">
            {/* Target Outlets */}
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>Target Outlets</p>
              {outlets.length === 0 && (
                <p className="text-sm text-muted" style={{ marginBottom: 10 }}>No target outlets yet.</p>
              )}
              {outlets.map((o, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{o}</span>
                    {targetOutletHits[o] > 0 ? (
                      <span className="badge badge-green" style={{ marginLeft: 8, fontSize: 10 }}>{targetOutletHits[o]} earned</span>
                    ) : (
                      <span className="badge badge-grey" style={{ marginLeft: 8, fontSize: 10 }}>0 earned</span>
                    )}
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={() => removeOutlet(i)} title="Remove">×</button>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                <input
                  value={newOutlet}
                  onChange={e => setNewOutlet(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addOutlet()}
                  placeholder="Add outlet name…"
                  style={{ flex: 1, padding: '6px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13 }}
                />
                <button className="btn btn-secondary btn-sm" onClick={addOutlet}>Add</button>
              </div>
            </div>

            {/* Target Journalists */}
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>Target Journalists</p>
              {journalists.length === 0 && (
                <p className="text-sm text-muted" style={{ marginBottom: 10 }}>No target journalists yet.</p>
              )}
              {journalists.map((j, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{j}</span>
                    {targetJournalistHits[j] > 0 ? (
                      <span className="badge badge-green" style={{ marginLeft: 8, fontSize: 10 }}>{targetJournalistHits[j]} earned</span>
                    ) : (
                      <span className="badge badge-grey" style={{ marginLeft: 8, fontSize: 10 }}>0 earned</span>
                    )}
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={() => removeJournalist(i)} title="Remove">×</button>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                <input
                  value={newJournalist}
                  onChange={e => setNewJournalist(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addJournalist()}
                  placeholder="Add journalist name…"
                  style={{ flex: 1, padding: '6px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13 }}
                />
                <button className="btn btn-secondary btn-sm" onClick={addJournalist}>Add</button>
              </div>
            </div>
          </div>
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
                  const pct = filteredTotal ? Math.round((count / filteredTotal) * 100) : 0;
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
              <AudienceBar label="Consumer" count={consumerCount} total={filteredTotal} primary />
              <AudienceBar label="Business / Trade" count={businessCount} total={filteredTotal} />
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
            {sentTotal === 0 ? (
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
              const pct = filteredTotal ? Math.round((count / filteredTotal) * 100) : 0;
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
                      <td>
                        {pub.name}
                        {outlets.some(o => pub.name.toLowerCase().includes(o.toLowerCase())) && (
                          <span className="badge badge-amber" style={{ marginLeft: 6, fontSize: 10 }}>target</span>
                        )}
                      </td>
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

function MetricTile({ label, value, sub, highlight }) {
  return (
    <div style={{ padding: '12px 16px', background: '#f8f8f8', borderRadius: 8, borderLeft: highlight ? '3px solid #22c55e' : '3px solid #e0e0e0' }}>
      <p style={{ fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 22, fontWeight: 700, color: highlight ? '#22c55e' : '#1a1a1a' }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{sub}</p>}
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
