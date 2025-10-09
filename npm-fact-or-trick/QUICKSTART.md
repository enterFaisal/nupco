# 🎮 Fact or Trick - Quick Start Guide

## ✅ Installation Complete!

Your "Fact or Trick" game is now ready to play!

## 🚀 How to Start the Game

### 1. Start the Server

Open a terminal in the `fact-or-trick` folder and run:

```bash
npm start
```

You should see:

```
🎮 Fact or Trick server running on port 3000
🌐 Open http://localhost:3000 to start the host screen
```

### 2. Open the Host Screen

- Open a web browser (Chrome, Firefox, or Edge recommended)
- Navigate to: `http://localhost:3000`
- You'll see the waiting screen with a QR code

### 3. Connect Players

- **Player 1**: Scan the QR code with their smartphone
- **Player 2**: Scan the same QR code with their smartphone
- Both players will see "متصل بنجاح!" (Connected successfully!)
- The host screen will show both players as connected

### 4. Start the Game

- On the host screen, click the "ابدأ اللعبة" (Start Game) button
- The game will begin after a 2-second countdown

### 5. Play!

- Players answer "حقيقة" (Fact) or "خدعة" (Trick) on their phones
- Results appear on the main screen after each question
- The game continues for 10 rounds
- Winner is announced at the end!

## 📱 Testing Locally (Same Device)

If you want to test on the same computer before using multiple devices:

1. Start the server: `npm start`
2. Open the host in one browser window: `http://localhost:3000`
3. Open controller in another window: `http://localhost:3000/controller?room=XXXXXX`
   - Replace `XXXXXX` with the room code shown on the host screen
4. Open a third window for player 2 with the same URL
5. Click "Start Game" on the host screen

## 🌐 Playing on Multiple Devices (Same Network)

### Find Your Computer's IP Address:

**Windows:**

```bash
ipconfig
```

Look for "IPv4 Address" (e.g., 192.168.1.100)

**Mac/Linux:**

```bash
ifconfig
```

Look for "inet" address (e.g., 192.168.1.100)

### Connect:

1. On your computer, start the server: `npm start`
2. On your computer, open: `http://localhost:3000`
3. On player smartphones (connected to same WiFi):
   - Scan the QR code OR
   - Manually go to: `http://YOUR_IP:3000/controller?room=XXXXXX`

## 🎯 Game Rules

- **10 Questions** total
- **10 Seconds** per question
- **Points System:**
  - Correct answer: Up to 1000 points
  - Speed bonus: Faster = more points
  - Wrong answer: 0 points

## 🎨 Customization Options

### Change Number of Questions

Edit `server.js`, line 21:

```javascript
totalRounds: 10,  // Change to 5, 15, 20, etc.
```

### Add Your Own Questions

Edit `server.js`, find the `questionsDatabase` array and add:

```javascript
{
  question: "Your question here in Arabic",
  answer: "fact", // or "trick"
  explanation: "Explanation for the answer"
}
```

### Change Colors/Theme

Edit `public/host.css` and `public/controller.css`:

```css
:root {
  --bg: #1c2346; /* Background color */
  --accent: #e06e0e; /* Orange accent */
  --accent-2: #e3151c; /* Red accent */
}
```

## 🐛 Troubleshooting

### "Cannot GET /"

- Make sure the server is running (`npm start`)
- Check that you're using the correct URL

### Players Can't Connect

- Ensure all devices are on the same WiFi network
- Check your firewall isn't blocking port 3000
- Try using your computer's IP address instead of localhost

### QR Code Not Showing

- Check browser console for errors (Press F12)
- Refresh the page
- Make sure the QR code library loaded

### Game Not Starting

- Ensure exactly 2 players are connected
- Check browser console for Socket.IO errors
- Try refreshing all pages

## 📞 Support

If you encounter issues:

1. Check the browser console (F12) for error messages
2. Check the server terminal for error logs
3. Restart the server and refresh all browser windows
4. Make sure all dependencies are installed: `npm install`

## 🎉 Enjoy the Game!

Have fun learning about cybersecurity with "Fact or Trick"!

---

**Project Location:** `c:\Users\faisa\Desktop\Projects\nupco\fact-or-trick\`

**Key Files:**

- `server.js` - Main server and game logic
- `public/host.html` - Main display screen
- `public/controller.html` - Mobile controller
- `README.md` - Full documentation
