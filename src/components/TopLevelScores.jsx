import { useState } from 'react';
import { formatReach } from '../utils/calculations.js';

function ImpactScoreModal({ onClose }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#1e1e2e', color: '#e0e0e0', borderRadius: 12, padding: '28px 32px',
          maxWidth: 520, width: '90%', boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          fontFamily: 'inherit',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>How the Business Impact Score is Calculated</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', color: '#aaa', fontSize: 22,
              cursor: 'pointer', lineHeight: 1, padding: '0 4px',
            }}
            aria-label="Close"
          >×</button>
        </div>

        <p style={{ margin: '0 0 16px', color: '#aaa', fontSize: 13 }}>
          Each piece of coverage is scored 0–100 based on a base score with multipliers applied.
          The tile shows the average across all coverage.
        </p>

        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#a78bfa', marginBottom: 8 }}>Base Score (max 100 pts)</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginBottom: 20 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #333' }}>
              <th style={{ textAlign: 'left', padding: '4px 8px', color: '#aaa', fontWeight: 500 }}>Factor</th>
              <th style={{ textAlign: 'right', padding: '4px 8px', color: '#aaa', fontWeight: 500 }}>Max Pts</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Reach', 25, 'Scaled to estimated audience size'],
              ['Message Alignment', 25, 'Primary + supporting key messages present'],
              ['Audience Precision', 20, 'Coverage targets the right audience'],
              ['Sentiment', 15, 'Positive 15 | Neutral 7 | Negative 0'],
              ['LLM Visibility', 15, 'Presence across AI platforms (max 4)'],
            ].map(([name, pts, note]) => (
              <tr key={name} style={{ borderBottom: '1px solid #2a2a3a' }}>
                <td style={{ padding: '6px 8px' }}>
                  <div style={{ fontWeight: 500 }}>{name}</div>
                  <div style={{ color: '#888', fontSize: 12 }}>{note}</div>
                </td>
                <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 600 }}>{pts}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#a78bfa', marginBottom: 8 }}>Multipliers</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginBottom: 20 }}>
          <tbody>
            {[
              ['Publication Tier', '0.8× – 2.0×', 'Tier 1 outlets score highest'],
              ['Placement Type', 'Proactive 1.2× | Reactive 1.0× | Organic 0.9×', ''],
              ['Executive Visibility', 'Interview 1.5× | Speaking 1.4× | Quote 1.2×', ''],
              ['Company Name in Title', '1.1× if yes', ''],
              ['Target Hit Bonus', '1.15× if pub/journalist matches tracked targets', ''],
            ].map(([name, val, note]) => (
              <tr key={name} style={{ borderBottom: '1px solid #2a2a3a' }}>
                <td style={{ padding: '6px 8px' }}>
                  <div style={{ fontWeight: 500 }}>{name}</div>
                  {note && <div style={{ color: '#888', fontSize: 12 }}>{note}</div>}
                </td>
                <td style={{ padding: '6px 8px', textAlign: 'right', color: '#fbbf24', fontSize: 12 }}>{val}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#a78bfa', marginBottom: 8 }}>Score Bands</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            ['80–100', 'High Impact', '#22c55e'],
            ['60–79', 'Medium', '#f59e0b'],
            ['40–59', 'Low', '#f97316'],
            ['0–39', 'Minimal', '#ef4444'],
          ].map(([range, label, color]) => (
            <div key={range} style={{
              background: '#2a2a3a', borderRadius: 6, padding: '6px 12px',
              borderLeft: `3px solid ${color}`, fontSize: 13,
            }}>
              <span style={{ color, fontWeight: 600 }}>{range}</span>
              <span style={{ color: '#aaa', marginLeft: 6 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TopLevelScores({ stats }) {
  const [showModal, setShowModal] = useState(false);
  const {
    totalCoverage, totalReach, topKeyMessage, topKeyMessagePct,
    targetAudienceScore, execVisibilityRatio, avgImpactScore,
  } = stats;

  return (
    <div>
      {showModal && <ImpactScoreModal onClose={() => setShowModal(false)} />}
      <p className="section-label">Marketing & Communications Objective — Drive Awareness Among EV Drivers</p>
      <div className="score-grid">
        <Tile label="Total Coverage" value={totalCoverage} sub="pieces of coverage" />
        <Tile label="Total Reach" value={formatReach(totalReach)} sub="estimated impressions" />
        <Tile
          label="Top Key Message"
          value={`${topKeyMessagePct}%`}
          sub={topKeyMessage ? `"${topKeyMessage.replace('Mercedes-Benz HPC ', '').replace('Mercedes-Benz ', '')}"` : 'No coverage yet'}
        />
        <Tile
          label="Target Audience"
          value={`${targetAudienceScore}%`}
          sub="Consumer-weighted alignment"
        />
        <Tile
          label="Exec Visibility"
          value={`${execVisibilityRatio}%`}
          sub="of coverage has exec presence"
        />
        <Tile
          label="Business Impact"
          value={avgImpactScore || '—'}
          sub={
            <button
              onClick={() => setShowModal(true)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'inherit', font: 'inherit', padding: 0,
                textDecoration: 'underline dotted', textUnderlineOffset: 3,
              }}
            >
              Avg score (0–100) ⓘ
            </button>
          }
          highlight={avgImpactScore >= 70}
        />
      </div>
    </div>
  );
}

function Tile({ label, value, sub, highlight }) {
  return (
    <div className="score-tile" style={highlight ? { borderColor: '#22c55e', borderWidth: 2 } : {}}>
      <div className="label">{label}</div>
      <div className="value" style={highlight ? { color: '#22c55e' } : {}}>{value}</div>
      <div className="sub">{sub}</div>
    </div>
  );
}
