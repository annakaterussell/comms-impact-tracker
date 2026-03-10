import React, { useState } from 'react';
import { Plus, Edit2, X } from 'lucide-react';

const CoverageLibrary = ({ coverage, onEdit, onDelete, onAddCoverage }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSentiment, setFilterSentiment] = useState('all');
  const [filterAudience, setFilterAudience] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');

  const filteredAndSorted = coverage
    .filter(item => {
      const matchesSearch = !searchTerm || 
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.publication?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.journalist?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSentiment = filterSentiment === 'all' || item.sentiment === filterSentiment;
      const matchesAudience = filterAudience === 'all' || item.targetAudience === filterAudience;
      
      return matchesSearch && matchesSentiment && matchesAudience;
    })
    .sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.date) - new Date(a.date);
      if (sortBy === 'date-asc') return new Date(a.date) - new Date(b.date);
      if (sortBy === 'impact-desc') return (b.impactScore || 0) - (a.impactScore || 0);
      if (sortBy === 'reach-desc') return (parseInt(b.reach) || 0) - (parseInt(a.reach) || 0);
      return 0;
    });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold">Coverage Library ({coverage.length} total)</h3>
        <button onClick={onAddCoverage} className="btn-primary">
          <Plus size={18} className="inline mr-2" />
          Add Coverage
        </button>
      </div>

      {/* Filters */}
      <div className="stat-card">
        <div className="grid grid-cols-4 gap-4">
          <div>
            <input
              type="text"
              placeholder="Search title, publication, journalist..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <select value={filterSentiment} onChange={e => setFilterSentiment(e.target.value)} className="w-full">
              <option value="all">All Sentiment</option>
              <option value="Positive">Positive</option>
              <option value="Neutral">Neutral</option>
              <option value="Negative">Negative</option>
            </select>
          </div>
          <div>
            <select value={filterAudience} onChange={e => setFilterAudience(e.target.value)} className="w-full">
              <option value="all">All Audiences</option>
              <option value="Consumer">Consumer</option>
              <option value="Business/Trade">Business/Trade</option>
            </select>
          </div>
          <div>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="w-full">
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="impact-desc">Highest Impact</option>
              <option value="reach-desc">Highest Reach</option>
            </select>
          </div>
        </div>
      </div>

      {/* Coverage Items */}
      <div className="space-y-4">
        {filteredAndSorted.length === 0 ? (
          <div className="stat-card text-center py-12 text-slate-500">
            {coverage.length === 0 ? 'No coverage added yet' : 'No coverage matches your filters'}
          </div>
        ) : (
          filteredAndSorted.map(item => (
            <div key={item.id} className="stat-card hover:shadow-lg transition-all">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  {/* Title - Hyperlinked if URL exists */}
                  {item.url ? (
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xl font-semibold text-blue-600 hover:text-blue-800 hover:underline mb-2 block"
                    >
                      {item.title} ↗
                    </a>
                  ) : (
                    <h4 className="text-xl font-semibold mb-2">{item.title}</h4>
                  )}

                  {/* Metadata */}
                  <div className="flex flex-wrap items-center gap-3 mb-3 text-sm">
                    <span className="font-medium text-slate-700">{item.date}</span>
                    <span className={`score-badge sentiment-${item.sentiment?.toLowerCase()}`}>
                      {item.sentiment}
                    </span>
                    <span className={`score-badge ${
                      item.impactScore >= 80 ? 'score-high' : 
                      item.impactScore >= 60 ? 'score-medium' : 'score-low'
                    }`}>
                      Impact: {item.impactScore}
                    </span>
                    {item.mediaType && (
                      <span className="text-slate-600">📰 {item.mediaType}</span>
                    )}
                  </div>

                  {/* Publication Info */}
                  <div className="text-sm text-slate-600 mb-3">
                    <strong>{item.publication}</strong>
                    {item.journalist && ` • ${item.journalist}`}
                    {item.reach && ` • ${parseInt(item.reach).toLocaleString()} reach`}
                    {item.executiveVisibility?.length > 0 && (
                      <span className="ml-2 font-medium text-purple-600">
                        • {item.executiveVisibility.join(' + ')}
                      </span>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {item.targetAudience && (
                      <span className="badge bg-blue-50 text-blue-700">
                        👥 {item.targetAudience}
                      </span>
                    )}
                    {item.placementType && (
                      <span className="badge bg-amber-50 text-amber-700">
                        {item.placementType}
                      </span>
                    )}
                    {item.keyMessages?.map((msg, i) => (
                      <span key={i} className="badge bg-green-50 text-green-700 text-xs">
                        ✓ {msg}
                      </span>
                    ))}
                    {item.llmVisibility?.map((llm, i) => (
                      <span key={i} className="badge bg-purple-50 text-purple-700 text-xs">
                        🤖 {llm}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      console.log('Edit clicked for:', item);
                      onEdit(item);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                    title="Edit"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      console.log('Delete clicked for:', item.id);
                      onDelete(item.id);
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                    title="Delete"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CoverageLibrary;
