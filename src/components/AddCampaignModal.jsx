import { useState, useEffect } from 'react';
import { KEY_MESSAGES, TARGET_AUDIENCES } from '../config/defaultConfig.js';

const EMPTY = {
  name: '', startDate: '', endDate: '',
  goals: ['', ''],
  targetAudience: [], keyMessages: [], campaignKeyMessage: '',
  llmQueries: ['', ''],
  targets: ['', ''],
  notes: '',
};

function arrField(val, fallbackSingle, defaultArr) {
  if (Array.isArray(val)) return val.length >= 2 ? val : [...val, ...defaultArr].slice(0, Math.max(val.length, 2));
  if (fallbackSingle) return [fallbackSingle, ''];
  return defaultArr;
}

export default function AddCampaignModal({ onClose, onSave, editItem }) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (editItem) {
      setForm({
        ...EMPTY,
        ...editItem,
        goals: arrField(editItem.goals, editItem.goal, ['', '']),
        llmQueries: arrField(editItem.llmQueries, editItem.llmQuery, ['', '']),
        targets: arrField(editItem.targets, null, ['', '']),
      });
    } else {
      setForm(EMPTY);
    }
  }, [editItem]);

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }

  function toggleArray(field, value) {
    setForm(f => {
      const arr = f[field] || [];
      return { ...f, [field]: arr.includes(value) ? arr.filter(x => x !== value) : [...arr, value] };
    });
  }

  function updateListItem(field, index, value) {
    setForm(f => {
      const arr = [...(f[field] || [])];
      arr[index] = value;
      return { ...f, [field]: arr };
    });
  }

  function addListItem(field) {
    setForm(f => ({ ...f, [field]: [...(f[field] || []), ''] }));
  }

  function removeListItem(field, index) {
    setForm(f => ({ ...f, [field]: (f[field] || []).filter((_, i) => i !== index) }));
  }

  function handleSubmit() {
    if (!form.name.trim()) {
      alert('Campaign Name is required.');
      return;
    }
    onSave({ ...form, id: editItem?.id || `camp-${Date.now()}` });
    onClose();
  }

  const removeBtn = {
    background: 'none', border: '1px solid #e0e0e0', borderRadius: 6,
    padding: '0 10px', cursor: 'pointer', color: '#888', fontSize: 18, lineHeight: '36px',
    flexShrink: 0,
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>{editItem ? 'Edit Campaign' : 'Create New Campaign'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>

          <div className="form-group">
            <label>Campaign Name <span className="req">*</span></label>
            <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Q1 Reliability Push" />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start Date</label>
              <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} />
            </div>
          </div>

          {/* Campaign Goals */}
          <div className="form-group">
            <label>Campaign Goals</label>
            {(form.goals || []).map((g, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <textarea
                  value={g}
                  onChange={e => updateListItem('goals', i, e.target.value)}
                  placeholder={`Goal ${i + 1}…`}
                  rows={2}
                  style={{ flex: 1, padding: '9px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontFamily: 'inherit', fontSize: 14, resize: 'vertical' }}
                />
                {(form.goals || []).length > 1 && (
                  <button type="button" style={removeBtn} onClick={() => removeListItem('goals', i)}>×</button>
                )}
              </div>
            ))}
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => addListItem('goals')}>+ Add Goal</button>
          </div>

          <div className="form-group">
            <label>Target Audience</label>
            <div className="checkbox-group">
              {TARGET_AUDIENCES.map(a => (
                <label key={a} className="checkbox-item">
                  <input type="checkbox" checked={(form.targetAudience || []).includes(a)} onChange={() => toggleArray('targetAudience', a)} />
                  {a}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Key Messages</label>
            <div className="checkbox-group" style={{ flexDirection: 'column', gap: 8 }}>
              {KEY_MESSAGES.map(m => (
                <label key={m} className="checkbox-item">
                  <input type="checkbox" checked={(form.keyMessages || []).includes(m)} onChange={() => toggleArray('keyMessages', m)} />
                  {m}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Campaign-Specific Key Message <span style={{ color: '#f59e0b', fontWeight: 700 }}>★</span></label>
            <input
              value={form.campaignKeyMessage}
              onChange={e => set('campaignKeyMessage', e.target.value)}
              placeholder="Optional: a message unique to this campaign…"
            />
            <p className="text-sm text-muted" style={{ marginTop: 4 }}>★ = campaign-specific message (shown alongside core messages in coverage view)</p>
          </div>

          {/* LLM Queries */}
          <div className="form-group">
            <label>LLM Queries to Track</label>
            <p className="text-sm text-muted" style={{ marginBottom: 8 }}>These queries will appear in the PR Overview LLM tracker.</p>
            {(form.llmQueries || []).map((q, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input
                  value={q}
                  onChange={e => updateListItem('llmQueries', i, e.target.value)}
                  placeholder={`e.g. "Is the Mercedes charging network reliable?"`}
                  style={{ flex: 1 }}
                />
                {(form.llmQueries || []).length > 1 && (
                  <button type="button" style={removeBtn} onClick={() => removeListItem('llmQueries', i)}>×</button>
                )}
              </div>
            ))}
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => addListItem('llmQueries')}>+ Add Query</button>
          </div>

          {/* Target Publication / Journalist */}
          <div className="form-group">
            <label>Target Publication / Journalist</label>
            <p className="text-sm text-muted" style={{ marginBottom: 8 }}>Publications or journalists you are targeting with this campaign.</p>
            {(form.targets || []).map((t, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input
                  value={t}
                  onChange={e => updateListItem('targets', i, e.target.value)}
                  placeholder={`e.g. Electrek / Fred Lambert`}
                  style={{ flex: 1 }}
                />
                {(form.targets || []).length > 1 && (
                  <button type="button" style={removeBtn} onClick={() => removeListItem('targets', i)}>×</button>
                )}
              </div>
            ))}
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => addListItem('targets')}>+ Add Target</button>
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Additional context…" rows={2} />
          </div>

        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            {editItem ? 'Update Campaign' : 'Create Campaign'}
          </button>
        </div>
      </div>
    </div>
  );
}
