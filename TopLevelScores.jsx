import React from 'react';
import { Plus } from 'lucide-react';
import { calculateStats } from '../utils/calculations';

const PROverview = ({ coverage, config, onAddCoverage }) => {
  const stats = calculateStats(coverage, config);
  const totalCoverage = coverage.length;

  if (totalCoverage === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 mb-4">No coverage data yet. Start tracking your PR impact!</p>
        <button onClick={onAddCoverage} className="btn-primary">
          <Plus size={18} className="inline mr-2" />
          Add Coverage
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Total Coverage Count */}
      <div className="stat-card text-center">
        <div className="text-5xl font-bold text-blue-600 mb-2">{totalCoverage}</div>
        <div className="text-sm text-slate-600 mt-2">Articles published</div>
      </div>

      {/* Key Message Pull-Through */}
      <div className="stat-card">
        <h4 className="text-lg font-semibold mb-4">Key Message Pull-Through</h4>
        <div className="space-y-3">
          {stats.messageStats.map((stat, index) => (
            <div key={index}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">{stat.message}</span>
                <span className="text-sm font-bold text-blue-600">{stat.count} mentions ({stat.percentage}%)</span>
              </div>
              <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                  style={{ width: `${stat.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Target Audience */}
        <div className="stat-card">
          <h4 className="text-lg font-semibold mb-4">Target Audience Reach</h4>
          <div className="space-y-3">
            {stats.audienceStats.map((stat, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="font-medium">{stat.audience}</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-blue-600">{stat.count}</span>
                  <span className="text-sm text-slate-600">({stat.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sentiment */}
        <div className="stat-card">
          <h4 className="text-lg font-semibold mb-4">Sentiment Distribution</h4>
          <div className="flex items-center gap-6">
            {/* Simple Pie Chart */}
            <div className="relative w-40 h-40 flex items-center justify-center">
              {totalCoverage === 0 ? (
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                  No Data
                </div>
              ) : (
                <div className="relative w-32 h-32">
                  {/* Using conic gradient for simple pie chart */}
                  <div 
                    className="w-full h-full rounded-full"
                    style={{
                      background: `conic-gradient(
                        #22c55e 0deg ${(stats.sentimentStats.positive / totalCoverage) * 360}deg,
                        #6b7280 ${(stats.sentimentStats.positive / totalCoverage) * 360}deg ${((stats.sentimentStats.positive + stats.sentimentStats.neutral) / totalCoverage) * 360}deg,
                        #ef4444 ${((stats.sentimentStats.positive + stats.sentimentStats.neutral) / totalCoverage) * 360}deg 360deg
                      )`
                    }}
                  ></div>
                </div>
              )}
            </div>
            {/* Legend */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-sm font-medium">Positive</span>
                </div>
                <span className="font-semibold text-green-600">{stats.sentimentStats.positive}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-500 rounded"></div>
                  <span className="text-sm font-medium">Neutral</span>
                </div>
                <span className="font-semibold text-gray-600">{stats.sentimentStats.neutral}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-sm font-medium">Negative</span>
                </div>
                <span className="font-semibold text-red-600">{stats.sentimentStats.negative}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Executive Visibility */}
        <div className="stat-card">
          <h4 className="text-lg font-semibold mb-4">Executive Visibility</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium">Interviews Landed</span>
              <span className="text-2xl font-bold text-purple-600">{stats.execStats.interviews}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Speaking Engagements</span>
              <span className="text-2xl font-bold text-indigo-600">{stats.execStats.speaking}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Quotes Earned</span>
              <span className="text-2xl font-bold text-blue-600">{stats.execStats.quotes}</span>
            </div>
            <div className="border-t pt-3 mt-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Exec Visibility Ratio</span>
                <span className="text-3xl font-bold text-pink-600">{stats.execStats.ratio}%</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{stats.execStats.total} of {totalCoverage} articles with exec involvement</p>
            </div>
          </div>
        </div>

        {/* LLM Visibility */}
        <div className="stat-card">
          <h4 className="text-lg font-semibold mb-4">LLM Visibility</h4>
          <div className="space-y-3">
            {stats.llmStats.map((stat, index) => (
              <div key={index}>
                <div className="flex justify-between mb-1">
                  <span className="font-medium">{stat.model}</span>
                  <span className="text-sm font-bold text-purple-600">{stat.count} ({stat.percentage}%)</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 transition-all"
                    style={{ width: `${stat.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Publications */}
      <div className="stat-card">
        <h4 className="text-lg font-semibold mb-4">Top Publications</h4>
        <div className="grid grid-cols-2 gap-4">
          {stats.topPublications.map((pub, index) => (
            <div key={index} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="font-medium">{pub.publication}</span>
              <span className="text-xl font-bold text-blue-600">{pub.count}</span>
            </div>
          ))}
          {stats.topPublications.length === 0 && (
            <div className="col-span-2 text-center text-slate-500 py-4">No publications yet</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PROverview;
