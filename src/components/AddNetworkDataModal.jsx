import { useState } from 'react';

export default function AddNetworkDataModal({ onClose, onSave }) {
  const [weekStart, setWeekStart] = useState('');
  const [value, setValue] = useState('');
  const [note, setNote] = useState('');

  function getMonday(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    const day = d.getDay(); // 0=Sun
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    return d.toISOString().split('T')[0];
  }

  function handleSubmit() {
    if (!weekStart || !value) {
      alert('Please select a week and enter a utilization value.');
      return;
    }
    const monday = getMonday(weekStart);
    onSave({ id: `util-${monday}`, weekStart: monday, value: parseFloat(value), note });
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 420 }}>
        <div className="modal-header">
          <h2>Add Network Utilization</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">

          <div className="form-group">
            <label>Week (select any day — snaps to Monday)</label>
            <input
              type="date"
              value={weekStart}
              onChange={e => setWeekStart(e.target.value)}
            />
            {weekStart && (
              <p className="text-sm text-muted" style={{ marginTop: 4 }}>
                Week of: <strong>{new Date(getMonday(weekStart) + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</strong>
              </p>
            )}
          </div>

          <div className="form-group">
            <label>Utilization (kWh/port/day)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder="e.g. 96.5"
            />
          </div>

          <div className="form-group">
            <label>Note (optional)</label>
            <input
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="e.g. Post-CES media spike"
            />
          </div>

        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>Add Data</button>
        </div>
      </div>
    </div>
  );
}
