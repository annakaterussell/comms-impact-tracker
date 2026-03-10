

function App() {
  // State management
  const [config, setConfig] = useState(defaultConfig);
  const [coverage, setCoverage] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [networkData, setNetworkData] = useState([]);
  const [llmQueries, setLlmQueries] = useState([]);
  const [activeView, setActiveView] = useState('pr-overview');
  const [activeCampaign, setActiveCampaign] = useState(null);
  const [dateFilter, setDateFilter] = useState('all');
  const [editingCoverage, setEditingCoverage] = useState(null);
  
  // Modal states
  const [showAddCoverage, setShowAddCoverage] = useState(false);
  const [showAddCampaign, setShowAddCampaign] = useState(false);
  const [showAddNetworkData, setShowAddNetworkData] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedConfig = storage.get(STORAGE_KEYS.CONFIG);
    const savedCoverage = storage.get(STORAGE_KEYS.COVERAGE, []);
    const savedCampaigns = storage.get(STORAGE_KEYS.CAMPAIGNS, []);
    const savedNetworkData = storage.get(STORAGE_KEYS.NETWORK_UTILIZATION, []);
    const savedLlmQueries = storage.get(STORAGE_KEYS.LLM_QUERIES, []);
    
    if (savedConfig) setConfig(savedConfig);
    setCoverage(savedCoverage);
    setCampaigns(savedCampaigns);
    setNetworkData(savedNetworkData);
    setLlmQueries(savedLlmQueries);
  }, []);

  // Save functions
  const addCoverage = (item) => {
    const impactScore = calculateImpactScore(item, coverage, config);
    const newCoverage = [...coverage, { ...item, id: Date.now().toString(), impactScore }];
    setCoverage(newCoverage);
    storage.set(STORAGE_KEYS.COVERAGE, newCoverage);
  };

  const updateCoverage = (item) => {
    const impactScore = calculateImpactScore(item, coverage, config);
    const updatedCoverage = coverage.map(c => 
      c.id === item.id ? { ...item, impactScore } : c
    );
    setCoverage(updatedCoverage);
    storage.set(STORAGE_KEYS.COVERAGE, updatedCoverage);
  };

  const deleteCoverage = (id) => {
    const newCoverage = coverage.filter(c => c.id !== id);
    setCoverage(newCoverage);
    storage.set(STORAGE_KEYS.COVERAGE, newCoverage);
  };

  const addCampaign = (campaign) => {
    const newCampaigns = [...campaigns, { ...campaign, id: Date.now().toString() }];
    setCampaigns(newCampaigns);
    storage.set(STORAGE_KEYS.CAMPAIGNS, newCampaigns);
  };

  const addNetworkData = (data) => {
    const newData = [...networkData, data].sort((a, b) => 
      new Date(a.weekEnding) - new Date(b.weekEnding)
    );
    setNetworkData(newData);
    storage.set(STORAGE_KEYS.NETWORK_UTILIZATION, newData);
  };

  const handleExport = () => {
    const csv = exportToCSV(coverage, campaigns);
    downloadCSV(csv, `comms-impact-tracker-${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div className="app-container">
      {/* Header */}
      <div className="header">
        <div className="header-title">
          <div>
            <h1>Comms Impact Tracker</h1>
            <p className="text-slate-600 text-sm mt-1">Mercedes-Benz HPC Communications Performance</p>
          </div>
        </div>
        <div className="header-actions">
          <button onClick={() => setShowSettings(true)} className="btn-secondary">
            <Settings size={18} className="inline mr-2" />
            Settings
          </button>
          <button onClick={() => setShowAddNetworkData(true)} className="btn-secondary">
            <Plus size={18} className="inline mr-2" />
            Add Utilization Data
          </button>
          <button onClick={handleExport} className="btn-primary">
            <Download size={18} className="inline mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="content-section">
        {/* Business Objective */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold">Business Objective</h2>
              <p className="text-slate-600">Network Utilization: 105 kWh/port/day in 2026</p>
            </div>
          </div>
          <NetworkUtilizationChart 
            data={networkData}
            coverage={coverage}
            campaigns={campaigns}
            dateFilter={dateFilter}
            onFilterChange={setDateFilter}
            onAddData={() => setShowAddNetworkData(true)}
          />
        </div>

        {/* Marketing & Communications Objective */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">Marketing & Communications Objective</h2>
          <p className="text-slate-600 mb-6">Drive Awareness among EV Drivers (baseline: 60% in key markets)</p>
          <TopLevelScores coverage={coverage} config={config} />
        </div>

        {/* View Toggle */}
        <div className="flex gap-3 mb-6">
          <button 
            className={`nav-button ${activeView === 'pr-overview' ? 'active' : ''}`}
            onClick={() => setActiveView('pr-overview')}
          >
            PR Overview
          </button>
          <button 
            className={`nav-button ${activeView === 'campaigns' ? 'active' : ''}`}
            onClick={() => setActiveView('campaigns')}
          >
            Campaign Results
          </button>
          <button 
            className={`nav-button ${activeView === 'coverage-library' ? 'active' : ''}`}
            onClick={() => setActiveView('coverage-library')}
          >
            Coverage Library ({coverage.length})
          </button>
        </div>

        {/* View Content */}
        {activeView === 'pr-overview' && (
          <PROverview 
            coverage={coverage}
            config={config}
            onAddCoverage={() => setShowAddCoverage(true)}
          />
        )}

        {activeView === 'campaigns' && (
          <CampaignResults 
            campaigns={campaigns}
            coverage={coverage}
            activeCampaign={activeCampaign}
            onSelectCampaign={setActiveCampaign}
            onAddCampaign={() => setShowAddCampaign(true)}
            onAddCoverage={() => setShowAddCoverage(true)}
            config={config}
          />
        )}

        {activeView === 'coverage-library' && (
          <CoverageLibrary
            coverage={coverage}
            onEdit={(item) => {
              setEditingCoverage(item);
              setShowAddCoverage(true);
            }}
            onDelete={(id) => {
              if (confirm('Are you sure you want to delete this coverage?')) {
                deleteCoverage(id);
              }
            }}
            onAddCoverage={() => setShowAddCoverage(true)}
          />
        )}
      </div>



export default App;
