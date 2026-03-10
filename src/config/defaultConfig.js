export const KEY_MESSAGES = [
  'Mercedes-Benz HPC is a fast EV charging network.',
  'Mercedes-Benz HPC is open to ALL.',
  'Mercedes-Benz HPC is a reliable charging network.',
  'Mercedes-Benz HPC has a desirable amenity offering.',
  'Mercedes-Benz HPC is a leader in EV charging tech.',
  'Mercedes-Benz is customer centric.',
];

export const TARGET_AUDIENCES = ['Consumer', 'Business/Trade'];

export const PLACEMENT_TYPES = ['Proactive', 'Reactive', 'Organic'];

export const MEDIA_TYPES = [
  'Online News',
  'Print News',
  'Newsletter',
  'Influencer',
  'Podcast',
  'Broadcast',
  'Social Media',
];

export const SENTIMENT_OPTIONS = ['Positive', 'Neutral', 'Negative'];

export const EXECUTIVE_VISIBILITY_OPTIONS = ['Interview', 'Speaking', 'Quote'];

export const LLM_PLATFORMS = ['ChatGPT', 'Claude', 'Gemini', 'Perplexity'];

export const DEFAULT_PUBLICATION_TIERS = [
  { id: 'tier1', name: 'National Business', description: 'WSJ, NYT, Bloomberg, Forbes', multiplier: 2.0 },
  { id: 'tier2', name: 'Tech / Auto Tier 1', description: 'TechCrunch, Wired, Car & Driver, Electrek', multiplier: 1.8 },
  { id: 'tier3', name: 'Regional / Trade', description: 'Local news, EV-specific publications', multiplier: 1.2 },
  { id: 'tier4', name: 'Industry / Niche', description: 'Industry newsletters, niche outlets', multiplier: 1.0 },
  { id: 'tier5', name: 'Blog / Influencer', description: 'Personal blogs, micro-influencers', multiplier: 0.8 },
];

export const BUSINESS_OBJECTIVE = {
  name: 'Drive Site Utilization',
  description: 'Drive Site Utilization to 105 kWh/port/day in 2026',
  target: 105,
  unit: 'kWh/port/day',
  year: 2026,
};

export const MARKETING_OBJECTIVE = {
  name: 'Drive Awareness Among EV Drivers',
  description: 'Increase EV driver awareness from a 60% baseline in key markets',
  baseline: 60,
  unit: '%',
};

// Impact score weight definitions (visible to users)
export const IMPACT_SCORE_WEIGHTS = {
  reach: { label: 'Reach', max: 25 },
  messageAlignment: { label: 'Message Alignment', max: 25 },
  audiencePrecision: { label: 'Audience Precision', max: 20 },
  sentiment: { label: 'Sentiment', max: 15 },
  llmVisibility: { label: 'LLM Visibility', max: 15 },
};

export const IMPACT_SCORE_THRESHOLDS = [
  { min: 80, label: 'High Impact', color: '#22c55e' },
  { min: 60, label: 'Medium Impact', color: '#f59e0b' },
  { min: 40, label: 'Low Impact', color: '#f97316' },
  { min: 0, label: 'Minimal Impact', color: '#ef4444' },
];
