# Comms Impact Tracker

A comprehensive PR and communications performance tracking application for Mercedes-Benz HPC, designed to connect comms work to business value.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

```bash
# Navigate to project directory
cd comms-impact-tracker

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will open at `http://localhost:3000`

## 📦 Project Structure

```
comms-impact-tracker/
├── src/
│   ├── components/          # React components
│   │   ├── TopLevelScores.jsx
│   │   ├── NetworkUtilizationChart.jsx
│   │   ├── PROverview.jsx
│   │   ├── CampaignResults.jsx
│   │   ├── CoverageLibrary.jsx
│   │   ├── AddCoverageModal.jsx
│   │   ├── AddCampaignModal.jsx
│   │   ├── AddNetworkDataModal.jsx
│   │   └── SettingsModal.jsx
│   ├── config/             # Configuration files
│   │   └── defaultConfig.js
│   ├── utils/              # Utility functions
│   │   ├── storage.js      # LocalStorage management
│   │   ├── calculations.js # Impact score & stats
│   │   └── exportCSV.js    # CSV export functionality
│   ├── styles/             # CSS styles
│   │   └── index.css
│   ├── App.jsx             # Main application component
│   └── main.jsx            # Entry point
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 🎯 Features

### Business Objective Tracking
- **Network Utilization Chart**: Bar chart showing weekly kWh/port/day
- **Date Filters**: Week, Month, Quarter, Year, All
- **Campaign Overlays**: Visual indicators showing when campaigns are active
- **Coverage Markers**: Blue dots showing when coverage was published
- **Target Line**: 105 kWh/port/day goal visualization

### Marketing & Communications Metrics
- **Total Coverage**: Count of all published articles
- **Total Reach**: Combined estimated impressions
- **Top Key Message**: Highest-performing message by percentage
- **Target Audience**: Consumer-weighted alignment score
- **Executive Visibility**: Percentage with exec involvement

### Coverage Management
- **Coverage Library**: Searchable, filterable library of all coverage
- **Edit & Delete**: Full CRUD operations on coverage items
- **URL Hyperlinking**: Clickable article titles
- **Impact Scores**: Automated calculation for each article
- **Campaign Assignment**: Link coverage to specific campaigns

### Impact Scoring System (0-100)

**Base Score Components:**
- Reach Score (0-25): Normalized to max reach in dataset
- Message Alignment (0-25): Credit for any key message inclusion
- Audience Precision (0-20): Consumer weighted 2x higher
- Sentiment Impact (0-15): Positive=15, Neutral=7, Negative=0
- LLM Visibility (0-15): Percentage of LLM platforms

**Multipliers:**
- Publication Tier: 0.8x-2.0x (customizable)
- Placement Type: Proactive=1.2x, Reactive=1.0x, Organic=0.9x
- Executive Visibility: Interview=1.5x, Speaking=1.4x, Quote=1.2x

## 📊 Key Messages

The tracker monitors these 6 key messages:
1. Mercedes-Benz HPC is a fast EV charging network.
2. Mercedes-Benz HPC is open to ALL.
3. Mercedes-Benz HPC is a reliable charging network.
4. Mercedes-Benz HPC has a desirable amenity offering.
5. Mercedes-Benz HPC is a leader in EV charging tech.
6. Mercedes-Benz is customer centric.

## 💾 Data Storage

All data is stored in **browser localStorage**:
- `comms-config`: Configuration settings
- `comms-coverage`: All coverage items
- `comms-campaigns`: Campaign data
- `network-utilization`: Weekly utilization data
- `llm-queries`: Tracked LLM queries

**Important:** Data is stored locally in your browser. To backup:
1. Export CSV from the app
2. Or manually export localStorage data

## 🛠️ Available Scripts

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## 🎨 Customization

### Publication Tiers
Customize in Settings modal:
- Add new tiers
- Edit multipliers (0.1-3.0 range)
- Delete existing tiers
- Changes affect impact score calculations

### Key Messages
Edit in `src/config/defaultConfig.js`:
```javascript
keyMessages: [
  { id: '1', text: 'Your custom message' },
  // ... more messages
]
```

## 📝 Usage Guide

### Adding Coverage
1. Click "Add Coverage" button
2. Fill in article details:
   - Basic info (date, title, journalist, publication)
   - Media type and reach
   - Sentiment and placement type
   - Executive visibility (Interview, Speaking, Quote)
   - Key messages (multi-select)
   - LLM visibility
   - Campaign assignment
   - Article URL

3. Click "Add Coverage" to save

### Creating Campaigns
1. Click "Create Campaign"
2. Enter campaign details:
   - Name, dates, goal
   - Target audience
   - Key messages
   - Campaign-specific message (optional)
   - LLM query (optional)

### Editing Coverage
1. Go to "Coverage Library" tab
2. Click edit (pencil icon) on any article
3. Modify details
4. Click "Update Coverage"

### Exporting Data
1. Click "Export CSV" in header
2. Opens as downloadable file
3. Includes all coverage with impact scores

## 🐛 Debugging

### Clear All Data
```javascript
// In browser console
localStorage.clear()
location.reload()
```

### Check Storage
```javascript
// View stored data
console.log(localStorage.getItem('comms-coverage'))
```

## 🔄 Migration from Artifact

If migrating from the previous artifact version:
1. Export CSV from artifact
2. Install and run this app
3. Manually re-enter data or modify CSV import (feature coming soon)

## 📈 Future Enhancements

Potential features to add:
- CSV bulk import
- Real database backend
- User authentication
- Multi-user collaboration
- Advanced analytics
- PDF report generation
- Calendar date pickers for filters
- Automated data backups

## 🤝 Contributing

This is a custom internal tool for Mercedes-Benz HPC communications team.

## 📄 License

Proprietary - Mercedes-Benz HPC Internal Use Only

## 🆘 Support

For issues or questions:
1. Check browser console for errors
2. Verify localStorage permissions
3. Try in incognito mode
4. Clear cache and reload

---

Built with React + Vite for Mercedes-Benz HPC Communications Team
