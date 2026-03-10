import React from 'react';
import { Plus } from 'lucide-react';

const NetworkUtilizationChart = ({ data, coverage, onAddData, campaigns, dateFilter, onFilterChange }) => {
  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 mb-4">No utilization data yet</p>
        <button onClick={onAddData} className="btn-primary">
          <Plus size={18} className="inline mr-2" />
          Add Weekly Data
        </button>
      </div>
    );
  }

  // Filter data based on selected time period
  const getFilteredData = () => {
    const now = new Date();
    const filtered = data.filter(week => {
      const weekDate = new Date(week.weekEnding);
      if (dateFilter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return weekDate >= weekAgo;
      } else if (dateFilter === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return weekDate >= monthAgo;
      } else if (dateFilter === 'quarter') {
        const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        return weekDate >= quarterAgo;
      } else if (dateFilter === 'year') {
        const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        return weekDate >= yearAgo;
      }
      return true; // 'all'
    });
    return filtered;
  };

  const filteredData = getFilteredData();
  const maxUtilization = Math.max(...filteredData.map(d => d.utilization), 105);

  return (
    <div>
      {/* Date Filter */}
      <div className="flex gap-2 mb-4">
        {['week', 'month', 'quarter', 'year', 'all'].map(filter => (
          <button
            key={filter}
            onClick={() => onFilterChange(filter)}
            className={`px-3 py-1 rounded text-sm font-medium transition ${
              dateFilter === filter
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
      </div>

      {/* Scrollable Chart Container */}
      <div className="overflow-x-auto pb-4">
        <div style={{ minWidth: `${filteredData.length * 60}px` }} className="relative">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between text-xs text-slate-600">
            <div>{maxUtilization}</div>
            <div>{Math.round(maxUtilization * 0.75)}</div>
            <div>{Math.round(maxUtilization * 0.5)}</div>
            <div>{Math.round(maxUtilization * 0.25)}</div>
            <div>0</div>
          </div>

          {/* Chart area */}
          <div className="ml-12 flex items-end gap-2 h-64">
            {filteredData.map((week, index) => {
              const height = (week.utilization / maxUtilization) * 100;
              const weekCoverage = coverage.filter(c => {
                const coverageDate = new Date(c.date);
                const weekEnd = new Date(week.weekEnding);
                const weekStart = new Date(weekEnd);
                weekStart.setDate(weekStart.getDate() - 7);
                return coverageDate >= weekStart && coverageDate <= weekEnd;
              });

              const weekCampaigns = campaigns.filter(camp => {
                const weekEnd = new Date(week.weekEnding);
                const weekStart = new Date(weekEnd);
                weekStart.setDate(weekStart.getDate() - 7);
                const campStart = new Date(camp.startDate);
                const campEnd = new Date(camp.endDate);
                return (campStart <= weekEnd && campEnd >= weekStart);
              });

              const hasCampaign = weekCampaigns.length > 0;
              const hasCoverage = weekCoverage.length > 0;

              return (
                <div key={index} className="flex-1 min-w-[50px] flex flex-col items-center gap-2 relative">
                  {/* Campaign/Coverage indicators */}
                  {hasCampaign && (
                    <div className="absolute -top-8 w-full text-center">
                      <div 
                        className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded font-semibold" 
                        title={weekCampaigns.map(c => c.name).join(', ')}
                      >
                        C
                      </div>
                    </div>
                  )}
                  {hasCoverage && (
                    <div className="absolute -top-4 w-full flex justify-center">
                      <div 
                        className="w-2 h-2 bg-blue-500 rounded-full" 
                        title={`${weekCoverage.length} articles`}
                      ></div>
                    </div>
                  )}

                  {/* Bar */}
                  <div className="flex-1 w-full flex flex-col justify-end relative">
                    <div
                      className={`w-full rounded-t transition-all ${
                        week.utilization >= 105 ? 'bg-green-500' : 
                        hasCampaign ? 'bg-purple-400 shadow-lg' : 'bg-blue-500'
                      }`}
                      style={{ height: `${height}%` }}
                      title={`${week.utilization} kWh/port/day${hasCoverage ? ` - ${weekCoverage.length} coverage` : ''}${hasCampaign ? ` - ${weekCampaigns.map(c => c.name).join(', ')}` : ''}`}
                    >
                      {hasCampaign && (
                        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
                      )}
                    </div>
                  </div>

                  {/* X-axis labels */}
                  <div className="text-xs text-slate-600 text-center">
                    <div>{new Date(week.weekEnding).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                    <div className="font-semibold">{week.utilization}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm mt-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span>Weekly Utilization</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span>Coverage Published</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-400 rounded"></div>
          <span>Campaign Active</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span>Target Met (105+)</span>
        </div>
      </div>
    </div>
  );
};

export default NetworkUtilizationChart;
