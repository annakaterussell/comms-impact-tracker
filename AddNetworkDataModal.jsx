import React, { useState } from 'react';
import { X, Save } from 'lucide-react';

const AddCampaignModal = ({ config, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    goal: '',
    targetAudience: '',
    keyMessages: [],
    campaignSpecificMessage: '',
    llmQuery: ''
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.startDate || !formData.endDate || !formData.goal) {
      alert('Please fill in all required fields');
      return;
    }

    onSubmit(formData);
    onClose();
  };

  const toggleMessage = (message) => {
    setFormData(prev => ({
      ...prev,
      keyMessages: prev.keyMessages.includes(message)
        ? prev.keyMessages.filter(m => m !== message)
        : [...prev.keyMessages, message]
    }));
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-3xl font-bold">Create New Campaign</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Campaign Name */}
          <div>
            <label className="block text-sm font-medium mb-2">Campaign Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="e.g., Q1 2026 Brand Awareness Push"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Start Date *</label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={e => setFormData({...formData, startDate: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">End Date *</label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={e => setFormData({...formData, endDate: e.target.value})}
              />
            </div>
          </div>

          {/* Campaign Goal */}
          <div>
            <label className="block text-sm font-medium mb-2">Campaign Goal *</label>
            <textarea
              required
              value={formData.goal}
              onChange={e => setFormData({...formData, goal: e.target.value})}
              placeholder="What are you trying to achieve?"
              rows={3}
            />
          </div>

          {/* Target Audience */}
          <div>
            <label className="block text-sm font-medium mb-2">Target Audience *</label>
            <div className="flex gap-3">
              {config.targetAudiences.map(aud => (
                <button
                  key={aud.id}
                  type="button"
                  onClick={() => setFormData({...formData, targetAudience: aud.name})}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    formData.targetAudience === aud.name
                      ? 'bg-blue-100 text-blue-800 border-2 border-blue-400'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {aud.name}
                </button>
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
                  onClick={() => toggleMessage(msg.text)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    formData.keyMessages.includes(msg.text)
                      ? 'bg-purple-100 text-purple-800 border-2 border-purple-400'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {msg.text}
                </button>
              ))}
            </div>
          </div>

          {/* Campaign-Specific Message */}
          <div>
            <label className="block text-sm font-medium mb-2">Campaign-Specific Key Message (Optional)</label>
            <input
              type="text"
              value={formData.campaignSpecificMessage}
              onChange={e => setFormData({...formData, campaignSpecificMessage: e.target.value})}
              placeholder="Add a custom message unique to this campaign"
            />
            <p className="text-xs text-slate-500 mt-1">This will appear with a ⭐ to distinguish it from core messages</p>
          </div>

          {/* LLM Query */}
          <div>
            <label className="block text-sm font-medium mb-2">LLM Query (Optional)</label>
            <input
              type="text"
              value={formData.llmQuery}
              onChange={e => setFormData({...formData, llmQuery: e.target.value})}
              placeholder="e.g., Mercedes-Benz charging stations near me"
            />
            <p className="text-xs text-slate-500 mt-1">Track how this campaign appears in LLM responses</p>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleSubmit}
              className="btn-primary flex-1"
            >
              <Save size={18} className="inline mr-2" />
              Create Campaign
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

export default AddCampaignModal;
