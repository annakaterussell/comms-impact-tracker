import { useState, useEffect } from 'react';
import {
  KEY_MESSAGES, TARGET_AUDIENCES, PLACEMENT_TYPES, MEDIA_TYPES,
  SENTIMENT_OPTIONS, EXECUTIVE_VISIBILITY_OPTIONS, LLM_PLATFORMS,
} from '../config/defaultConfig.js';

const EMPTY = {
  title: '', journalist: '', publication: '', publicationDate: '',
  mediaType: '', estimatedReach: '', publicationTierId: '',
  placementType: '', sentiment: '', targetAudience: [],
  executiveVisibility: [], narrative: '', keyMessages: [], llmVisibility: [],
  llmQuery: '', articleUrl: '', campaignId: '', notes: '',
  quote: '', nameInTitle: false,
  syndications: [],
};

const EMPTY_SYNDICATION = { publication: '', estimatedReach: '', link: '' };

export default function AddCoverageModal({ onClose, onSave, editItem, campaigns, publicationTiers, queries }) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (editItem) setForm({ ...EMPTY, ...editItem, syndications: editItem.syndications || [] });
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

  function addSyndication() {
    setForm(f => ({ ...f, syndications: [...(f.syndications || []), { ...EMPTY_SYNDICATION }] }));
  }

  function updateSyndication(index, field, value) {
    setForm(f => {
      const synd = [...(f.syndications || [])];
      synd[index] = { ...synd[index], [field]: value };
      return { ...f, syndications: synd };
    });
  }

  function removeSyndication(index) {
    setForm(f => ({ ...f, syndications: (f.syndications || []).filter((_, i) => i !== index) }));
  }

  function handleSubmit() {
    if (!form.title.trim() || !form.publication.trim()) {
      alert('Article Title and Publication are required.');
      return;
    }
    onSave({ ...form, id: editItem?.id || `cov-${Date.now()}` });
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
          <h2>{editItem ? 'Edit Coverage' : 'Add Coverage'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>

          {/* Article Title */}
          <div className="form-group">
            <label>Article Title <span className="req">*</span></label>
            <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Article headline" />
          </div>

          {/* Name in Title — moved to top */}
          <div className="form-group">
            <label>Name in Title</label>
            <div className="checkbox-group">
              <label className="checkbox-item">
                <input type="checkbox" checked={!!form.nameInTitle} onChange={e => set('nameInTitle', e.target.checked)} />
                Mercedes-Benz / brand name appears in article title
              </label>
            </div>
            <p className="text-sm text-muted" style={{ marginTop: 4 }}>Adds a 1.1× multiplier to the Business Impact Score</p>
          </div>

          {/* Article URL */}
          <div className="form-group">
            <label>Article URL</label>
            <input type="url" value={form.articleUrl} onChange={e => set('articleUrl', e.target.value)} placeholder="https://…" />
          </div>

          {/* Journalist + Publication */}
          <div className="form-row">
            <div className="form-group">
              <label>Journalist</label>
              <input value={form.journalist} onChange={e => set('journalist', e.target.value)} placeholder="Journalist name" />
            </div>
            <div className="form-group">
              <label>Publication <span className="req">*</span></label>
              <input value={form.publication} onChange={e => set('publication', e.target.value)} placeholder="e.g. Electrek" />
            </div>
          </div>

          {/* Publication Date + Media Type */}
          <div className="form-row">
            <div className="form-group">
              <label>Publication Date</label>
              <input type="date" value={form.publicationDate} onChange={e => set('publicationDate', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Media Type</label>
              <select value={form.mediaType} onChange={e => set('mediaType', e.target.value)}>
                <option value="">Select…</option>
                {MEDIA_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Estimated Reach + Publication Tier */}
          <div className="form-row">
            <div className="form-group">
              <label>Estimated Reach</label>
              <input type="number" value={form.estimatedReach} onChange={e => set('estimatedReach', e.target.value)} placeholder="e.g. 500000" />
            </div>
            <div className="form-group">
              <label>Publication Tier</label>
              <select value={form.publicationTierId} onChange={e => set('publicationTierId', e.target.value)}>
                <option value="">Select…</option>
                {publicationTiers.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.description})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Placement Type + Sentiment */}
          <div className="form-row">
            <div className="form-group">
              <label>Placement Type</label>
              <select value={form.placementType} onChange={e => set('placementType', e.target.value)}>
                <option value="">Select…</option>
                {PLACEMENT_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Sentiment</label>
              <select value={form.sentiment} onChange={e => set('sentiment', e.target.value)}>
                <option value="">Select…</option>
                {SENTIMENT_OPTIONS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Target Audience */}
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

          {/* Executive Visibility */}
          <div className="form-group">
            <label>Executive Visibility</label>
            <div className="checkbox-group">
              {EXECUTIVE_VISIBILITY_OPTIONS.map(e => (
                <label key={e} className="checkbox-item">
                  <input type="checkbox" checked={(form.executiveVisibility || []).includes(e)} onChange={() => toggleArray('executiveVisibility', e)} />
                  {e}
                </label>
              ))}
            </div>
          </div>

          {/* Narrative — sits above Key Messages */}
          <div className="form-group">
            <label>Narrative</label>
            <textarea
              value={form.narrative || ''}
              onChange={e => set('narrative', e.target.value)}
              placeholder="Describe the narrative or angle of this coverage…"
              rows={3}
            />
          </div>

          {/* Key Message Pull-Through */}
          <div className="form-group">
            <label>Key Message Pull-Through</label>
            <div className="checkbox-group" style={{ flexDirection: 'column', gap: 6 }}>
              {KEY_MESSAGES.map(m => (
                <label key={m} className="checkbox-item">
                  <input type="checkbox" checked={(form.keyMessages || []).includes(m)} onChange={() => toggleArray('keyMessages', m)} />
                  {m}
                </label>
              ))}
            </div>
          </div>

          {/* LLM Visibility */}
          <div className="form-group">
            <label>LLM Visibility</label>
            <div className="checkbox-group">
              {LLM_PLATFORMS.map(p => (
                <label key={p} className="checkbox-item">
                  <input type="checkbox" checked={(form.llmVisibility || []).includes(p)} onChange={() => toggleArray('llmVisibility', p)} />
                  {p}
                </label>
              ))}
            </div>
          </div>

          {/* Link to LLM Query */}
          <div className="form-group">
            <label>Link to LLM Query</label>
            <select value={form.llmQuery} onChange={e => set('llmQuery', e.target.value)}>
              <option value="">None</option>
              {(queries || []).map(q => <option key={q.id} value={q.query}>{q.query}</option>)}
            </select>
          </div>

          {/* Notes */}
          <div className="form-group">
            <label>Notes</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Any additional context…" rows={3} />
          </div>

          {/* Campaign */}
          <div className="form-group">
            <label>Campaign</label>
            <select value={form.campaignId} onChange={e => set('campaignId', e.target.value)}>
              <option value="">None</option>
              {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Syndications */}
          <div className="form-group">
            <label>Syndications</label>
            <p className="text-sm text-muted" style={{ marginBottom: 8 }}>Track syndicated publications of this article.</p>
            {(form.syndications || []).map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                  <input
                    value={s.publication}
                    onChange={e => updateSyndication(i, 'publication', e.target.value)}
                    placeholder="Publication name"
                  />
                  <input
                    type="number"
                    value={s.estimatedReach}
                    onChange={e => updateSyndication(i, 'estimatedReach', e.target.value)}
                    placeholder="Est. reach"
                  />
                  <input
                    type="url"
                    value={s.link}
                    onChange={e => updateSyndication(i, 'link', e.target.value)}
                    placeholder="https://…"
                  />
                </div>
                <button type="button" style={removeBtn} onClick={() => removeSyndication(i)}>×</button>
              </div>
            ))}
            <button type="button" className="btn btn-secondary btn-sm" onClick={addSyndication}>+ Add Syndication</button>
          </div>

        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            {editItem ? 'Update Coverage' : 'Add Coverage'}
          </button>
        </div>
      </div>
    </div>
  );
}
