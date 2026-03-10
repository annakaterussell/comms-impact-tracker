import React from 'react';
import { Zap } from 'lucide-react';

const TopLevelScores = ({ coverage, config }) => {
  const totalCoverage = coverage.length;
  const avgImpact = coverage.length > 0 
    ? Math.round(coverage.reduce((sum, c) => sum + (c.impactScore || 0), 0) / coverage.length)
    : 0;
  const totalReach = coverage.reduce((sum, c) => sum + (parseInt(c.reach) || 0), 0);
  
  // Key Message - Find the highest performing message
  const messageCounts = {};
  config.keyMessages.forEach(msg => {
    messageCounts[msg.text] = coverage.filter(c => c.keyMessages?.includes(msg.text)).length;
  });
  const topMessage = Object.entries(messageCounts).sort((a, b) => b[1] - a[1])[0];
  const topMessageText = topMessage ? topMessage[0].substring(0, 30) + '...' : 'None';
  const topMessageCount = topMessage ? topMessage[1] : 0;
  const topMessagePercentage = totalCoverage > 0 ? Math.round((topMessageCount / totalCoverage) * 100) : 0;
    
  // Target Audience - Weighted for consumer preference
  const consumerArticles = coverage.filter(c => c.targetAudience === 'Consumer').length;
  const businessArticles = coverage.filter(c => c.targetAudience === 'Business/Trade').length;
  const totalTargeted = consumerArticles + businessArticles;
  const targetAudienceScore = totalTargeted > 0 
    ? Math.round(((consumerArticles * 2 + businessArticles) / (totalTargeted * 2)) * 100)
    : 0;

  // Executive Visibility - Ratio of exec involvement
  const execTotal = coverage.filter(c => c.executiveVisibility?.length > 0).length;
  const execVisibilityScore = totalCoverage > 0 ? Math.round((execTotal / totalCoverage) * 100) : 0;

  const scores = [
    { label: 'Total Coverage', value: totalCoverage, color: 'blue', unit: '', description: 'Total articles published' },
    { label: 'Total Reach', value: `${(totalReach / 1000000).toFixed(1)}M`, color: 'purple', unit: '', description: 'Combined estimated impressions' },
    { label: 'Top Key Message', value: topMessagePercentage, color: 'amber', unit: '%', description: `${topMessageText} (${topMessageCount} mentions)` },
    { label: 'Target Audience', value: targetAudienceScore, color: 'indigo', unit: '%', description: 'Consumer-weighted alignment' },
    { label: 'Executive Visibility', value: execVisibilityScore, color: 'pink', unit: '%', description: `${execTotal} of ${totalCoverage} with exec` }
  ];

  return (
    <div>
      <div className="grid grid-cols-5 gap-4 mb-6">
        {scores.map((score, index) => (
          <div key={index} className="text-center">
            <div className={`metric-circle mx-auto mb-2 border-${score.color}-500 bg-${score.color}-50`}>
              <div className={`text-3xl font-bold text-${score.color}-600`}>
                {score.value}{score.unit}
              </div>
            </div>
            <div className="text-sm font-medium text-slate-700">{score.label}</div>
            <div className="text-xs text-slate-500 mt-1">{score.description}</div>
          </div>
        ))}
      </div>

      {/* Business Impact Definition */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Zap className="text-blue-600 mt-1 flex-shrink-0" size={24} />
          <div>
            <h4 className="font-semibold text-lg mb-3">Business Impact Score: {avgImpact}/100</h4>
            <div className="text-sm text-slate-700 space-y-2">
              <p className="font-semibold">How we calculate it:</p>
              <p><strong>Base Score (0-100):</strong> Reach (25 pts), Message Inclusion (25 pts), Audience Alignment (20 pts, 2x for Consumer), Sentiment (15 pts), LLM Visibility (15 pts).</p>
              <p><strong>Multipliers:</strong> Publication Tier (0.8x-2.0x) × Placement Type (Proactive = 1.2x) × Executive Visibility (Interview = 1.5x, Speaking = 1.4x, Quote = 1.2x).</p>
              <p><strong>Result:</strong> The average impact score across all coverage shows overall PR effectiveness.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopLevelScores;
