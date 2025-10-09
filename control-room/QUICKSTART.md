# Quick Start Guide - The Control Room

## 🚀 Get Started in 3 Minutes

### Step 1: Install & Setup (1 minute)

```bash
cd control-room
npm install
```

### Step 2: Add Your Videos (1 minute)

Place your video files in `public/videos/`:

- `part1.mp4` - First video segment
- `part2.mp4` - Second video segment

### Step 3: Start the Server (30 seconds)

```bash
npm start
```

You'll see:

```
🎮 Control Room Server running on port 3000
🌐 Local access:
   Display: http://localhost:3000/
   Controller: http://localhost:3000/controller
✅ Ready to accept connections!
```

### Step 4: Open Display (30 seconds)

On the presentation computer:

1. Open browser
2. Go to: `http://localhost:3000/`
3. Click to enable fullscreen
4. You'll see the QR code and standby screen

### Step 5: Connect Controller (30 seconds)

On your mobile device:

1. Scan the QR code from the display, OR
2. Go to: `http://[computer-ip]:3000/controller`
3. Wait for "متصل" (Connected) status
4. Buttons will become active

### Step 6: Present! ✨

Tap the large buttons to control your presentation:

- 🎬 Play Video Part 1
- 🎬 Play Video Part 2
- ⏹️ Stop Video
- 🚨 Play Alarm

---

## 🔍 Finding Your Computer's IP Address

### On Windows:

```bash
ipconfig
```

Look for "IPv4 Address" (e.g., 192.168.1.100)

### On Mac/Linux:

```bash
ifconfig
```

Look for "inet" under your active connection

Then use: `http://192.168.1.100:3000/controller`

---

## ⚡ Quick Tips

✅ **Same Network**: Both devices must be on the same WiFi  
✅ **Fullscreen**: Click display page for fullscreen mode  
✅ **Multiple Controllers**: You can use multiple phones  
✅ **Keyboard Shortcuts**: Press 1, 2, S, A on display for testing  
✅ **Auto-stops**: Alarm stops automatically after 10 seconds

---

## 🆘 Quick Fixes

**Can't connect?**

- Check firewall settings
- Ensure both devices on same WiFi
- Try refreshing controller page

**No video?**

- Check file names: `part1.mp4` and `part2.mp4`
- Verify files are in `public/videos/` folder

**No sound?**

- Check system volume
- Ensure alarm.mp3 path is correct

---

## 📞 Need More Help?

See the full [README.md](README.md) for detailed documentation.

**Happy Presenting! 🎉**
