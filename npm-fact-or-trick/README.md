# Fact or Trick (حقيقة أم خدعة)

A fast-paced, two-player, competitive cybersecurity quiz game inspired by Kahoot!. Players use their smartphones as controllers to answer "Fact" or "Trick" questions displayed on a main screen.

## 🎮 Game Features

- **Two-Player Competition**: Real-time head-to-head gameplay
- **QR Code Join System**: Players scan a QR code to join instantly
- **Speed-Based Scoring**: Correct answers are rewarded, with bonus points for faster responses
- **Cybersecurity Questions**: 15 educational true/false questions about cybersecurity
- **Real-Time Updates**: Instant feedback and live leaderboard using WebSockets
- **Responsive Design**: Mobile-optimized controller interface with large, tap-friendly buttons
- **Event Theme**: Matches the NUPCO event branding and style

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Start the Server**

   ```bash
   npm start
   ```

   For development with auto-reload:

   ```bash
   npm run dev
   ```

3. **Open the Host Screen**

   - Navigate to `http://localhost:3000` in your browser
   - This will display the main screen with a QR code

4. **Connect Players**

   - Each player scans the QR code with their smartphone
   - The controller interface opens in their mobile browser
   - Wait for both players to connect

5. **Start Playing**
   - Once both players are connected, click "ابدأ اللعبة" (Start Game)
   - Answer the questions as quickly as possible!

## 📱 How to Play

### For the Host (Main Screen):

1. Display the QR code for players to scan
2. Wait for 2 players to join
3. Click "Start Game" when ready
4. View questions, answers, and scores in real-time
5. See final results and winner at the end

### For Players (Mobile Controller):

1. Scan the QR code displayed on the main screen
2. Wait for the game to start
3. Read each question carefully
4. Tap "حقيقة" (Fact) or "خدعة" (Trick) as quickly as possible
5. View your results and score after each question
6. See final results and ranking at the end

## 🎯 Scoring System

- **Correct Answer**: Up to 1000 points
- **Speed Bonus**: Faster answers receive higher scores
- **Wrong Answer**: 0 points
- **No Answer**: 0 points

Points are calculated based on:

- 50% for correctness
- 50% for speed (proportional to response time)

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js
- **Real-Time Communication**: Socket.IO
- **QR Code Generation**: qrcode library
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Styling**: CSS Grid, Flexbox, Custom Properties

## 📂 Project Structure

```
fact-or-trick/
├── public/
│   ├── host.html          # Main display screen
│   ├── host.css           # Main screen styles
│   ├── host.js            # Main screen logic
│   ├── controller.html    # Mobile controller
│   ├── controller.css     # Mobile controller styles
│   ├── controller.js      # Mobile controller logic
│   ├── logo.svg           # NUPCO logo
│   ├── slogan.png         # Campaign slogan
│   └── bg-1080x1920.svg   # Background image
├── server.js              # Express & Socket.IO server
├── package.json           # Dependencies
└── README.md             # This file
```

## 🔧 Configuration

### Change Port

Edit `server.js` or set environment variable:

```bash
PORT=8080 npm start
```

### Change Number of Rounds

Edit `server.js`:

```javascript
totalRounds: 10; // Change this value
```

### Add/Edit Questions

**✨ New: Questions are now in a separate JSON file for easy editing!**

📝 **Questions File**: `questions.json`

📖 **Complete Guide**: Read [QUESTIONS_GUIDE.md](QUESTIONS_GUIDE.md) for:

- How to add new questions
- How to edit existing questions
- Tips and examples
- Troubleshooting

**Quick Example:**

```json
[
  {
    "question": "Your question here",
    "answer": "fact",
    "explanation": "Explanation here"
  }
]
```

The server automatically loads questions from `questions.json` on startup.

## 🌐 Deployment

### Quick Internet Access with Cloudflare Tunnel (Recommended!)

The **easiest way** to make your game accessible on the internet:

```bash
# Terminal 1: Start server
npm start

# Terminal 2: Create instant tunnel
cloudflared tunnel --url http://localhost:3000
```

You'll get a public URL like `https://random-name.trycloudflare.com` - share this URL and players worldwide can join!

**Windows Users:** Just double-click `start-with-tunnel.bat` and everything runs automatically!

📚 **Full Cloudflare Deployment Guide:** See [CLOUDFLARE_DEPLOYMENT.md](CLOUDFLARE_DEPLOYMENT.md) for detailed instructions including:

- Cloudflare Tunnel setup (5 minutes)
- VPS deployment with Cloudflare CDN
- Custom domain configuration
- Troubleshooting guide

### Local Network

1. Find your local IP address:

   ```bash
   # Windows
   ipconfig

   # Mac/Linux
   ifconfig
   ```

2. Start the server and access from other devices:
   ```
   http://YOUR_IP:3000
   ```

### Production Deployment

- **Cloudflare Tunnel:** Free, instant, no configuration needed
- **VPS Options:** DigitalOcean ($6/mo), AWS, Linode
- Set `PUBLIC_URL` environment variable for correct QR codes
- Configure `NODE_ENV=production`

## 🎨 Customization

### Theme Colors

Edit CSS custom properties in `host.css` and `controller.css`:

```css
:root {
  --bg: #1c2346;
  --accent: #e06e0e;
  --accent-2: #e3151c;
  /* ... */
}
```

### Branding

Replace the logo and background files in the `public/` folder:

- `logo.svg`
- `slogan.png`
- `bg-1080x1920.svg`

## 📝 Game Flow

1. **Initialization**: Host opens main screen, QR code is generated
2. **Player Join**: 2 players scan QR code and connect
3. **Game Start**: Host clicks start, game begins
4. **Question Loop** (10 rounds):
   - Question displayed for 10 seconds
   - Players submit answers on their phones
   - Results shown with correct answer, player responses, and scores
   - 5-second delay before next question
5. **Game End**: Final scores and winner displayed
6. **New Game**: Host can start a new game with fresh QR code

## 🐛 Troubleshooting

### QR Code Not Generating

- Check console for errors
- Ensure `qrcode` package is installed
- Verify network connectivity

### Players Can't Connect

- Check firewall settings
- Ensure devices are on the same network (for local deployment)
- Verify the server is running

### Answers Not Registering

- Check browser console for Socket.IO errors
- Ensure stable internet connection
- Try refreshing the controller page

## 📄 License

MIT License - Feel free to use and modify for your events!

## 🤝 Credits

Developed for NUPCO cybersecurity awareness campaign.
