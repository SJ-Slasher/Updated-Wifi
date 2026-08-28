# WiFiHub Nepal 📡

A community-powered WiFi sharing platform for Nepal. Discover verified WiFi passwords from cafes, restaurants, hotels, coworking spaces, and public places across Nepal.

## Features

- 🗺️ **Interactive OpenStreetMap Map** – Nepal-centered map with clickable WiFi markers (no map API key required)
- 🟢 **Color-coded markers** – Green (verified), Yellow (partial), Red (outdated)
- 🔑 **WiFi Discovery** – Browse 15+ pre-seeded Nepal locations
- 📱 **QR Code Generation** – Instant WiFi QR codes for scanning
- ✅ **Verification System** – Community upvote/verify/report system
- 🔐 **Authentication** – JWT-based login/register with role system
- 👑 **Admin Panel** – Manage reports, networks, and locations
- 🏆 **Gamification** – Reputation points, badges, leaderboard
- 🌙 **Dark/Light Mode** – Toggle between themes
- 📊 **Quality Scores** – Speed, stability, reliability, work-friendly ratings
- 🔖 **Save Networks** – Bookmark favorite WiFi spots

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@wifihub.np | (any) |
| Contributor | ramesh@example.com | (any) |
| User | sita@example.com | (any) |

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Custom Design System
- **Map**: Leaflet + OpenStreetMap tiles (no map API key required)
- **QR**: qrcode library
- **Storage**: localStorage (mock backend)
- **Auth**: JWT simulation with localStorage

## Project Structure

```
src/
├── assets/          # Static assets (hero-bg.jpg)
├── components/
│   ├── features/    # Map, NetworkCard, QRModal, etc.
│   ├── layout/      # Sidebar, TopBar, Layout
│   └── ui/          # Toast, Skeleton, Loading
├── constants/       # App constants, Nepal coordinates
├── context/         # AppContext (global state)
├── hooks/           # useNetworks custom hook
├── lib/             # auth.ts, data.ts, utils.ts
├── pages/           # All page components
└── types/           # TypeScript interfaces
```

## Seeded Nepal Locations

- Himalayan Java Coffee (Thamel)
- OR2K Restaurant (Thamel)
- Hotel Yak & Yeti (Durbar Marg)
- WorkHub Nepal (Baneshwor)
- Kaiser Library (Ranipokhari)
- Boudha Stupa Café
- Patan Museum Café
- Pokhara Lakeside Café
- Summit Hotel (Pokhara)
- Chitwan National Park Lodge
- And 5 more…

## Deployment

### Frontend (Vercel)
```bash
npm run build
# Deploy dist/ folder to Vercel
```

## API Documentation

All data operations are currently mocked via `localStorage`. For production:

- Replace `src/lib/data.ts` with real API calls
- Replace `src/lib/auth.ts` with real JWT/backend auth
- Backend: Node.js + Express + MySQL (schema below)

## MySQL Schema

See full schema at the bottom of this file for production deployment.

### Tables: users, locations, wifi_networks, verification_logs, reports, reviews
