# NUPCO Hub - Quick Start Guide

## ✅ Setup Complete!

Your NUPCO Interactive Hub is now configured and ready to use. All 5 pages now run on a single server with their own paths.

## 🌐 Access URLs

When you run `npm start` in the main `/nupco` folder, you can access:

### Landing Page

- **URL**: `http://localhost:3000/`
- **Description**: Main hub with links to all applications

### Static Pages

1. **First Day Experience**

   - **URL**: `http://localhost:3000/first-day`
   - **Type**: Static HTML page

2. **Phishing Awareness**

   - **URL**: `http://localhost:3000/phishing`
   - **Type**: Static HTML page

3. **Prize Wheel**
   - **URL**: `http://localhost:3000/wheel`
   - **Type**: Static HTML page

### Interactive Applications (Socket.IO)

4. **Control Room**

   - **Display URL**: `http://localhost:3000/control-room`
   - **Controller URL**: `http://localhost:3000/control-room/controller`
   - **Type**: Real-time WebSocket app

5. **Fact or Trick Game**
   - **Host URL**: `http://localhost:3000/fact-or-trick`
   - **Player URL**: `http://localhost:3000/fact-or-trick/controller`
   - **Type**: Real-time WebSocket game

## 🚀 Running the Server

```bash
# Navigate to the main folder
cd /c/Users/faisa/Desktop/Projects/nupco

# Install dependencies (first time only)
npm install

# Start the server
npm start

# Or run with auto-reload during development
npm run dev
```

## 📦 What Changed?

### Before

- Each npm project ran on port 3000 (conflict!)
- Static pages had no server
- Had to run multiple servers

### After

- ✅ Single server on port 3000
- ✅ All pages accessible via unique paths
- ✅ No port conflicts
- ✅ Easy to deploy
- ✅ Shared resources (logos, CSS)

## 🏗️ Architecture

```
Main Server (port 3000)
├── /                          → Landing page
├── /first-day                 → Static files
├── /phishing                  → Static files
├── /wheel                     → Static files
├── /control-room              → Express app + Socket.IO namespace
│   └── /controller
└── /fact-or-trick             → Express app + Socket.IO namespace
    └── /controller
```

## 🔧 Configuration

Edit the `.env` file in the main `/nupco` folder:

```env
PORT=3000                    # Server port
BIND_HOST=0.0.0.0           # Bind to all interfaces
PUBLIC_URL=                 # Your public URL (for production)
NODE_ENV=development        # Environment mode
```

## 🌍 Deployment

When deploying to production:

1. Set `PUBLIC_URL` in `.env`:

   ```env
   PUBLIC_URL=https://your-domain.com
   NODE_ENV=production
   ```

2. QR codes will automatically use the public URL

3. All paths remain the same:
   - `https://your-domain.com/first-day`
   - `https://your-domain.com/control-room`
   - etc.

## 📱 Testing

1. Start the server: `npm start`
2. Open `http://localhost:3000` in your browser
3. Click on any application link
4. Each should load on its own path!

## 🐛 Troubleshooting

**Port already in use?**

```bash
# Change the port in .env
PORT=3001
```

**Can't access from other devices?**

```bash
# Make sure BIND_HOST is set to 0.0.0.0
BIND_HOST=0.0.0.0
```

**QR codes not working?**

```bash
# Set your public URL in .env
PUBLIC_URL=http://your-ip:3000
```

## 📝 Notes

- Socket.IO uses namespaces (`/control-room` and `/fact-or-trick`)
- Each app maintains its own state independently
- Shared assets are in the `/shared` folder
- Original standalone servers are preserved in each npm folder
