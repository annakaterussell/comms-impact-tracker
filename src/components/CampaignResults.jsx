import { useState } from 'react';
import { computeStats, formatReach, calculateImpactScore, getImpactLabel } from '../utils/calculations.js';
import { KEY_MESSAGES } from '../config/defaultConfig.js';

export default function CampaignResults({ campaigns, coverage, publicationTiers, onNewCampaign, onEditCampaign, onDeleteCampaign, onAddCoverage }) {
  const [activeId, setActiveId] = useState(campaigns[0]?.id || null);

  const activeCampaign = campaigns.find(c => c.id === activeId);
  const campaignCoverage = activeId ? coverage.filter(c => c.campaignId === activeId) : [];
  const stats = computeStats(campaignCoverage, publicationTiers);

  return (
    <div>
      {/* Campaign tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {campaigns.map(c => (
          <button
            key={c.id}
            className={`campaign-tab${c.id === activeId ? ' active' : ''}`}
            onClick={() => setActiveId(c.id)}
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

              {/* Campaign Goals — shown at top */}
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
            </div>
          </div>

          {/* Campaign stats */}
          <div className="score-grid" style={{ marginBottom: 16 }}>
            <SmallTile label="Coverage" value={stats.totalCoverage} />
            <SmallTile label="Total Reach" value={formatReach(stats.totalReach)} />
            <SmallTile label="Avg Impact" value={stats.avgImpactScore || '—'} />
            <SmallTile label="Positive %" value={stats.totalCoverage ? `${Math.round((stats.sentimentCounts.Positive / stats.totalCoverage) * 100)}%` : '—'} />
            <SmallTile label="Consumer Reach" value={`${stats.consumerCount} pieces`} />
          </div>

          {/* Key message pull-through for campaign */}
          {campaignCoverage.length > 0 && (
            <div className="card" style={{ marginBottom: 16 }}>
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
                      const pct = stats.totalCoverage ? Math.round((count / stats.totalCoverage) * 100) : 0;
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
          )}

          {/* Coverage list */}
          <div className="card">
            <div className="card-header">
              <h2>Campaign Coverage ({campaignCoverage.length})</h2>
              <button className="btn btn-primary btn-sm" onClick={onAddCoverage}>+ Add Coverage</button>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              {campaignCoverage.length === 0 ? (
                <div className="empty-state" style={{ padding: 32 }}>
                  <p>No coverage linked to this campaign yet.</p>
                  <p className="text-sm text-muted">When adding coverage, select this campaign from the Campaign dropdown.</p>
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
                      </tr>
                    </thead>
                    <tbody>
                      {campaignCoverage.map(c => {
                        const score = calculateImpactScore(c, coverage, publicationTiers);
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
