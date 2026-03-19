import { useState, useEffect, useMemo } from 'react';
import { loadData, saveData } from './utils/githubStorage.js';
import { computeStats } from './utils/calculations.js';
import { DEFAULT_PUBLICATION_TIERS, BUSINESS_OBJECTIVE } from './config/defaultConfig.js';

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

const DATE_PRESETS = [
  { label: 'All time', value: 'all' },
  { label: 'This month', value: 'month' },
  { label: 'This quarter', value: 'quarter' },
  { label: 'This year', value: 'year' },
  { label: 'Custom', value: 'custom' },
];

function getPresetRange(preset) {
  const now = new Date();
  if (preset === 'month') {
    return {
      from: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0],
      to: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0],
    };
  }
  if (preset === 'quarter') {
    const q = Math.floor(now.getMonth() / 3);
    return {
      from: new Date(now.getFullYear(), q * 3, 1).toISOString().split('T')[0],
      to: new Date(now.getFullYear(), q * 3 + 3, 0).toISOString().split('T')[0],
    };
  }
  if (preset === 'year') {
    return {
      from: `${now.getFullYear()}-01-01`,
      to: `${now.getFullYear()}-12-31`,
    };
  }
  return null;
}

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
  const [config, setConfig] = useState({
    publicationTiers: DEFAULT_PUBLICATION_TIERS,
    businessTarget: BUSINESS_OBJECTIVE.target,
    targetOutlets: [],
    targetJournalists: [],
  });

  // Shared date range filter for PR Overview page (controls both charts)
  const [prDatePreset, setPrDatePreset] = useState('all');
  const [prDateFrom, setPrDateFrom] = useState('');
  const [prDateTo, setPrDateTo] = useState('');

  // Modal visibility
  const [showCoverageModal, setShowCoverageModal] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showNetworkModal, setShowNetworkModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showQueryModal, setShowQueryModal] = useState(false);
  const [editingCoverage, setEditingCoverage] = useState(null);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [editingUtilization, setEditingUtilization] = useState(null);

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
        if (cfg && cfg.publicationTiers) {
          setConfig(prev => ({
            ...prev,
            ...cfg,
            targetOutlets: cfg.targetOutlets || [],
            targetJournalists: cfg.targetJournalists || [],
          }));
        }
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

  async function handleImportCoverage(items) {
    const next = [...coverage, ...items];
    await persist('coverage', next, setCoverage);
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
    const exists = utilization.find(u => u.weekStart === item.weekStart);
    const next = exists
      ? utilization.map(u => u.weekStart === item.weekStart ? item : u)
      : [...utilization, item];
    await persist('utilization', next, setUtilization);
    setEditingUtilization(null);
  }

  function openEditUtilization(item) {
    setEditingUtilization(item);
    setShowNetworkModal(true);
  }

  // ── Query handlers ────────────────────────────────────────────────────
  async function handleSaveQuery(item) {
    await persist('queries', [...queries, item], setQueries);
  }

  async function handleDeleteQuery(id) {
    await persist('queries', queries.filter(q => q.id !== id), setQueries);
  }

  // ── Config (pub tiers + business target + targets) ────────────────────
  async function handleSaveConfig(tiers, businessTarget) {
    const next = { ...config, publicationTiers: tiers, businessTarget };
    await persist('config', next, setConfig);
  }

  async function handleUpdateTargets(newTargets) {
    const next = { ...config, ...newTargets };
    await persist('config', next, setConfig);
  }

  // ── Merged queries: global + from campaigns ───────────────────────────
  const allQueries = useMemo(() => {
    const merged = [...queries];
    const existingTexts = new Set(queries.map(q => q.query.toLowerCase()));

    campaigns.forEach(camp => {
      (camp.llmQueries || []).filter(q => q.trim()).forEach(qText => {
        if (!existingTexts.has(qText.toLowerCase())) {
          merged.push({
            id: `camp-q-${camp.id}-${qText}`,
            query: qText,
            campaign: camp.name,
            fromCampaign: true,
          });
          existingTexts.add(qText.toLowerCase());
        }
      });
      // Legacy single llmQuery field
      if (camp.llmQuery && !existingTexts.has(camp.llmQuery.toLowerCase())) {
        merged.push({
          id: `camp-q-${camp.id}-legacy`,
          query: camp.llmQuery,
          campaign: camp.name,
          fromCampaign: true,
        });
        existingTexts.add(camp.llmQuery.toLowerCase());
      }
    });

    return merged;
  }, [queries, campaigns]);

  // ── Shared PR Overview date range ─────────────────────────────────────
  const prDateRange = useMemo(() => {
    if (prDatePreset !== 'all' && prDatePreset !== 'custom') return getPresetRange(prDatePreset);
    if (prDatePreset === 'custom' && (prDateFrom || prDateTo)) return { from: prDateFrom, to: prDateTo };
    return null;
  }, [prDatePreset, prDateFrom, prDateTo]);

  const prFilteredCoverage = useMemo(() => {
    if (!prDateRange) return coverage;
    return coverage.filter(c => {
      if (!c.publicationDate) return true;
      if (prDateRange.from && c.publicationDate < prDateRange.from) return false;
      if (prDateRange.to && c.publicationDate > prDateRange.to) return false;
      return true;
    });
  }, [coverage, prDateRange]);

  // ── Targets config ────────────────────────────────────────────────────
  const targets = useMemo(() => ({
    outlets: config.targetOutlets || [],
    journalists: config.targetJournalists || [],
  }), [config.targetOutlets, config.targetJournalists]);

  // ── Derived stats ─────────────────────────────────────────────────────
  const stats = computeStats(coverage, config.publicationTiers, targets);

  const businessTarget = config.businessTarget ?? BUSINESS_OBJECTIVE.target;

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
            {/* Shared date range filter — controls both Network Utilization and PR Overview metrics */}
            <div className="card" style={{ marginBottom: 16, padding: '12px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Date range:</span>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {DATE_PRESETS.map(p => (
                    <button
                      key={p.value}
                      className={`filter-btn${prDatePreset === p.value ? ' active' : ''}`}
                      onClick={() => setPrDatePreset(p.value)}
                    >{p.label}</button>
                  ))}
                </div>
                {prDatePreset === 'custom' && (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <input
                      type="date"
                      value={prDateFrom}
                      onChange={e => setPrDateFrom(e.target.value)}
                      style={{ padding: '6px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13 }}
                    />
                    <span style={{ fontSize: 12, color: '#888' }}>to</span>
                    <input
                      type="date"
                      value={prDateTo}
                      onChange={e => setPrDateTo(e.target.value)}
                      style={{ padding: '6px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13 }}
                    />
                  </div>
                )}
                {prDatePreset !== 'all' && (
                  <span className="text-sm text-muted" style={{ marginLeft: 4 }}>
                    Showing {prFilteredCoverage.length} of {coverage.length} coverage items
                  </span>
                )}
              </div>
            </div>

            <NetworkUtilizationChart
              utilization={utilization}
              coverage={coverage}
              campaigns={campaigns}
              onAddData={() => { setEditingUtilization(null); setShowNetworkModal(true); }}
              onEditData={openEditUtilization}
              businessTarget={businessTarget}
              dateRange={prDateRange}
            />
            <PROverview
              coverage={prFilteredCoverage}
              totalCoverage={coverage.length}
              publicationTiers={config.publicationTiers}
              queries={allQueries}
              onAddQuery={() => setShowQueryModal(true)}
              onDeleteQuery={handleDeleteQuery}
              onAddCoverage={() => { setEditingCoverage(null); setShowCoverageModal(true); }}
              targets={targets}
              onUpdateTargets={handleUpdateTargets}
            />
          </>
        )}

        {view === 'campaign-results' && (
          <CampaignResults
            campaigns={campaigns}
            coverage={coverage}
            publicationTiers={config.publicationTiers}
            targets={targets}
            onNewCampaign={() => { setEditingCampaign(null); setShowCampaignModal(true); }}
            onEditCampaign={openEditCampaign}
            onDeleteCampaign={handleDeleteCampaign}
            onAddCoverage={() => { setEditingCoverage(null); setShowCoverageModal(true); }}
            onEditCoverage={openEditCoverage}
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
            onImport={handleImportCoverage}
          />
        )}
      </main>

      {/* Modals */}
      {showCoverageModal && (
        <AddCoverageModal
          editItem={editingCoverage}
          campaigns={campaigns}
          publicationTiers={config.publicationTiers}
          queries={allQueries}
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
          editItem={editingUtilization}
          onClose={() => { setShowNetworkModal(false); setEditingUtilization(null); }}
          onSave={handleSaveUtilization}
        />
      )}
      {showSettingsModal && (
        <SettingsModal
          publicationTiers={config.publicationTiers}
          businessTarget={businessTarget}
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
