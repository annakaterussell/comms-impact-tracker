export const defaultConfig = {
  keyMessages: [
    { id: '1', text: 'Mercedes-Benz HPC is a fast EV charging network.' },
    { id: '2', text: 'Mercedes-Benz HPC is open to ALL.' },
    { id: '3', text: 'Mercedes-Benz HPC is a reliable charging network.' },
    { id: '4', text: 'Mercedes-Benz HPC has a desirable amenity offering.' },
    { id: '5', text: 'Mercedes-Benz HPC is a leader in EV charging tech.' },
    { id: '6', text: 'Mercedes-Benz is customer centric.' }
  ],
  targetAudiences: [
    { id: '1', name: 'Consumer' },
    { id: '2', name: 'Business/Trade' }
  ],
  llmModels: ['ChatGPT', 'Claude', 'Gemini', 'Perplexity'],
  mediaTypes: ['Online News', 'Print News', 'Newsletter', 'Influencer', 'Podcast', 'Broadcast', 'Social Media'],
  // Publication Tiers: These multipliers affect impact scores
  // National Business (2.0x) - Major national business publications like WSJ, NYT, Bloomberg
  // Tech/Auto Tier 1 (1.8x) - Top tech and automotive publications like TechCrunch, Wired, Car & Driver
  // Regional/Trade (1.2x) - Local news outlets and EV-specific trade publications
  // Industry/Niche (1.0x) - Specialized industry outlets
  // Blog/Influencer (0.8x) - Independent media and influencer channels
  // You can customize these in Settings
  publicationTiers: {
    'National Business (2.0x) - WSJ, NYT, Bloomberg': 2.0,
    'Tech/Auto Tier 1 (1.8x) - TechCrunch, Wired, Car & Driver': 1.8,
    'Regional/Trade (1.2x) - Local news, EV publications': 1.2,
    'Industry/Niche (1.0x) - Specialized outlets': 1.0,
    'Blog/Influencer (0.8x) - Independent media': 0.8
  }
};
