import React, { useState } from 'react';
import { X, Save, Plus, Trash2 } from 'lucide-react';

const SettingsModal = ({ config, onSave, onClose }) => {
  const [editConfig, setEditConfig] = useState(JSON.parse(JSON.stringify(config)));
  const [newTierName, setNewTierName] = useState('');
  const [newTierMultiplier, setNewTierMultiplier] = useState('1.0');

  const addTier = () => {
    if (!newTierName || !newTierMultiplier) {
      alert('Please enter both tier name and multiplier');
      return;
    }

    const multiplier = parseFloat(newTierMultiplier);
    if (isNaN(multiplier) || multiplier < 0.1 || multiplier > 3.0) {
      alert('Multiplier must be between 0.1 and 3.0');
      return;
    }

    setEditConfig({
      ...editConfig,
      publicationTiers: {
        ...editConfig.publicationTiers,
        [newTierName]: multiplier
      }
    });

    setNewTierName('');
    setNewTierMultiplier('1.0');
  };

  const deleteTier = (tierName) => {
    if (Object.keys(editConfig.publicationTiers).length <= 1) {
      alert('You must have at least one publication tier');
      return;
    }

    const newTiers = { ...editConfig.publicationTiers };
    delete newTiers[tierName];
    setEditConfig({
      ...editConfig,
      publicationTiers: newTiers
    });
  };

  const updateTierMultiplier = (tierName, value) => {
    const multiplier = parseFloat(value);
    if (isNaN(multiplier)) return;

    setEditConfig({
      ...editConfig,
      publicationTiers: {
        ...editConfig.publicationTiers,
        [tierName]: multiplier
      }
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-3xl font-bold">Settings</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Publication Tiers */}
          <div>
            <h4 className="text-xl font-semibold mb-4">Publication Tiers</h4>
            <p className="text-sm text-slate-600 mb-4">
              These multipliers affect impact scores. Higher multipliers = greater impact.
            </p>

            <div className="space-y-3 mb-4">
              {Object.entries(editConfig.publicationTiers).map(([tierName, multiplier]) => (
                <div key={tierName} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{tierName}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="3.0"
                      value={multiplier}
                      onChange={e => updateTierMultiplier(tierName, e.target.value)}
                      className="w-20"
                    />
                    <span className="text-sm text-slate-600">×</span>
                    <button
                      type="button"
                      onClick={() => deleteTier(tierName)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      title="Delete tier"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Tier */}
            <div className="border-t pt-4">
              <h5 className="font-medium mb-3">Add New Tier</h5>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newTierName}
                  onChange={e => setNewTierName(e.target.value)}
                  placeholder="Tier name (e.g., Premium News (2.5x))"
                  className="flex-1"
                />
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="3.0"
                  value={newTierMultiplier}
                  onChange={e => setNewTierMultiplier(e.target.value)}
                  placeholder="1.0"
                  className="w-24"
                />
                <button
                  type="button"
                  onClick={addTier}
                  className="btn-primary"
                  style={{ padding: '10px 20px' }}
                >
                  <Plus size={18} className="inline mr-1" />
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Save Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button onClick={() => onSave(editConfig)} className="btn-primary flex-1">
              <Save size={18} className="inline mr-2" />
              Save Settings
            </button>
            <button onClick={onClose} className="btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
