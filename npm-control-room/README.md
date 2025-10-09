# The Control Room (غرفة السيطرة)

A real-time remote control system for managing video presentations and sound effects. Built for NUPCO cybersecurity awareness events, this tool allows organizers to control a main display presentation from their smartphone using WebSocket technology.

![Control Room](https://img.shields.io/badge/Status-Ready-brightgreen) ![WebSocket](https://img.shields.io/badge/Tech-WebSocket-blue) ![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)

## 📋 Overview

**The Control Room** is a presenter's tool that provides instant remote control over video and audio playback on a main screen. Perfect for creating dramatic, controlled storytelling experiences about cybersecurity scenarios.

### Features

✅ **Real-time Control**: Instant command execution via WebSocket  
✅ **Mobile-First**: Optimized controller interface for smartphones  
✅ **Multiple Controllers**: Support for multiple devices controlling the same display  
✅ **Visual Feedback**: Immediate confirmation of actions  
✅ **QR Code Access**: Easy controller access via QR code  
✅ **NUPCO Themed**: Consistent branding with other activities

## 🎮 Components

### 1. Display (Main Screen)

- Full-screen video player
- Audio playback for sound effects
- Receives and executes commands from controllers
- Shows QR code for easy controller access

### 2. Controller (Mobile)

- 4 large, clear control buttons:
  - ▶️ Play Video - Part 1
  - ▶️ Play Video - Part 2
  - ⏹️ Stop Video
  - 🚨 Play Alarm Sound
- Connection status indicator
- Real-time feedback

### 3. Server

- Node.js with Express
- Socket.IO for WebSocket communication
- QR code generation
- Multi-client support

## 🚀 Quick Start

### Prerequisites

- Node.js 14+ and npm
- Same network connection for display and controller devices

### Installation

1. **Navigate to the project directory:**

   ```bash
   cd control-room
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Add your video files:**

   - Place your videos in `public/videos/`
   - Name them `part1.mp4` and `part2.mp4`
   - Or update paths in `public/display.js`

4. **Create environment file (optional):**
   ```bash
   cp .env.example .env
   ```

### Running the Application

1. **Start the server:**

   ```bash
   npm start
   ```

   Or for development with auto-reload:

   ```bash
   npm run dev
   ```

2. **Open the display (on presentation computer):**

   - Navigate to: `http://localhost:3000/`
   - Click to enable fullscreen
   - Display will show QR code and standby screen

3. **Open the controller (on mobile):**

   - Scan the QR code, or
   - Navigate to: `http://localhost:3000/controller`
   - Wait for connection confirmation

4. **Start presenting:**
   - Use the large buttons to control the presentation
   - Press buttons for immediate action
   - Visual and haptic feedback confirms commands

## 📱 Usage Instructions

### For the Organizer:

1. **Setup Phase:**

   - Start the server on the presentation computer
   - Connect the computer to the main screen/projector
   - Open the display page in fullscreen mode
   - Ensure mobile device is on the same network

2. **Controller Access:**

   - Scan QR code from the display, or
   - Manually enter the controller URL
   - Wait for "متصل" (Connected) status

3. **During Presentation:**
   - Tap buttons to control the presentation
   - Buttons work instantly
   - Multiple controllers can be used simultaneously
   - Each action provides immediate feedback

### Button Functions:

- **Play Video - Part 1**: Plays the first segment of your presentation video
- **Play Video - Part 2**: Plays the second segment of your presentation video
- **Stop Video**: Immediately stops any playing video and returns to standby
- **Play Alarm**: Plays the alarm sound effect (loops for 10 seconds)

## 🔧 Configuration

### Video Paths

Edit `public/display.js` to customize video locations:

```javascript
const VIDEO_PATHS = {
  "play-video-1": "videos/part1.mp4",
  "play-video-2": "videos/part2.mp4",
};
```

### Port Configuration

Edit `.env` file:

```env
PORT=3000
BIND_HOST=0.0.0.0
```

### Network Setup

#### Local Network (Same WiFi)

- Default setup works out of the box
- Display: `http://[computer-ip]:3000/`
- Controller: `http://[computer-ip]:3000/controller`

#### Remote Access (Cloudflare Tunnel)

```bash
npm run tunnel
```

Then set in `.env`:

```env
PUBLIC_URL=https://your-tunnel-url.com
```

## 🎨 Customization

### Adding More Buttons

1. **Add button in `controller.html`:**

   ```html
   <button class="control-btn" id="newActionBtn" disabled>
     <span class="btn-icon">🎬</span>
     <span>New Action</span>
   </button>
   ```

2. **Add handler in `controller.js`:**

   ```javascript
   document.getElementById("newActionBtn").addEventListener("click", () => {
     sendCommand("new-action");
   });
   ```

3. **Add case in `display.js`:**
   ```javascript
   case "new-action":
     // Your custom action
     break;
   ```

### Styling

All styles follow the NUPCO theme defined in `shared/shared.css`:

- Primary: `#1c2346` (navy)
- Accent: `#e06e0e` (orange)
- Alert: `#e3151c` (red)

## 🐛 Troubleshooting

### Controller Not Connecting

- ✅ Check both devices are on same network
- ✅ Verify server is running
- ✅ Check firewall settings
- ✅ Try refreshing the controller page

### Video Not Playing

- ✅ Verify video files exist in `public/videos/`
- ✅ Check file names match configuration
- ✅ Ensure videos are in MP4 format
- ✅ Check browser console for errors

### No Sound

- ✅ Check system volume
- ✅ Verify alarm.mp3 path is correct
- ✅ Ensure browser has audio permissions

### Buttons Disabled

- ✅ Wait for connection status to show "متصل"
- ✅ Ensure display page is open and connected
- ✅ Check server logs for connection errors

## 🔑 Keyboard Shortcuts (Display)

For testing and debugging on the display:

- `1` - Play Video Part 1
- `2` - Play Video Part 2
- `S` - Stop Video
- `A` - Play Alarm
- `ESC` - Stop All

## 📂 Project Structure

```
control-room/
├── server.js              # WebSocket server
├── package.json           # Dependencies
├── .env.example           # Environment template
├── public/
│   ├── display.html       # Main screen interface
│   ├── display.js         # Display logic
│   ├── controller.html    # Mobile controller interface
│   ├── controller.js      # Controller logic
│   └── videos/
│       ├── part1.mp4      # Your video files (add these)
│       └── part2.mp4
└── README.md             # This file
```

## 🔒 Security Notes

- This is an internal tool for event organizers
- Should only be used on trusted local networks
- Consider using authentication for public networks
- Keep server logs to monitor access

## 🌐 Network Requirements

- **Local Network**: Devices on same WiFi
- **Firewall**: Allow port 3000 (or your chosen port)
- **Bandwidth**: Minimal (commands are tiny JSON messages)

## 📖 Technical Details

### Technology Stack

- **Backend**: Node.js, Express, Socket.IO
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Communication**: WebSocket (Socket.IO)
- **Theme**: NUPCO branded styles

### WebSocket Events

**Controller → Server:**

- `controller:register` - Register controller
- `control:command` - Send control command

**Display → Server:**

- `display:register` - Register display
- `display:status` - Send status update

**Server → Clients:**

- `control:execute` - Execute command (to displays)
- `control:confirmed` - Confirm command (to controller)
- `display:feedback` - Display status (to controllers)

## 🎯 Use Cases

1. **Cyber Attack Simulation**: Control video segments showing attack progression
2. **Training Presentations**: Orchestrate educational content
3. **Interactive Storytelling**: Create dramatic narrative experiences
4. **Event Management**: Control presentation flow remotely
5. **Emergency Drills**: Trigger alarms and scenarios

## 📝 License

MIT License - Free to use and modify for your organization's needs.

## 🤝 Support

For issues or questions about this tool, check the server logs and browser console for detailed error messages.

## 📚 Related Activities

This is part of the NUPCO Cybersecurity Awareness Campaign:

- **The First Day**: Phishing awareness with QR codes
- **Wheel of Security**: Interactive quiz game
- **Fact or Trick**: Fast-paced multiplayer quiz
- **The Control Room**: This presentation tool

---

**Built for NUPCO Cybersecurity Awareness Campaign**  
_Empowering presenters to create impactful educational experiences_
