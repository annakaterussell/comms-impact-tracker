import { useState, useEffect, useCallback } from 'react';
import { loadData, saveData } from './utils/githubStorage.js';
import { computeStats } from './utils/calculations.js';
import { DEFAULT_PUBLICATION_TIERS } from './config/defaultConfig.js';

import TopLevelScores from './components/TopLevelScores.jsx';
import NetworkUtilizationChart from './components/NetworkUtilizationChart.jsx';
import PROverview from './components/PROverview.jsx';
import CampaignResults from './components/CampaignResults.jsx';
import CoverageLibrary from './components/CoverageLibrary.jsx';
import AddCoverageModal from './components/AddCoverageModal.jsx';
import AddCampaignModal from './components/AddCampaignModal.jsx';
import AddNetworkDataModal from './components/AddNetworkDataModal.jsx';
import SettingsModal from './components/SettingsModal.jsx';

const VIEWS = [
  { id: 'pr-overview', label: 'PR Overview' },
  { id: 'campaign-results', label: 'Campaign Results' },
  { id: 'coverage-library', label: 'Coverage Library' },
];

// ── Add LLM Query inline modal ──────────────────────────────────────────────
function AddQueryModal({ onClose, onSave, campaigns }) {
  const [query, setQuery] = useState('');
  const [campaign, setCampaign] = useState('');
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <h2>Add LLM Query to Track</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>Query</label>
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder='e.g. "Is the Mercedes charging network reliable?"' />
          </div>
          <div className="form-group">
            <label>Link to Campaign (optional)</label>
            <select value={campaign} onChange={e => setCampaign(e.target.value)}>
              <option value="">None</option>
              {campaigns.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => {
            if (!query.trim()) return;
            onSave({ id: `q-${Date.now()}`, query: query.trim(), campaign });
            onClose();
          }}>Add Query</button>
        </div>
      </div>
    </div>
  );
}

