# The Control Room - Organizer's Guide

## 🎯 What Is This?

**The Control Room** is your smartphone remote control for managing video presentations and sound effects on the main screen. Think of it as a TV remote for your presentation computer.

---

## 📱 What You Can Control

### Four Simple Buttons:

1. **▶️ Play Video - Part 1**  
   Starts playing the first segment of your presentation video

2. **▶️ Play Video - Part 2**  
   Starts playing the second segment of your presentation video

3. **⏹️ Stop Video**  
   Immediately stops any playing video

4. **🚨 Play Alarm Sound**  
   Plays a siren/alarm sound effect (loops for 10 seconds)

---

## 🎪 Setup on Event Day

### Before the Event:

1. **Prepare Your Videos:**

   - Create/obtain two video segments for your presentation
   - Name them `part1.mp4` and `part2.mp4`
   - Place in the `public/videos/` folder

2. **Test Everything:**
   - Start the server
   - Open display on presentation computer
   - Connect controller from your phone
   - Test all buttons

### During Setup:

1. **Connect presentation computer to main screen/projector**

2. **Start the server:**

   ```bash
   cd control-room
   npm start
   ```

3. **Open display page** (on presentation computer):

   - Navigate to: `http://localhost:3000/`
   - Click anywhere to go fullscreen
   - Leave this running

4. **Connect your phone** (controller):
   - Scan the QR code shown on the display, OR
   - Go to: `http://[computer-ip]:3000/controller`
   - Wait for "متصل" (Connected) message
   - Keep your phone nearby

---

## 🎬 During the Presentation

### Your Workflow:

1. **Start with Standby:**
   - Display shows NUPCO logo and "waiting for commands"
2. **Play First Segment:**

   - Tap "Play Video - Part 1"
   - Video starts immediately
   - Standby screen disappears

3. **Create Drama:**

   - Tap "Play Alarm" to add tension
   - Use at dramatic moments

4. **Play Second Segment:**

   - Tap "Play Video - Part 2"
   - Previous video stops automatically
   - New video starts immediately

5. **Return to Standby:**
   - Tap "Stop Video" when done
   - Returns to standby screen

### Presentation Tips:

✅ **Practice the flow** - Test the timing of your button presses  
✅ **Keep phone awake** - The app prevents sleep, but check battery  
✅ **Have backup** - Know the keyboard shortcuts (1, 2, S, A, ESC)  
✅ **Multiple controllers** - A colleague can help with a second phone  
✅ **Watch the screen** - Confirm actions happen immediately

---

## 🔧 Technical Setup

### Network Requirements:

- Both devices on **same WiFi network**
- Firewall allows port 3000
- Stable connection (commands are tiny, but connectivity matters)

### Equipment Needed:

- Presentation computer (connected to main screen)
- Your smartphone (any modern device)
- Same WiFi network for both

### What Participants See:

Participants only see the **main screen**. They don't see your controller or know you're controlling remotely. It looks like a seamless presentation!

---

## 💡 Creative Usage Ideas

### 1. Cyber Attack Simulation

- **Part 1**: Normal operations
- **Alarm**: Attack detected!
- **Part 2**: Incident response

### 2. Before & After

- **Part 1**: Vulnerable system
- **Part 2**: After implementing security

### 3. Scenario-Based Training

- **Part 1**: Problem scenario
- **Alarm**: Critical alert
- **Part 2**: Solution demonstration

### 4. Interactive Story

- Control the pace of your narrative
- Add drama with alarm at key moments
- Stop and discuss between segments

---

## 🆘 Common Issues & Solutions

### "Buttons are disabled"

**Solution:** Wait for connection status to show "متصل" (Connected). If it doesn't connect, check that both devices are on same WiFi.

### "No video plays"

**Solution:** Check that video files are named correctly (`part1.mp4`, `part2.mp4`) and placed in `public/videos/` folder.

### "Controller disconnected"

**Solution:** Refresh the controller page on your phone. The display keeps running.

### "Can't access from phone"

**Solution:**

1. Make sure your phone is on same WiFi
2. Find computer's IP address (see QUICKSTART.md)
3. Use: `http://[computer-ip]:3000/controller`

### "Firewall blocking"

**Solution:** Allow Node.js through Windows Firewall, or temporarily disable firewall for testing.

---

## 📊 Status Indicators

### On Controller (Your Phone):

- **غير متصل (Red)** = Not connected, check network
- **جاري الاتصال... (Yellow)** = Connecting, please wait
- **متصل (Green)** = Connected, ready to use!

### On Display (Main Screen):

- **غير متصل (Red dot)** = Server connection lost
- **متصل (Green dot)** = Connected and ready

---

## 🎓 Best Practices

### Before Event:

1. ✅ Test on actual presentation equipment
2. ✅ Verify video quality on main screen
3. ✅ Test from your actual smartphone
4. ✅ Have video files backed up
5. ✅ Know the keyboard shortcuts as backup

### During Event:

1. ✅ Keep phone charged (>50% battery)
2. ✅ Keep server computer awake
3. ✅ Stay on same WiFi network
4. ✅ Have notes for button timing
5. ✅ Watch audience, not just screen

### After Event:

1. ✅ Close display gracefully (ESC key)
2. ✅ Stop server (Ctrl+C)
3. ✅ Save logs if needed for review

---

## 🔐 Privacy & Security

- ✅ This is an **organizer-only tool** (not public-facing)
- ✅ Use on **trusted networks only**
- ✅ Server logs all commands for review
- ✅ No participant data is collected
- ✅ Videos stay on your computer

---

## 📞 Support Resources

### Quick Reference:

- **Full Documentation**: See `README.md`
- **Quick Setup**: See `QUICKSTART.md`
- **Video Setup**: See `public/videos/README.md`

### Troubleshooting:

1. Check server terminal for error messages
2. Check browser console (F12) for errors
3. Verify network connection
4. Try keyboard shortcuts on display
5. Restart server if needed

---

## 🌟 Success Checklist

Before going live, confirm:

- [ ] Server is running without errors
- [ ] Display page is open and fullscreen
- [ ] Controller page shows "متصل" (Connected)
- [ ] All 4 buttons are clickable (not disabled)
- [ ] Test video 1 plays correctly
- [ ] Test video 2 plays correctly
- [ ] Stop button works
- [ ] Alarm sound plays
- [ ] QR code is visible on display
- [ ] Phone battery >50%
- [ ] Backup plan ready

---

## 🎉 You're Ready!

You now have a professional remote control system for your cybersecurity presentations. The system is:

- ⚡ **Instant** - Commands execute immediately
- 🎯 **Simple** - Just 4 large buttons
- 🔒 **Reliable** - Works offline on local network
- 📱 **Mobile** - Control from anywhere in the room
- 🎨 **Branded** - Matches NUPCO theme

**Break a leg! Your presentation will be amazing!** 🌟

---

_Part of the NUPCO Cybersecurity Awareness Campaign_
