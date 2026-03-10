import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

const AddCoverageModal = ({ config, campaigns, llmQueries, activeCampaign, onSubmit, onClose, editingCoverage }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    title: '',
    journalist: '',
    publication: '',
    publicationTier: 'Tech/Auto Tier 1 (1.8x) - TechCrunch, Wired, Car & Driver',
    reach: '',
    placementType: 'Proactive',
    mediaType: 'Online News',
    sentiment: 'Neutral',
    executiveVisibility: [],
    targetAudience: '',
    keyMessages: [],
    llmVisibility: [],
    llmQuery: '',
    campaignId: activeCampaign !== null && campaigns[activeCampaign] ? campaigns[activeCampaign].id : '',
    url: ''
  });

  // Pre-populate form if editing
  useEffect(() => {
    if (editingCoverage) {
      setFormData(editingCoverage);
    }
  }, [editingCoverage]);

  const handleSubmit = () => {
    console.log('Submit clicked, form data:', formData);
    
    // Validation
    if (!formData.title || !formData.publication || !formData.date) {
      alert('Please fill in required fields: Title, Publication, and Date');
      return;
    }

    onSubmit(formData);
    onClose();
  };

  const toggleArrayItem = (field, item) => {
    setFormData(prev => {
      const array = prev[field] || [];
      const newArray = array.includes(item)
        ? array.filter(i => i !== item)
        : [...array, item];
      return { ...prev, [field]: newArray };
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-3xl font-bold">{editingCoverage ? 'Edit' : 'Add'} Media Coverage</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Date *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Article Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder="Article headline"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Journalist Name</label>
              <input
                type="text"
                value={formData.journalist}
                onChange={e => setFormData({...formData, journalist: e.target.value})}
                placeholder="Reporter name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Publication *</label>
              <input
                type="text"
                required
                value={formData.publication}
                onChange={e => setFormData({...formData, publication: e.target.value})}
                placeholder="e.g., TechCrunch, WSJ"
              />
            </div>
          </div>

          {/* Publication Tier & Media Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Publication Tier *</label>
              <select
                required
                value={formData.publicationTier}
                onChange={e => setFormData({...formData, publicationTier: e.target.value})}
              >
                {Object.keys(config.publicationTiers).map(tier => (
                  <option key={tier} value={tier}>{tier}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Media Type *</label>
              <select
                required
                value={formData.mediaType}
                onChange={e => setFormData({...formData, mediaType: e.target.value})}
              >
                {config.mediaTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Reach */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Estimated Reach</label>
              <input
                type="number"
                value={formData.reach}
                onChange={e => setFormData({...formData, reach: e.target.value})}
                placeholder="e.g., 500000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Article URL</label>
              <input
                type="text"
                value={formData.url}
                onChange={e => setFormData({...formData, url: e.target.value})}
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Placement Type, Sentiment */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Placement Type *</label>
              <select
                required
                value={formData.placementType}
                onChange={e => setFormData({...formData, placementType: e.target.value})}
              >
                <option>Proactive</option>
                <option>Reactive</option>
                <option>Organic</option>
              </select>
              <p className="text-xs text-slate-500 mt-1">Proactive = Earned/Pitched</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Sentiment *</label>
              <select
                required
                value={formData.sentiment}
                onChange={e => setFormData({...formData, sentiment: e.target.value})}
              >
                <option>Positive</option>
                <option>Neutral</option>
                <option>Negative</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Target Audience</label>
              <select
                value={formData.targetAudience}
                onChange={e => setFormData({...formData, targetAudience: e.target.value})}
              >
                <option value="">Select...</option>
                <option>Consumer</option>
                <option>Business/Trade</option>
              </select>
            </div>
          </div>

          {/* Executive Visibility */}
          <div>
            <label className="block text-sm font-medium mb-2">Executive Visibility</label>
            <div className="space-y-2">
              {['Interview', 'Speaking', 'Quote'].map(type => (
                <label key={type} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.executiveVisibility?.includes(type) || false}
                    onChange={() => toggleArrayItem('executiveVisibility', type)}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <span className="text-sm">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Key Messages */}
          <div>
            <label className="block text-sm font-medium mb-2">Key Messages</label>
            <div className="flex flex-wrap gap-2">
              {config.keyMessages.map(msg => (
                <button
                  key={msg.id}
                  type="button"
                  onClick={() => toggleArrayItem('keyMessages', msg.text)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    formData.keyMessages?.includes(msg.text)
                      ? 'bg-purple-100 text-purple-800 border-2 border-purple-400'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {msg.text}
                </button>
              ))}
            </div>
          </div>

          {/* LLM Visibility */}
          <div>
            <label className="block text-sm font-medium mb-2">LLM Visibility</label>
            <div className="flex flex-wrap gap-2">
              {config.llmModels.map(model => (
                <button
                  key={model}
                  type="button"
                  onClick={() => toggleArrayItem('llmVisibility', model)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    formData.llmVisibility?.includes(model)
                      ? 'bg-blue-100 text-blue-800 border-2 border-blue-400'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {model}
                </button>
              ))}
            </div>
          </div>

          {/* LLM Query & Campaign */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">LLM Query</label>
              <select
                value={formData.llmQuery}
                onChange={e => setFormData({...formData, llmQuery: e.target.value})}
              >
                <option value="">None</option>
                {llmQueries.map(query => (
                  <option key={query.id} value={query.text}>{query.text}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Campaign</label>
              <select
                value={formData.campaignId}
                onChange={e => setFormData({...formData, campaignId: e.target.value})}
              >
                <option value="">None</option>
                {campaigns.map(campaign => (
                  <option key={campaign.id} value={campaign.id}>{campaign.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSubmit();
              }}
              className="btn-primary flex-1"
            >
              <Save size={18} className="inline mr-2" />
              {editingCoverage ? 'Update Coverage' : 'Add Coverage'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCoverageModal;
