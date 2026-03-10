import { useState } from 'react';
import { BUSINESS_OBJECTIVE } from '../config/defaultConfig.js';

export default function SettingsModal({ onClose, onSave, publicationTiers, businessTarget }) {
  const [tiers, setTiers] = useState(publicationTiers.map(t => ({ ...t })));
  const [newTier, setNewTier] = useState({ name: '', description: '', multiplier: '' });
  const [targetVal, setTargetVal] = useState(String(businessTarget ?? BUSINESS_OBJECTIVE.target));

  function updateTier(id, field, value) {
    setTiers(ts => ts.map(t => t.id === id ? { ...t, [field]: value } : t));
  }

  function removeTier(id) {
    setTiers(ts => ts.filter(t => t.id !== id));
  }

  function addTier() {
    if (!newTier.name || !newTier.multiplier) return;
    setTiers(ts => [...ts, { id: `tier-${Date.now()}`, ...newTier, multiplier: parseFloat(newTier.multiplier) }]);
    setNewTier({ name: '', description: '', multiplier: '' });
  }

  function handleSave() {
    const t = parseFloat(targetVal);
    onSave(tiers, isNaN(t) ? BUSINESS_OBJECTIVE.target : t);
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 680 }}>
        <div className="modal-header">
          <h2>Settings</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body" style={{ maxHeight: '65vh', overflowY: 'auto' }}>

          {/* Business Objective Target */}
          <div style={{ marginBottom: 28, padding: '16px 20px', background: '#f8f8f8', borderRadius: 10, border: '1px solid #e0e0e0' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Business Objective Target</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#333' }}>Network Utilization Target (kWh/port/day):</label>
              <input
                type="number"
                step="1"
                min="1"
                value={targetVal}
                onChange={e => setTargetVal(e.target.value)}
                style={{ width: 90, padding: '7px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 14, fontWeight: 600 }}
              />
            </div>
            <p className="text-sm text-muted" style={{ marginTop: 6 }}>
              This sets the target line on the Network Utilization chart. Default: {BUSINESS_OBJECTIVE.target}.
            </p>
          </div>

          <p style={{ fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Publication Tiers</p>
          <p className="text-sm text-muted" style={{ marginBottom: 16 }}>
            Publication tiers are used as multipliers in the impact score calculation.
            Higher multiplier = more weight given to that placement.
          </p>

          <table style={{ width: '100%', fontSize: 13 }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px 0', borderBottom: '1px solid #e0e0e0', color: '#888', fontSize: 11 }}>Tier Name</th>
                <th style={{ textAlign: 'left', padding: '8px 0', borderBottom: '1px solid #e0e0e0', color: '#888', fontSize: 11 }}>Examples</th>
                <th style={{ textAlign: 'left', padding: '8px 0', borderBottom: '1px solid #e0e0e0', color: '#888', fontSize: 11 }}>Multiplier</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {tiers.map(t => (
                <tr key={t.id}>
                  <td style={{ padding: '8px 8px 8px 0' }}>
                    <input
                      value={t.name}
                      onChange={e => updateTier(t.id, 'name', e.target.value)}
                      style={{ width: '100%', padding: '6px 8px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13 }}
                    />
                  </td>
                  <td style={{ padding: '8px 8px' }}>
                    <input
                      value={t.description}
                      onChange={e => updateTier(t.id, 'description', e.target.value)}
                      style={{ width: '100%', padding: '6px 8px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13 }}
                    />
                  </td>
                  <td style={{ padding: '8px 8px', width: 90 }}>
                    <input
                      type="number" step="0.1" min="0.1" max="5"
                      value={t.multiplier}
                      onChange={e => updateTier(t.id, 'multiplier', parseFloat(e.target.value))}
                      style={{ width: '100%', padding: '6px 8px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13 }}
                    />
                  </td>
                  <td style={{ padding: '8px 0', width: 40, textAlign: 'right' }}>
                    <button onClick={() => removeTier(t.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 16 }}>×</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: 20, padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#888', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Add New Tier</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px auto', gap: 8, alignItems: 'center' }}>
              <input placeholder="Tier name" value={newTier.name} onChange={e => setNewTier(n => ({ ...n, name: e.target.value }))} style={{ padding: '7px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13 }} />
              <input placeholder="Examples" value={newTier.description} onChange={e => setNewTier(n => ({ ...n, description: e.target.value }))} style={{ padding: '7px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13 }} />
              <input type="number" step="0.1" placeholder="1.0" value={newTier.multiplier} onChange={e => setNewTier(n => ({ ...n, multiplier: e.target.value }))} style={{ padding: '7px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13 }} />
              <button className="btn btn-primary btn-sm" onClick={addTier}>Add</button>
            </div>
          </div>

        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>Save Settings</button>
        </div>
      </div>
    </div>
  );
}