// ── Main App ────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState('pr-overview');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Data
  const [coverage, setCoverage] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [utilization, setUtilization] = useState([]);
  const [queries, setQueries] = useState([]);
  const [config, setConfig] = useState({ publicationTiers: DEFAULT_PUBLICATION_TIERS });

  // Modal visibility
  const [showCoverageModal, setShowCoverageModal] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showNetworkModal, setShowNetworkModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showQueryModal, setShowQueryModal] = useState(false);
  const [editingCoverage, setEditingCoverage] = useState(null);
  const [editingCampaign, setEditingCampaign] = useState(null);

  // ── Load all data on mount ─────────────────────────────────────────────
  useEffect(() => {
    async function fetchAll() {
      try {
        const [cov, camp, util, qry, cfg] = await Promise.all([
          loadData('coverage'),
          loadData('campaigns'),
          loadData('utilization'),
          loadData('queries'),
          loadData('config'),
        ]);
        setCoverage(cov);
        setCampaigns(camp);
        setUtilization(util);
        setQueries(qry);
        if (cfg && cfg.publicationTiers) setConfig(cfg);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  // ── Save helpers ──────────────────────────────────────────────────────
  async function persist(file, data, setter) {
    setSaving(true);
    try {
      await saveData(file, data);
      setter(data);
    } catch (e) {
      alert(`Save failed: ${e.message}`);
    } finally {
      setSaving(false);
    }
  }

  // ── Coverage handlers ─────────────────────────────────────────────────
  async function handleSaveCoverage(item) {
    const next = editingCoverage
      ? coverage.map(c => c.id === item.id ? item : c)
      : [...coverage, item];
    await persist('coverage', next, setCoverage);
    setEditingCoverage(null);
  }

  async function handleDeleteCoverage(id) {
    await persist('coverage', coverage.filter(c => c.id !== id), setCoverage);
  }

  function openEditCoverage(item) {
    setEditingCoverage(item);
    setShowCoverageModal(true);
  }

  // ── Campaign handlers ─────────────────────────────────────────────────
  async function handleSaveCampaign(item) {
    const next = editingCampaign
      ? campaigns.map(c => c.id === item.id ? item : c)
      : [...campaigns, item];
    await persist('campaigns', next, setCampaigns);
    setEditingCampaign(null);
  }

  async function handleDeleteCampaign(id) {
    await persist('campaigns', campaigns.filter(c => c.id !== id), setCampaigns);
  }

  function openEditCampaign(item) {
    setEditingCampaign(item);
    setShowCampaignModal(true);
  }

  // ── Utilization handlers ──────────────────────────────────────────────
  async function handleSaveUtilization(item) {
    // Replace if same week exists, else append
    const exists = utilization.find(u => u.weekStart === item.weekStart);
    const next = exists
      ? utilization.map(u => u.weekStart === item.weekStart ? item : u)
      : [...utilization, item];
    await persist('utilization', next, setUtilization);
  }

  // ── Query handlers ────────────────────────────────────────────────────
  async function handleSaveQuery(item) {
    await persist('queries', [...queries, item], setQueries);
  }

  async function handleDeleteQuery(id) {
    await persist('queries', queries.filter(q => q.id !== id), setQueries);
  }

  // ── Config (pub tiers) ────────────────────────────────────────────────
  async function handleSaveConfig(tiers) {
    const next = { ...config, publicationTiers: tiers };
    await persist('config', next, setConfig);
  }

  // ── Derived stats ─────────────────────────────────────────────────────
  const stats = computeStats(coverage, config.publicationTiers);

  // ── Render ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="app">
        <div className="loading-bar" />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: 12, color: '#888' }}>
          <p style={{ fontSize: 14 }}>Loading data from GitHub…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <div style={{ display: 'flex', align: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: 12, padding: 32 }}>
          <h2 style={{ color: '#ef4444' }}>Failed to load data</h2>
          <p style={{ color: '#555' }}>{error}</p>
          <p style={{ fontSize: 13, color: '#888' }}>
            Make sure your <code>GITHUB_TOKEN</code> environment variable is configured and the <code>/api/data</code> serverless function is running.
            {' '}If running locally, use <code>vercel dev</code> instead of <code>npm run dev</code>.
          </p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-brand">
          <h1>Comms Impact Tracker</h1>
          <span>Mercedes-Benz High Power Charging</span>
        </div>
        <div className="header-actions">
          {saving && (
            <div className="save-indicator">
              <div className="save-dot" />
              Saving…
            </div>
          )}
          <button className="btn btn-secondary btn-sm" onClick={() => setShowSettingsModal(true)}>Settings</button>
          <button className="btn btn-primary btn-sm" onClick={() => { setEditingCoverage(null); setShowCoverageModal(true); }}>
            + Add Coverage
          </button>
        </div>
      </header>

      {/* Top-level scores */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e0e0e0', padding: '16px 24px' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <TopLevelScores stats={stats} />
        </div>
      </div>

      {/* Nav tabs */}
      <nav className="main-nav">
        {VIEWS.map(v => (
          <button
            key={v.id}
            className={`nav-tab${view === v.id ? ' active' : ''}`}
            onClick={() => setView(v.id)}
          >{v.label}</button>
        ))}
      </nav>

      {/* Main content */}
      <main className="content">
        {view === 'pr-overview' && (
          <>
            <NetworkUtilizationChart
              utilization={utilization}
              coverage={coverage}
              campaigns={campaigns}
              onAddData={() => setShowNetworkModal(true)}
            />
            <PROverview
              coverage={coverage}
              stats={stats}
              queries={queries}
              onAddQuery={() => setShowQueryModal(true)}
              onDeleteQuery={handleDeleteQuery}
              onAddCoverage={() => { setEditingCoverage(null); setShowCoverageModal(true); }}
            />
          </>
        )}

        {view === 'campaign-results' && (
          <CampaignResults
            campaigns={campaigns}
            coverage={coverage}
            publicationTiers={config.publicationTiers}
            onNewCampaign={() => { setEditingCampaign(null); setShowCampaignModal(true); }}
            onEditCampaign={openEditCampaign}
            onDeleteCampaign={handleDeleteCampaign}
            onAddCoverage={() => { setEditingCoverage(null); setShowCoverageModal(true); }}
          />
        )}

        {view === 'coverage-library' && (
          <CoverageLibrary
            coverage={coverage}
            campaigns={campaigns}
            publicationTiers={config.publicationTiers}
            onEdit={openEditCoverage}
            onDelete={handleDeleteCoverage}
            onAdd={() => { setEditingCoverage(null); setShowCoverageModal(true); }}
          />
        )}
      </main>

      {/* Modals */}
      {showCoverageModal && (
        <AddCoverageModal
          editItem={editingCoverage}
          campaigns={campaigns}
          publicationTiers={config.publicationTiers}
          queries={queries}
          onClose={() => { setShowCoverageModal(false); setEditingCoverage(null); }}
          onSave={handleSaveCoverage}
        />
      )}
      {showCampaignModal && (
        <AddCampaignModal
          editItem={editingCampaign}
          onClose={() => { setShowCampaignModal(false); setEditingCampaign(null); }}
          onSave={handleSaveCampaign}
        />
      )}
      {showNetworkModal && (
        <AddNetworkDataModal
          onClose={() => setShowNetworkModal(false)}
          onSave={handleSaveUtilization}
        />
      )}
      {showSettingsModal && (
        <SettingsModal
          publicationTiers={config.publicationTiers}
          onClose={() => setShowSettingsModal(false)}
          onSave={handleSaveConfig}
        />
      )}
      {showQueryModal && (
        <AddQueryModal
          campaigns={campaigns}
          onClose={() => setShowQueryModal(false)}
          onSave={handleSaveQuery}
        />
      )}
    </div>
  );
}
