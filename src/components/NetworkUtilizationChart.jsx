import { useState, useMemo } from 'react';
import { BUSINESS_OBJECTIVE } from '../config/defaultConfig.js';

const FILTERS = ['Week', 'Month', 'Quarter', 'Year', 'All'];

function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d;
}

function formatWeekLabel(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function NetworkUtilizationChart({ utilization, coverage, campaigns, onAddData }) {
  const [filter, setFilter] = useState('All');
  const [filterDate, setFilterDate] = useState('');
  const target = BUSINESS_OBJECTIVE.target;

  // Filtered + sorted utilization
  const filteredData = useMemo(() => {
    let data = [...utilization].sort((a, b) => a.weekStart.localeCompare(b.weekStart));

    if (!filterDate) return data;

    const ref = new Date(filterDate + 'T00:00:00');

    if (filter === 'Week') {
      const monday = getMonday(ref);
      const weekStr = monday.toISOString().split('T')[0];
      data = data.filter(d => d.weekStart === weekStr);
    } else if (filter === 'Month') {
      const y = ref.getFullYear(), m = ref.getMonth();
      data = data.filter(d => {
        const dd = new Date(d.weekStart + 'T00:00:00');
        return dd.getFullYear() === y && dd.getMonth() === m;
      });
    } else if (filter === 'Quarter') {
      const q = Math.floor(ref.getMonth() / 3);
      const y = ref.getFullYear();
      data = data.filter(d => {
        const dd = new Date(d.weekStart + 'T00:00:00');
        return dd.getFullYear() === y && Math.floor(dd.getMonth() / 3) === q;
      });
    } else if (filter === 'Year') {
      const y = ref.getFullYear();
      data = data.filter(d => new Date(d.weekStart + 'T00:00:00').getFullYear() === y);
    }

    return data;
  }, [utilization, filter, filterDate]);

  const maxVal = Math.max(...filteredData.map(d => d.value), target, 10);
  const chartH = 160;

  // Find coverage/campaign events per week
  function getEventsForWeek(weekStart) {
    const weekEnd = new Date(weekStart + 'T00:00:00');
    weekEnd.setDate(weekEnd.getDate() + 6);

    const covCount = coverage.filter(c => {
      if (!c.publicationDate) return false;
      const d = new Date(c.publicationDate + 'T00:00:00');
      return d >= new Date(weekStart + 'T00:00:00') && d <= weekEnd;
    }).length;

    const campCount = campaigns.filter(c => {
      if (!c.startDate || !c.endDate) return false;
      const start = new Date(c.startDate + 'T00:00:00');
      const end = new Date(c.endDate + 'T00:00:00');
      const week = new Date(weekStart + 'T00:00:00');
      return week >= start && week <= end;
    }).length;

    return { covCount, campCount };
  }

  function getDateInputLabel() {
    if (filter === 'Week') return 'Select any day in the week';
    if (filter === 'Month') return 'Select month';
    if (filter === 'Quarter') return 'Select any day in the quarter';
    if (filter === 'Year') return 'Select year';
    return '';
  }

  const showDatePicker = filter !== 'All';
  const dateInputType = filter === 'Month' ? 'month' : filter === 'Year' ? 'number' : 'date';

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

        {/* Filters */}
        <div className="toolbar" style={{ marginBottom: 16 }}>
          <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
            {FILTERS.map(f => (
              <button
                key={f}
                className={`filter-btn${filter === f ? ' active' : ''}`}
                onClick={() => { setFilter(f); if (f === 'All') setFilterDate(''); }}
              >{f}</button>
            ))}
          </div>
          {showDatePicker && (
            <div className="flex items-center gap-2">
              <label style={{ fontSize: 12, color: '#888' }}>{getDateInputLabel()}:</label>
              {filter === 'Year' ? (
                <input
                  type="number" min="2023" max="2030"
                  value={filterDate}
                  onChange={e => setFilterDate(e.target.value)}
                  style={{ padding: '6px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13, width: 90 }}
                  placeholder="2026"
                />
              ) : filter === 'Month' ? (
                <input
                  type="month"
                  value={filterDate}
                  onChange={e => setFilterDate(e.target.value + '-01')}
                  style={{ padding: '6px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13 }}
                />
              ) : (
                <input
                  type="date"
                  value={filterDate}
                  onChange={e => setFilterDate(e.target.value)}
                  style={{ padding: '6px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13 }}
                />
              )}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex gap-4" style={{ marginBottom: 12, flexWrap: 'wrap' }}>
          <div className="flex items-center gap-2"><div style={{ width: 12, height: 12, borderRadius: 2, background: '#1a1a1a' }}></div><span className="text-sm text-muted">Utilization</span></div>
          <div className="flex items-center gap-2"><div style={{ width: 12, height: 12, borderRadius: 2, background: '#3b82f6', opacity: 0.6 }}></div><span className="text-sm text-muted">Coverage activity</span></div>
          <div className="flex items-center gap-2"><div style={{ width: 12, height: 12, borderRadius: 2, background: '#8b5cf6', opacity: 0.6 }}></div><span className="text-sm text-muted">Active campaign</span></div>
          <div className="flex items-center gap-2"><div style={{ width: 20, borderTop: '2px dashed #ef4444' }}></div><span className="text-sm text-muted">Target ({target})</span></div>
        </div>

        {filteredData.length === 0 ? (
          <div className="empty-state" style={{ padding: 32 }}>
            <div className="icon">📊</div>
            <p>No utilization data yet. Add weekly data to see the chart.</p>
          </div>
        ) : (
          <div className="chart-scroll-wrap">
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 0, minWidth: filteredData.length * 58 + 48, position: 'relative' }}>

              {/* Y-axis */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: chartH + 24, paddingBottom: 24, width: 44, flexShrink: 0 }}>
                {[maxVal, Math.round(maxVal * 0.75), Math.round(maxVal * 0.5), Math.round(maxVal * 0.25), 0].map(v => (
                  <span key={v} style={{ fontSize: 10, color: '#888', textAlign: 'right', paddingRight: 6 }}>{v}</span>
                ))}
              </div>

              {/* Chart area */}
              <div style={{ flex: 1, position: 'relative' }}>
                {/* Target dashed line */}
                <div style={{
                  position: 'absolute',
                  left: 0, right: 0,
                  bottom: 24 + (target / maxVal) * chartH,
                  borderTop: '2px dashed #ef4444',
                  zIndex: 2,
                  pointerEvents: 'none',
                }} />

                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: chartH + 24, paddingBottom: 24, paddingTop: 0 }}>
                  {filteredData.map(d => {
                    const barH = Math.max(4, (d.value / maxVal) * chartH);
                    const { covCount, campCount } = getEventsForWeek(d.weekStart);
                    const isAboveTarget = d.value >= target;

                    return (
                      <div key={d.weekStart} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 48, flexShrink: 0 }}>
                        {/* Event indicators */}
                        <div style={{ height: 16, display: 'flex', gap: 2, alignItems: 'center', marginBottom: 2 }}>
                          {campCount > 0 && (
                            <div title={`${campCount} active campaign(s)`} style={{ width: 8, height: 8, borderRadius: '50%', background: '#8b5cf6' }} />
                          )}
                          {covCount > 0 && (
                            <div title={`${covCount} coverage item(s)`} style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6' }} />
                          )}
                        </div>

                        {/* Value */}
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
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {filteredData.length > 0 && (
          <div style={{ marginTop: 12, display: 'flex', gap: 24 }}>
            <div>
              <span className="text-sm text-muted">Latest: </span>
              <strong>{filteredData[filteredData.length - 1]?.value} kWh/port/day</strong>
            </div>
            <div>
              <span className="text-sm text-muted">Target: </span>
              <strong>{target} kWh/port/day</strong>
            </div>
            <div>
              <span className="text-sm text-muted">Gap: </span>
              <strong style={{ color: filteredData[filteredData.length - 1]?.value >= target ? '#22c55e' : '#ef4444' }}>
                {(filteredData[filteredData.length - 1]?.value - target).toFixed(1)}
              </strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
