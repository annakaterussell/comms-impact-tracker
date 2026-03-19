import { useState, useMemo } from 'react';
import { computeStats, formatReach, calculateImpactScore, getImpactLabel } from '../utils/calculations.js';
import { KEY_MESSAGES, LLM_PLATFORMS } from '../config/defaultConfig.js';

export default function CampaignResults({
  campaigns, coverage, publicationTiers, targets,
  onNewCampaign, onEditCampaign, onDeleteCampaign,
  onAddCoverage, onEditCoverage,
}) {
  const [activeId, setActiveId] = useState(campaigns[0]?.id || null);
  const [coverageSearch, setCoverageSearch] = useState('');
  const [coverageSentiment, setCoverageSentiment] = useState('');
  const [coverageSort, setCoverageSort] = useState('date-desc');

  const activeCampaign = campaigns.find(c => c.id === activeId);
  const campaignCoverage = activeId ? coverage.filter(c => c.campaignId === activeId) : [];
  const stats = computeStats(campaignCoverage, publicationTiers, targets);

  // Filter + sort coverage list
  const filteredCoverage = useMemo(() => {
    let data = [...campaignCoverage];
    if (coverageSearch) {
      const q = coverageSearch.toLowerCase();
      data = data.filter(c =>
        c.title?.toLowerCase().includes(q) ||
        c.publication?.toLowerCase().includes(q) ||
        c.journalist?.toLowerCase().includes(q)
      );
    }
    if (coverageSentiment) data = data.filter(c => c.sentiment === coverageSentiment);
    if (coverageSort === 'date-desc') data.sort((a, b) => (b.publicationDate || '').localeCompare(a.publicationDate || ''));
    if (coverageSort === 'date-asc') data.sort((a, b) => (a.publicationDate || '').localeCompare(b.publicationDate || ''));
    if (coverageSort === 'impact-desc') data.sort((a, b) => calculateImpactScore(b, coverage, publicationTiers, targets) - calculateImpactScore(a, coverage, publicationTiers, targets));
    return data;
  }, [campaignCoverage, coverageSearch, coverageSentiment, coverageSort, coverage, publicationTiers, targets]);

  // Stats helpers
  const {
    totalCoverage, sentimentCounts, keyMessageCounts,
    llmVisibilityCounts, execInterviews, execSpeaking, execQuotes, execVisibilityRatio,
    consumerCount, businessCount, proactiveCount,
  } = stats;

  const sentTotal = (sentimentCounts.Positive || 0) + (sentimentCounts.Neutral || 0) + (sentimentCounts.Negative || 0);
  const pctPos = sentTotal ? Math.round((sentimentCounts.Positive / sentTotal) * 100) : 0;
  const pctNeu = sentTotal ? Math.round((sentimentCounts.Neutral / sentTotal) * 100) : 0;
  const pctNeg = sentTotal ? Math.round((sentimentCounts.Negative / sentTotal) * 100) : 0;
  const pieGradient = sentTotal
    ? `conic-gradient(#22c55e 0% ${pctPos}%, #9ca3af ${pctPos}% ${pctPos + pctNeu}%, #ef4444 ${pctPos + pctNeu}% 100%)`
    : 'conic-gradient(#e0e0e0 0% 100%)';
  const proactivePct = totalCoverage ? Math.round((proactiveCount / totalCoverage) * 100) : 0;

  return (
    <div>
      {/* Campaign tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {campaigns.map(c => (
          <button
            key={c.id}
            className={`campaign-tab${c.id === activeId ? ' active' : ''}`}
            onClick={() => { setActiveId(c.id); setCoverageSearch(''); setCoverageSentiment(''); setCoverageSort('date-desc'); }}
          >{c.name}</button>
        ))}
        <button className="btn btn-secondary btn-sm" onClick={onNewCampaign}>+ New Campaign</button>
      </div>

      {campaigns.length === 0 && (
        <div className="empty-state card">
          <div className="icon">📋</div>
          <p>No campaigns yet. Create your first campaign to start tracking results.</p>
          <button className="btn btn-primary" onClick={onNewCampaign}>Create Campaign</button>
        </div>
      )}

      {activeCampaign && (
        <>
          {/* Campaign header */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-body">
              <div className="flex justify-between items-center" style={{ marginBottom: 12 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700 }}>{activeCampaign.name}</h2>
                <div className="flex gap-2">
                  <button className="btn btn-secondary btn-sm" onClick={() => onEditCampaign(activeCampaign)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => {
                    if (confirm(`Delete campaign "${activeCampaign.name}"? This does not delete the linked coverage.`)) {
                      onDeleteCampaign(activeCampaign.id);
                      setActiveId(campaigns.find(c => c.id !== activeCampaign.id)?.id || null);
                    }
                  }}>Delete</button>
                </div>
              </div>

              {/* Campaign Overview */}
              {activeCampaign.overview && (
                <div style={{ marginBottom: 14, padding: '12px 16px', background: '#f0f7ff', borderRadius: 8, borderLeft: '3px solid #3b82f6' }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Overview</p>
                  <p style={{ fontSize: 13, color: '#333', lineHeight: 1.5 }}>{activeCampaign.overview}</p>
                </div>
              )}

              {/* Campaign Goals */}
              {(() => {
                const goals = (activeCampaign.goals || []).filter(g => g.trim());
                const legacyGoal = activeCampaign.goal;
                const allGoals = goals.length > 0 ? goals : (legacyGoal ? [legacyGoal] : []);
                return allGoals.length > 0 ? (
                  <div style={{ marginBottom: 14, padding: '12px 16px', background: '#f8f8f8', borderRadius: 8, borderLeft: '3px solid #1a1a1a' }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Campaign Goals</p>
                    {allGoals.map((g, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, marginBottom: i < allGoals.length - 1 ? 6 : 0 }}>
                        <span style={{ fontSize: 13, color: '#1a1a1a', fontWeight: 600, flexShrink: 0 }}>{i + 1}.</span>
                        <span style={{ fontSize: 13, color: '#333', lineHeight: 1.4 }}>{g}</span>
                      </div>
                    ))}
                  </div>
                ) : null;
              })()}

              <div className="grid-3" style={{ fontSize: 13, gap: 12 }}>
                {activeCampaign.startDate && (
                  <InfoRow label="Date Range" value={`${activeCampaign.startDate} → ${activeCampaign.endDate || 'ongoing'}`} />
                )}
                {activeCampaign.targetAudience?.length > 0 && (
                  <InfoRow label="Target Audience" value={activeCampaign.targetAudience.join(', ')} />
                )}
                {(activeCampaign.targets || []).filter(t => t.trim()).length > 0 && (
                  <InfoRow label="Target Publications" value={(activeCampaign.targets).filter(t => t.trim()).join(', ')} />
                )}
              </div>

              {/* Key messages */}
              {(activeCampaign.keyMessages?.length > 0 || activeCampaign.campaignKeyMessage) && (
                <div style={{ marginTop: 12 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>Key Messages</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {(activeCampaign.keyMessages || []).map(m => (
                      <span key={m} className="badge badge-grey" style={{ fontSize: 11 }}>{m}</span>
                    ))}
                    {activeCampaign.campaignKeyMessage && (
                      <span className="badge badge-amber" style={{ fontSize: 11 }}>★ {activeCampaign.campaignKeyMessage}</span>
                    )}
                  </div>
                </div>
              )}

              {(() => {
                const qs = (activeCampaign.llmQueries || []).filter(q => q.trim());
                const legacyQ = activeCampaign.llmQuery;
                const allQ = qs.length > 0 ? qs : (legacyQ ? [legacyQ] : []);
                return allQ.length > 0 ? (
                  <div style={{ marginTop: 12 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>LLM Queries</p>
                    {allQ.map((q, i) => (
                      <p key={i} style={{ fontSize: 13, fontStyle: 'italic', color: '#333', marginBottom: 4 }}>"{q}"</p>
                    ))}
                  </div>
                ) : null;
              })()}

              {/* Key Findings */}
              {activeCampaign.keyFindings && (
                <div style={{ marginTop: 14, padding: '12px 16px', background: '#f0fff4', borderRadius: 8, borderLeft: '3px solid #22c55e' }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#22c55e', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Key Findings</p>
                  <p style={{ fontSize: 13, color: '#333', lineHeight: 1.5 }}>{activeCampaign.keyFindings}</p>
                </div>
              )}
            </div>
          </div>

          {/* Campaign summary stats */}
          <div className="score-grid" style={{ marginBottom: 16 }}>
            <SmallTile label="Coverage" value={stats.totalCoverage} />
            <SmallTile label="Total Reach" value={formatReach(stats.totalReach)} />
            <SmallTile label="Avg Impact" value={stats.avgImpactScore || '—'} />
            <SmallTile label="Positive %" value={stats.totalCoverage ? `${Math.round((stats.sentimentCounts.Positive / stats.totalCoverage) * 100)}%` : '—'} />
            <SmallTile label="Consumer Reach" value={`${stats.consumerCount} pieces`} />
            <SmallTile label="Proactive %" value={stats.totalCoverage ? `${proactivePct}%` : '—'} />
          </div>

          {/* Full metrics — same as Marketing & Communications Objectives */}
          {campaignCoverage.length > 0 && (
            <>
              {/* Row: Key Message + Audience */}
              <div className="grid-2" style={{ marginBottom: 16 }}>
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
                          const count = stats.keyMessageCounts[m] || 0;
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
                        {activeCampaign.campaignKeyMessage && (
                          <tr style={{ background: '#fffbeb' }}>
                            <td style={{ fontSize: 12 }}>★ {activeCampaign.campaignKeyMessage}</td>
                            <td style={{ textAlign: 'right', color: '#888' }}>—</td>
                            <td style={{ textAlign: 'right', color: '#888' }}>—</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

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
                    </div>
                  </div>
                </div>
              </div>

              {/* Row: Sentiment + LLM */}
              <div className="grid-2" style={{ marginBottom: 16 }}>
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
            </>
          )}

          {/* Coverage list with filters */}
          <div className="card">
            <div className="card-header">
              <h2>Campaign Coverage ({campaignCoverage.length})</h2>
              <button className="btn btn-primary btn-sm" onClick={onAddCoverage}>+ Add Coverage</button>
            </div>

            {campaignCoverage.length > 0 && (
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <input
                  value={coverageSearch}
                  onChange={e => setCoverageSearch(e.target.value)}
                  placeholder="Search title, publication, journalist…"
                  style={{ flex: 1, minWidth: 180, padding: '6px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13 }}
                />
                <select
                  value={coverageSentiment}
                  onChange={e => setCoverageSentiment(e.target.value)}
                  style={{ padding: '6px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13 }}
                >
                  <option value="">All Sentiment</option>
                  <option>Positive</option>
                  <option>Neutral</option>
                  <option>Negative</option>
                </select>
                <select
                  value={coverageSort}
                  onChange={e => setCoverageSort(e.target.value)}
                  style={{ padding: '6px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13 }}
                >
                  <option value="date-desc">Newest first</option>
                  <option value="date-asc">Oldest first</option>
                  <option value="impact-desc">Highest impact</option>
                </select>
                {(coverageSearch || coverageSentiment) && (
                  <span className="text-sm text-muted">Showing {filteredCoverage.length} of {campaignCoverage.length}</span>
                )}
              </div>
            )}

            <div className="card-body" style={{ padding: 0 }}>
              {campaignCoverage.length === 0 ? (
                <div className="empty-state" style={{ padding: 32 }}>
                  <p>No coverage linked to this campaign yet.</p>
                  <p className="text-sm text-muted">When adding coverage, select this campaign from the Campaign dropdown.</p>
                </div>
              ) : filteredCoverage.length === 0 ? (
                <div className="empty-state" style={{ padding: 24 }}>
                  <p className="text-sm text-muted">No results match your filters.</p>
                </div>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Publication</th>
                        <th>Date</th>
                        <th>Sentiment</th>
                        <th style={{ textAlign: 'right' }}>Impact</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCoverage.map(c => {
                        const score = calculateImpactScore(c, coverage, publicationTiers, targets);
                        const { color } = getImpactLabel(score);
                        return (
                          <tr key={c.id}>
                            <td>
                              {c.articleUrl ? (
                                <a href={c.articleUrl} target="_blank" rel="noopener noreferrer">{c.title}</a>
                              ) : c.title}
                            </td>
                            <td style={{ color: '#555' }}>{c.publication}</td>
                            <td style={{ color: '#888', fontSize: 12, whiteSpace: 'nowrap' }}>{c.publicationDate}</td>
                            <td>
                              <span className={`badge sentiment-${(c.sentiment || '').toLowerCase()}`}>{c.sentiment}</span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <span style={{ fontWeight: 700, color }}>{score}</span>
                            </td>
                            <td style={{ whiteSpace: 'nowrap' }}>
                              {onEditCoverage && (
                                <button
                                  className="btn btn-ghost btn-sm"
                                  title="Edit"
                                  onClick={() => onEditCoverage(c)}
                                  style={{ marginRight: 4 }}
                                >✏️</button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>{label}</p>
      <p style={{ fontSize: 13 }}>{value}</p>
    </div>
  );
}

function SmallTile({ label, value }) {
  return (
    <div className="score-tile">
      <div className="label">{label}</div>
      <div className="value" style={{ fontSize: 22 }}>{value}</div>
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
