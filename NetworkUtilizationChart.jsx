import React from 'react';
import { Plus, ChevronRight } from 'lucide-react';

const CampaignResults = ({ campaigns, coverage, activeCampaign, onSelectCampaign, onAddCampaign, onAddCoverage, config }) => {
  if (campaigns.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 mb-4">No campaigns created yet. Start tracking campaign performance!</p>
        <button onClick={onAddCampaign} className="btn-primary">
          <Plus size={18} className="inline mr-2" />
          Create Campaign
        </button>
      </div>
    );
  }

  const currentCampaign = activeCampaign !== null ? campaigns[activeCampaign] : null;
  const campaignCoverage = currentCampaign 
    ? coverage.filter(c => c.campaignId === currentCampaign.id)
    : [];

  const avgImpact = campaignCoverage.length > 0
    ? Math.round(campaignCoverage.reduce((sum, c) => sum + (c.impactScore || 0), 0) / campaignCoverage.length)
    : 0;

  const totalReach = campaignCoverage.reduce((sum, c) => sum + (parseInt(c.reach) || 0), 0);

  return (
    <div>
      {/* Campaign Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {campaigns.map((campaign, index) => (
          <button
            key={campaign.id}
            onClick={() => onSelectCampaign(index)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
              activeCampaign === index
                ? 'bg-purple-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {campaign.name}
          </button>
        ))}
        <button
          onClick={onAddCampaign}
          className="px-4 py-2 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition whitespace-nowrap"
        >
          <Plus size={18} className="inline mr-1" />
          New Campaign
        </button>
      </div>

      {/* Campaign Details */}
      {currentCampaign ? (
        <div className="space-y-6">
          {/* Campaign Overview */}
          <div className="stat-card">
            <h3 className="text-2xl font-bold mb-4">{currentCampaign.name}</h3>
            <div className="grid grid-cols-3 gap-6 mb-4">
              <div>
                <div className="text-sm text-slate-600">Duration</div>
                <div className="font-semibold">
                  {new Date(currentCampaign.startDate).toLocaleDateString()} - {new Date(currentCampaign.endDate).toLocaleDateString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-600">Target Audience</div>
                <div className="font-semibold">{currentCampaign.targetAudience}</div>
              </div>
              <div>
                <div className="text-sm text-slate-600">Coverage</div>
                <div className="text-2xl font-bold text-blue-600">{campaignCoverage.length}</div>
              </div>
            </div>
            <div className="border-t pt-4">
              <div className="text-sm text-slate-600 mb-2">Campaign Goal</div>
              <div className="text-slate-800">{currentCampaign.goal}</div>
            </div>
            {currentCampaign.keyMessages && currentCampaign.keyMessages.length > 0 && (
              <div className="border-t pt-4 mt-4">
                <div className="text-sm text-slate-600 mb-2">Key Messages</div>
                <div className="flex flex-wrap gap-2">
                  {currentCampaign.keyMessages.map((msg, i) => (
                    <span key={i} className="badge bg-purple-50 text-purple-700">
                      {msg}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {currentCampaign.campaignSpecificMessage && (
              <div className="border-t pt-4 mt-4">
                <div className="text-sm text-slate-600 mb-2">Campaign-Specific Message</div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">⭐</span>
                  <span className="font-medium">{currentCampaign.campaignSpecificMessage}</span>
                </div>
              </div>
            )}
            {currentCampaign.llmQuery && (
              <div className="border-t pt-4 mt-4">
                <div className="text-sm text-slate-600 mb-2">LLM Query</div>
                <div className="font-medium">{currentCampaign.llmQuery}</div>
              </div>
            )}
          </div>

          {/* Campaign Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="stat-card text-center">
              <div className="text-3xl font-bold text-blue-600">{campaignCoverage.length}</div>
              <div className="text-sm text-slate-600 mt-1">Total Coverage</div>
            </div>
            <div className="stat-card text-center">
              <div className="text-3xl font-bold text-purple-600">{(totalReach / 1000000).toFixed(1)}M</div>
              <div className="text-sm text-slate-600 mt-1">Total Reach</div>
            </div>
            <div className="stat-card text-center">
              <div className="text-3xl font-bold text-amber-600">{avgImpact}</div>
              <div className="text-sm text-slate-600 mt-1">Avg Impact Score</div>
            </div>
          </div>

          {/* Campaign Coverage */}
          <div className="stat-card">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold">Campaign Coverage</h4>
              <button onClick={onAddCoverage} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.875rem' }}>
                <Plus size={16} className="inline mr-1" />
                Add Coverage
              </button>
            </div>

            {campaignCoverage.length > 0 ? (
              <div className="space-y-3">
                {campaignCoverage.map(item => (
                  <div key={item.id} className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        {item.url ? (
                          <a 
                            href={item.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-lg font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {item.title} ↗
                          </a>
                        ) : (
                          <h5 className="text-lg font-semibold">{item.title}</h5>
                        )}
                        <div className="text-sm text-slate-600 mt-1">
                          {item.publication} • {item.date}
                          {item.journalist && ` • ${item.journalist}`}
                        </div>
                      </div>
                      <div className={`score-badge ${
                        item.impactScore >= 80 ? 'score-high' : 
                        item.impactScore >= 60 ? 'score-medium' : 'score-low'
                      }`}>
                        Impact: {item.impactScore}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className={`score-badge sentiment-${item.sentiment?.toLowerCase()}`}>
                        {item.sentiment}
                      </span>
                      {item.targetAudience && (
                        <span className="badge bg-blue-50 text-blue-700">
                          {item.targetAudience}
                        </span>
                      )}
                      {item.reach && (
                        <span className="badge bg-purple-50 text-purple-700">
                          {parseInt(item.reach).toLocaleString()} reach
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                No coverage for this campaign yet
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-slate-500">
          Select a campaign to view details
        </div>
      )}
    </div>
  );
};

export default CampaignResults;
