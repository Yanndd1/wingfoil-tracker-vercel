# Wingfoil Tracker

A Progressive Web App (PWA) for tracking and analyzing your wingfoil/kitesurf sessions using Strava data.

## Features

- **Strava Integration**: Automatically syncs your kitesurf activities from Strava
- **Session Analysis**: Detects individual runs within each session based on speed patterns
- **Interactive Maps**: Visualize your session tracks with Leaflet maps
- **Detailed Statistics**: View duration, distance, speed, and heart rate data per run
- **Progress Tracking**: Charts showing your improvement over time
- **Jibe Detection**: Identifies jibes/transitions between runs
- **Multi-language Support**: Available in English, French, and Dutch
- **PWA**: Installable on mobile devices with offline capability
- **Spot Management**: Track your favorite wingfoil spots

## Screenshots

The app includes:
- Dashboard with session overview and progress charts
- Session list with filtering options
- Detailed session view with map and speed charts
- Individual run analysis
- Settings for run detection parameters

## Getting Started

### Prerequisites

- Node.js 18+ (recommended: 20+)
- A Strava account
- A Strava API application (for OAuth credentials)

### Strava API Setup

1. Go to [Strava API Settings](https://www.strava.com/settings/api)
2. Create a new application
3. Note your **Client ID** and **Client Secret**
4. Set the **Authorization Callback Domain** to your deployment URL (e.g., `localhost` for development or your Vercel domain for production)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Yanndd1/wingfoil-tracker-vercel.git
cd wingfoil-tracker-vercel
```

2. Install dependencies:
```bash
npm install
```

3. Create your environment file:
```bash
cp .env.example .env
```

4. Edit `.env` with your Strava credentials:
```env
VITE_STRAVA_CLIENT_ID=your_client_id
VITE_STRAVA_CLIENT_SECRET=your_client_secret
VITE_REDIRECT_URI=http://localhost:5173/callback
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:5173](http://localhost:5173) in your browser

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel project settings:
   - `VITE_STRAVA_CLIENT_ID`
   - `VITE_STRAVA_CLIENT_SECRET`
   - `VITE_REDIRECT_URI` (set to your Vercel deployment URL + `/callback`)
4. Deploy

### Other Platforms

The app can be deployed to any static hosting platform (Netlify, GitHub Pages, etc.). Make sure to:
- Set the environment variables
- Configure the redirect URI in your Strava API settings
- Handle client-side routing (SPA fallback to index.html)

## Tech Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Maps**: Leaflet + React-Leaflet
- **Charts**: Recharts
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **PWA**: vite-plugin-pwa

## Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── charts/        # Chart components (speed, progress)
│   ├── layout/        # Layout components (header, footer)
│   ├── maps/          # Map components (session map, mini map)
│   └── ui/            # UI components (cards, loading, etc.)
├── context/           # React context providers
│   ├── AuthContext    # Authentication state
│   ├── DataContext    # Session data management
│   └── LanguageContext # i18n support
├── i18n/              # Translation files (en, fr, nl)
├── pages/             # Route pages
├── services/          # API and storage services
├── types/             # TypeScript type definitions
└── utils/             # Utility functions (run detection, jibe detection)
```

## How It Works

1. **Authentication**: Users log in via Strava OAuth
2. **Data Sync**: The app fetches kitesurf activities from Strava API
3. **Run Detection**: Speed data is analyzed to identify individual runs (pumping phases)
4. **Storage**: Session data is stored locally in the browser (localStorage)
5. **Visualization**: Data is displayed with interactive maps and charts

## Configuration

Run detection can be customized in the Settings page:
- **Minimum Speed Threshold**: Speed above which pumping is detected (default: 8 km/h)
- **Minimum Run Duration**: Minimum duration to count as a run (default: 5 seconds)
- **Minimum Stop Duration**: Minimum gap between runs (default: 3 seconds)
- **Speed Smoothing Window**: Data points used for speed averaging (default: 3)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Strava API](https://developers.strava.com/) for activity data
- [OpenStreetMap](https://www.openstreetmap.org/) for map tiles
- The wingfoil community for inspiration

## Author

Created by [Yann_dd1](https://github.com/Yanndd1)

---

**Note**: This app is not affiliated with or endorsed by Strava, Inc.
