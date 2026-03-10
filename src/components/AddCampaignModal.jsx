import { useState, useEffect } from 'react';
import { KEY_MESSAGES, TARGET_AUDIENCES, LLM_PLATFORMS } from '../config/defaultConfig.js';

const EMPTY = {
  name: '', startDate: '', endDate: '', goal: '',
  targetAudience: [], keyMessages: [], campaignKeyMessage: '',
  llmQuery: '', notes: '',
};

export default function AddCampaignModal({ onClose, onSave, editItem }) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (editItem) setForm({ ...EMPTY, ...editItem });
    else setForm(EMPTY);
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

  function handleSubmit() {
    if (!form.name.trim()) {
      alert('Campaign Name is required.');
      return;
    }
    onSave({ ...form, id: editItem?.id || `camp-${Date.now()}` });
    onClose();
  }

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

          <div className="form-group">
            <label>Campaign Goal</label>
            <textarea value={form.goal} onChange={e => set('goal', e.target.value)} placeholder="Describe the campaign objective…" rows={3} />
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
            <div className="checkbox-group" style={{ flexDirection: 'column', gap: 6 }}>
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

          <div className="form-group">
            <label>LLM Query to Track</label>
            <input
              value={form.llmQuery}
              onChange={e => set('llmQuery', e.target.value)}
              placeholder='e.g. "Is the Mercedes charging network reliable?"'
            />
            <p className="text-sm text-muted" style={{ marginTop: 4 }}>This query will appear in the PR Overview LLM tracker.</p>
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
