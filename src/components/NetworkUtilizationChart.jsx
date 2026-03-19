import { useMemo } from 'react';
import { BUSINESS_OBJECTIVE } from '../config/defaultConfig.js';

function formatWeekLabel(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// dateRange = { from: 'YYYY-MM-DD', to: 'YYYY-MM-DD' } | null
// When provided, only shows utilization weeks that fall within the range.
export default function NetworkUtilizationChart({ utilization, coverage, campaigns, onAddData, onEditData, businessTarget, dateRange }) {
  const target = businessTarget ?? BUSINESS_OBJECTIVE.target;

  const filteredData = useMemo(() => {
    let data = [...utilization].sort((a, b) => a.weekStart.localeCompare(b.weekStart));

    if (dateRange) {
      data = data.filter(d => {
        if (dateRange.from && d.weekStart < dateRange.from) return false;
        if (dateRange.to && d.weekStart > dateRange.to) return false;
        return true;
      });
    }

    return data;
  }, [utilization, dateRange]);

  const maxVal = Math.max(...filteredData.map(d => d.value), target, 10);
  const chartMax = maxVal * 1.15;
  const chartH = 160;

  const avgUtil = filteredData.length > 0
    ? (filteredData.reduce((s, d) => s + d.value, 0) / filteredData.length).toFixed(1)
    : null;

  const latestVal = filteredData[filteredData.length - 1]?.value;
  const gapVal = latestVal != null ? latestVal - target : null;
  const gapPct = gapVal != null ? ((gapVal / target) * 100).toFixed(1) : null;

  function getEventsForWeek(weekStart) {
    const weekStartDate = new Date(weekStart + 'T00:00:00');
    const weekEnd = new Date(weekStart + 'T00:00:00');
    weekEnd.setDate(weekEnd.getDate() + 6);

    const covCount = coverage.filter(c => {
      if (!c.publicationDate) return false;
      const d = new Date(c.publicationDate + 'T00:00:00');
      return d >= weekStartDate && d <= weekEnd;
    }).length;

    const activeCamps = campaigns.filter(c => {
      if (!c.startDate || !c.endDate) return false;
      const start = new Date(c.startDate + 'T00:00:00');
      const end = new Date(c.endDate + 'T00:00:00');
      return weekStartDate <= end && weekEnd >= start;
    });

    return { covCount, campCount: activeCamps.length };
  }

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div className="card-header">
        <div>
          <h2>Business Objective — Network Utilization</h2>
          <p className="text-sm text-muted" style={{ marginTop: 2 }}>Target: {target} kWh/port/day by {BUSINESS_OBJECTIVE.year}</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={onAddData}>+ Add Weekly Data</button>
      </div>
      <div className="card-body">

        {/* Legend */}
        <div className="flex gap-4" style={{ marginBottom: 12, flexWrap: 'wrap' }}>
          <div className="flex items-center gap-2"><div style={{ width: 12, height: 12, borderRadius: 2, background: '#1a1a1a' }}></div><span className="text-sm text-muted">Utilization</span></div>
          <div className="flex items-center gap-2"><div style={{ width: 12, height: 12, borderRadius: 2, background: '#3b82f6' }}></div><span className="text-sm text-muted">Coverage activity</span></div>
          <div className="flex items-center gap-2"><div style={{ width: 12, height: 12, borderRadius: 2, background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.4)' }}></div><span className="text-sm text-muted">Active campaign</span></div>
          <div className="flex items-center gap-2"><div style={{ width: 20, borderTop: '2px dashed #ef4444' }}></div><span className="text-sm text-muted">Target ({target})</span></div>
        </div>

        {filteredData.length === 0 ? (
          <div className="empty-state" style={{ padding: 32 }}>
            <div className="icon">📊</div>
            <p>{utilization.length === 0
              ? 'No utilization data yet. Add weekly data to see the chart.'
              : 'No utilization data for the selected date range.'}
            </p>
          </div>
        ) : (
          <div className="chart-scroll-wrap">
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 0, minWidth: filteredData.length * 58 + 48, position: 'relative' }}>

              {/* Y-axis */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: chartH + 24, paddingBottom: 24, width: 44, flexShrink: 0 }}>
                {[chartMax, Math.round(chartMax * 0.75), Math.round(chartMax * 0.5), Math.round(chartMax * 0.25), 0].map(v => (
                  <span key={v} style={{ fontSize: 10, color: '#888', textAlign: 'right', paddingRight: 6 }}>{Math.round(v)}</span>
                ))}
              </div>

              {/* Chart area */}
              <div style={{ flex: 1, position: 'relative' }}>
                {/* Target dashed line */}
                <div style={{
                  position: 'absolute',
                  left: 0, right: 0,
                  bottom: 24 + (target / chartMax) * chartH,
                  borderTop: '2px dashed #ef4444',
                  zIndex: 2,
                  pointerEvents: 'none',
                }} />

                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: chartH + 24, paddingBottom: 24, paddingTop: 0 }}>
                  {filteredData.map(d => {
                    const barH = Math.max(4, (d.value / chartMax) * chartH);
                    const { covCount, campCount } = getEventsForWeek(d.weekStart);
                    const isAboveTarget = d.value >= target;

                    return (
                      <div
                        key={d.weekStart}
                        style={{
                          display: 'flex', flexDirection: 'column', alignItems: 'center',
                          width: 48, flexShrink: 0,
                          background: campCount > 0 ? 'rgba(139,92,246,0.1)' : 'transparent',
                          borderRadius: 4,
                          paddingTop: 4,
                          position: 'relative',
                        }}
                      >
                        {/* Coverage dot indicator */}
                        <div style={{ height: 14, display: 'flex', gap: 2, alignItems: 'center', marginBottom: 2 }}>
                          {covCount > 0 && (
                            <div
                              title={`${covCount} coverage item(s) this week`}
                              style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6' }}
                            />
                          )}
                        </div>

                        {/* Value label */}
                        <span style={{ fontSize: 10, fontWeight: 600, color: isAboveTarget ? '#22c55e' : '#555', marginBottom: 2 }}>{d.value}</span>

                        {/* Bar */}
                        <div
                          title={`Week of ${formatWeekLabel(d.weekStart)}: ${d.value} kWh/port/day${d.note ? ` — ${d.note}` : ''}`}
                          style={{
                            width: 36,
                            height: barH,
                            background: isAboveTarget ? '#22c55e' : '#1a1a1a',
                            borderRadius: '4px 4px 0 0',
                            cursor: 'default',
                            position: 'relative',
                            zIndex: 1,
                          }}
                        />

                        {/* X label */}
                        <span style={{ fontSize: 10, color: '#888', marginTop: 4, whiteSpace: 'nowrap', textAlign: 'center' }}>
                          {formatWeekLabel(d.weekStart)}
                        </span>

                        {/* Edit button */}
                        {onEditData && (
                          <button
                            onClick={() => onEditData(d)}
                            title="Edit this data point"
                            style={{
                              fontSize: 9, color: '#aaa', background: 'none', border: 'none',
                              cursor: 'pointer', padding: '2px 0', lineHeight: 1,
                            }}
                          >✏️</button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {filteredData.length > 0 && (
          <div style={{ marginTop: 12, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <div>
              <span className="text-sm text-muted">Latest: </span>
              <strong>{latestVal} kWh/port/day</strong>
            </div>
            {avgUtil && (
              <div>
                <span className="text-sm text-muted">Avg (shown range): </span>
                <strong>{avgUtil} kWh/port/day</strong>
              </div>
            )}
            <div>
              <span className="text-sm text-muted">Target: </span>
              <strong>{target} kWh/port/day</strong>
            </div>
            <div>
              <span className="text-sm text-muted">Gap: </span>
              <strong style={{ color: latestVal >= target ? '#22c55e' : '#ef4444' }}>
                {gapVal >= 0 ? '+' : ''}{gapVal?.toFixed(1)} ({gapPct >= 0 ? '+' : ''}{gapPct}%)
              </strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
