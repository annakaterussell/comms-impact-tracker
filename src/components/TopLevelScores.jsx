import { formatReach } from '../utils/calculations.js';

const IMPACT_DEF = `The Business Impact Score combines:
• Base Score: Reach (25pts) + Message Alignment (25pts) + Audience Precision (20pts) + Sentiment (15pts) + LLM Visibility (15pts)
• Multipliers: Publication Tier (0.8×–2.0×) × Placement Type (Proactive 1.2×, Reactive 1.0×, Organic 0.9×) × Executive Visibility (Interview 1.5×, Speaking 1.4×, Quote 1.2×)
• Result: 80–100 = High Impact | 60–79 = Medium | 40–59 = Low | <40 = Minimal`;

export default function TopLevelScores({ stats }) {
  const {
    totalCoverage, totalReach, topKeyMessage, topKeyMessagePct,
    targetAudienceScore, execVisibilityRatio, avgImpactScore,
  } = stats;

  return (
    <div>
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
          sub={<span style={{ cursor: 'help' }} title={IMPACT_DEF}>Avg score (0–100) ⓘ</span>}
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
