# NUPCO Interactive Hub

A unified server hosting all NUPCO interactive projects and static pages.

## 🎯 Overview

This hub serves 5 different applications:

### Static Pages

- **First Day** (`/first-day`) - Welcome experience for new employees
- **Phishing Awareness** (`/phishing`) - Interactive phishing demonstration
- **Prize Wheel** (`/wheel`) - Interactive spinning wheel

### Interactive Applications (with Socket.IO)

- **Control Room** (`/control-room`) - Remote control system for presentations
- **Fact or Trick** (`/fact-or-trick`) - Cybersecurity quiz game

## 🚀 Quick Start

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Set up environment (optional)**

   ```bash
   cp .env.example .env
   # Edit .env if needed
   ```

3. **Start the server**

   ```bash
   npm start
   ```

4. **Access the hub**
   Open your browser to `http://localhost:3000`

## 📁 Project Structure

```
nupco/
├── server.js                    # Main hub server
├── package.json                 # Dependencies
├── npm-control-room/            # Control Room app
│   ├── server-module.js         # Modular server
│   └── public/                  # Frontend files
├── npm-fact-or-trick/           # Fact or Trick game
│   ├── server-module.js         # Modular server
│   └── public/                  # Frontend files
├── nupco-first-day/            # Static first day page
├── nupco-phising-main/         # Static phishing demo
├── nupco-wheel-main/           # Static wheel page
└── shared/                      # Shared assets (logos, CSS)
```

## 🌐 Routes

- `/` - Landing page with links to all apps
- `/first-day` - First day experience
- `/phishing` - Phishing awareness
- `/wheel` - Prize wheel
- `/control-room` - Control room display
- `/control-room/controller` - Control room controller
- `/fact-or-trick` - Fact or Trick host
- `/fact-or-trick/controller` - Fact or Trick player

## ⚙️ Environment Variables

- `PORT` - Server port (default: 3000)
- `BIND_HOST` - Server host (default: 0.0.0.0)
- `PUBLIC_URL` - Public URL for QR codes (optional)
- `NODE_ENV` - Environment (development/production)

## 🔧 Development

Run with auto-reload:

```bash
npm run dev
```

## 📝 Notes

- Each npm project runs on its own path with Socket.IO namespaces
- Static pages are served directly from their folders
- The main server handles all routing and websocket connections
- QR codes are generated dynamically for controller access
