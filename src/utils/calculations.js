import { KEY_MESSAGES, DEFAULT_PUBLICATION_TIERS, IMPACT_SCORE_THRESHOLDS } from '../config/defaultConfig.js';

// ── Impact Score ────────────────────────────────────────────────────────────

export function calculateImpactScore(item, allCoverage, publicationTiers = DEFAULT_PUBLICATION_TIERS) {
  const maxReach = Math.max(...allCoverage.map(c => Number(c.estimatedReach) || 0), 1);

  // Base components (0–100 total)
  const reachScore = (Math.min(Number(item.estimatedReach) || 0, maxReach) / maxReach) * 25;
  const messageScore = ((item.keyMessages?.length || 0) / KEY_MESSAGES.length) * 25;
  const audienceScore = (item.targetAudience?.length > 0) ? 20 : 0;
  const sentimentScore = item.sentiment === 'Positive' ? 15 : item.sentiment === 'Neutral' ? 7 : 0;
  const llmScore = ((item.llmVisibility?.length || 0) / 4) * 15;

  const baseScore = reachScore + messageScore + audienceScore + sentimentScore + llmScore;

  // Multipliers
  const tier = publicationTiers.find(t => t.id === item.publicationTierId);
  const tierMult = tier ? tier.multiplier : 1.0;

  const placementMult = { Proactive: 1.2, Reactive: 1.0, Organic: 0.9 }[item.placementType] || 1.0;

  const execViz = item.executiveVisibility || [];
  const execMult = execViz.includes('Interview') ? 1.5
    : execViz.includes('Speaking') ? 1.4
    : execViz.includes('Quote') ? 1.2
    : 1.0;

  return Math.min(100, Math.round(baseScore * tierMult * placementMult * execMult));
}

export function getImpactLabel(score) {
  return IMPACT_SCORE_THRESHOLDS.find(t => score >= t.min) || IMPACT_SCORE_THRESHOLDS[IMPACT_SCORE_THRESHOLDS.length - 1];
}

// ── Aggregated Stats ────────────────────────────────────────────────────────

export function computeStats(coverage, publicationTiers = DEFAULT_PUBLICATION_TIERS) {
  if (!coverage.length) {
    return {
      totalCoverage: 0,
      totalReach: 0,
      topKeyMessage: null,
      topKeyMessagePct: 0,
      consumerReach: 0,
      businessReach: 0,
      targetAudienceScore: 0,
      execVisibilityRatio: 0,
      execInterviews: 0,
      execSpeaking: 0,
      execQuotes: 0,
      avgImpactScore: 0,
      sentimentCounts: { Positive: 0, Neutral: 0, Negative: 0 },
      llmVisibilityCounts: {},
      topPublications: [],
      keyMessageCounts: {},
    };
  }

  const total = coverage.length;
  const totalReach = coverage.reduce((s, c) => s + (Number(c.estimatedReach) || 0), 0);

  // Key message counts
  const keyMessageCounts = {};
  KEY_MESSAGES.forEach(m => { keyMessageCounts[m] = 0; });
  coverage.forEach(c => {
    (c.keyMessages || []).forEach(m => {
      if (keyMessageCounts[m] !== undefined) keyMessageCounts[m]++;
    });
  });
  const topMessageEntry = Object.entries(keyMessageCounts).sort((a, b) => b[1] - a[1])[0];
  const topKeyMessage = topMessageEntry?.[0] || null;
  const topKeyMessagePct = topMessageEntry ? Math.round((topMessageEntry[1] / total) * 100) : 0;

  // Target audience — Consumer weighted 2x
  const consumerCount = coverage.filter(c => c.targetAudience?.includes('Consumer')).length;
  const businessCount = coverage.filter(c => c.targetAudience?.includes('Business/Trade')).length;
  const weightedAudienceScore = total > 0
    ? Math.min(100, Math.round(((consumerCount * 2 + businessCount) / (total * 2)) * 100))
    : 0;

  // Executive visibility — count unique articles with ANY exec visibility
  const execItems = coverage.filter(c => c.executiveVisibility?.length > 0);
  const execVisibilityRatio = Math.round((execItems.length / total) * 100);
  const execInterviews = coverage.filter(c => c.executiveVisibility?.includes('Interview')).length;
  const execSpeaking = coverage.filter(c => c.executiveVisibility?.includes('Speaking')).length;
  const execQuotes = coverage.filter(c => c.executiveVisibility?.includes('Quote')).length;

  // Impact scores
  const scores = coverage.map(c => calculateImpactScore(c, coverage, publicationTiers));
  const avgImpactScore = Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);

  // Sentiment
  const sentimentCounts = { Positive: 0, Neutral: 0, Negative: 0 };
  coverage.forEach(c => {
    if (c.sentiment in sentimentCounts) sentimentCounts[c.sentiment]++;
  });

  // LLM visibility
  const llmVisibilityCounts = {};
  coverage.forEach(c => {
    (c.llmVisibility || []).forEach(platform => {
      llmVisibilityCounts[platform] = (llmVisibilityCounts[platform] || 0) + 1;
    });
  });

  // Top publications
  const pubCounts = {};
  coverage.forEach(c => {
    if (c.publication) pubCounts[c.publication] = (pubCounts[c.publication] || 0) + 1;
  });
  const topPublications = Object.entries(pubCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  return {
    totalCoverage: total,
    totalReach,
    topKeyMessage,
    topKeyMessagePct,
    consumerCount,
    businessCount,
    targetAudienceScore: weightedAudienceScore,
    execVisibilityRatio,
    execInterviews,
    execSpeaking,
    execQuotes,
    avgImpactScore,
    sentimentCounts,
    llmVisibilityCounts,
    topPublications,
    keyMessageCounts,
  };
}

// ── Formatting helpers ──────────────────────────────────────────────────────

export function formatReach(n) {
  if (!n) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}
