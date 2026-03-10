import React, { useState } from 'react';
import { X, Save } from 'lucide-react';

const AddNetworkDataModal = ({ onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    weekEnding: '',
    utilization: ''
  });

  const handleSubmit = () => {
    if (!formData.weekEnding || !formData.utilization) {
      alert('Please fill in both fields');
      return;
    }

    if (parseFloat(formData.utilization) < 0) {
      alert('Utilization must be a positive number');
      return;
    }

    onSubmit({
      weekEnding: formData.weekEnding,
      utilization: parseFloat(formData.utilization)
    });
    
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold">Add Network Utilization Data</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Week Ending Date *</label>
            <input
              type="date"
              required
              value={formData.weekEnding}
              onChange={e => setFormData({...formData, weekEnding: e.target.value})}
            />
            <p className="text-xs text-slate-500 mt-1">Select the last day of the week (typically Sunday)</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Utilization (kWh/port/day) *</label>
            <input
              type="number"
              required
              step="0.1"
              value={formData.utilization}
              onChange={e => setFormData({...formData, utilization: e.target.value})}
              placeholder="e.g., 96.5"
            />
            <p className="text-xs text-slate-500 mt-1">Target: 105 kWh/port/day</p>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleSubmit}
              className="btn-primary flex-1"
            >
              <Save size={18} className="inline mr-2" />
              Add Data
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

export default AddNetworkDataModal;
