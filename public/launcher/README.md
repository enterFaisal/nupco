# 🎮 NUPCO Event Launcher Dashboard

A centralized control panel for managing and launching all NUPCO event activities from a single interface.

## 🌟 Features

- **One-Click Launch**: Start any activity with a single click
- **Multiple Display Modes**:
  - Fullscreen mode for presentations
  - New window for side-by-side operation
  - New tab for quick access
- **Professional Interface**: Clean, modern design with NUPCO branding
- **Real-Time Status**: Track which activities are currently running
- **Keyboard Shortcuts**: Quick launch with Ctrl+1-5
- **Responsive Design**: Works on laptops, tablets, and desktops
- **Bilingual Support**: Arabic (RTL) and English interface

## 📂 Access

Navigate to: `http://localhost:3000/launcher`

## 🎯 Available Activities

1. **🎡 عجلة التوعية** (Awareness Wheel)

   - Shortcut: `Ctrl+1`
   - Type: Static
   - Path: `/wheel`

2. **🎣 صيد التصيد** (Phishing Hunt)

   - Shortcut: `Ctrl+2`
   - Type: Static
   - Path: `/phishing`

3. **🎮 حقيقة أم خدعة** (Fact or Trick)

   - Shortcut: `Ctrl+3`
   - Type: Interactive
   - Path: `/fact-or-trick`

4. **👋 اليوم الأول** (The First Day)

   - Shortcut: `Ctrl+4`
   - Type: Static
   - Path: `/first-day`

5. **🎛️ غرفة التحكم** (Control Room)
   - Shortcut: `Ctrl+5`
   - Type: Interactive
   - Path: `/control-room`

## 🚀 How to Use

### Basic Usage

1. Open the launcher dashboard in your browser
2. Click on any activity card to launch it
3. Choose your preferred display mode:
   - **Fullscreen**: Best for main event display
   - **New Window**: For multi-monitor setups
   - **New Tab**: Quick access mode

### Keyboard Shortcuts

- `Ctrl+1` through `Ctrl+5`: Quick launch activities
- `F1`: Show help
- `ESC`: Close modal dialogs

### Managing Activities

- The status bar shows currently running activities
- Click activities again to launch multiple instances
- Close activity windows/tabs normally to return to launcher
- The launcher tracks all open activities automatically

## 🛠️ Technical Details

### Structure

```
public/launcher/
├── index.html      # Main launcher page
├── launcher.css    # Styling and branding
└── launcher.js     # Launch functionality
```

### Features Implementation

- **Fullscreen API**: Modern browser fullscreen support
- **Window Management**: Track and monitor launched activities
- **State Persistence**: Real-time status updates
- **Modal System**: Clean launch options interface

### Browser Compatibility

- Chrome/Edge: Full support ✅
- Firefox: Full support ✅
- Safari: Full support ✅
- Opera: Full support ✅

**Note**: Popup blockers must allow popups for this domain.

## 🎨 Customization

### Colors

The launcher uses NUPCO brand colors defined in CSS variables:

- Primary: `#1c2346`
- Accent Orange: `#e06e0e`
- Accent Red: `#e3151c`
- Success: `#4caf50`

### Icons

Activity icons are Unicode emojis and can be changed in `index.html`.

### Layout

The grid automatically adapts to screen size:

- Desktop: 5 columns
- Tablet: 2-3 columns
- Mobile: 1 column

## 🎯 Best Practices

### For Events

1. **Pre-Event Setup**:

   - Open launcher 15 minutes before event
   - Test each activity launch
   - Verify popup permissions
   - Check display settings

2. **During Event**:

   - Keep launcher open for quick switching
   - Use fullscreen mode for presentations
   - Monitor status bar for activity tracking

3. **Post-Event**:
   - Close all activity windows
   - Refresh launcher for next session

### For Multi-Display Setup

1. Open launcher on control monitor
2. Launch activities in fullscreen on presentation display
3. Use window mode for activities you want to monitor
4. Keep launcher visible for easy switching

## 🔧 Troubleshooting

### Activities Won't Launch

**Problem**: Clicking cards does nothing
**Solution**:

- Check popup blocker settings
- Allow popups for this site
- Check browser console for errors

### Fullscreen Not Working

**Problem**: Activities open but don't go fullscreen
**Solution**:

- Try manual fullscreen with F11
- Check browser fullscreen permissions
- Use window mode as alternative

### Status Not Updating

**Problem**: Status bar shows wrong information
**Solution**:

- Refresh the launcher page
- Close orphaned activity windows
- Check browser console

## 💡 Console Commands

For debugging and advanced control, use:

```javascript
// Check current status
NUPCOLauncher.status();

// Show help
NUPCOLauncher.showHelp();

// Quick launch an activity
NUPCOLauncher.quickLaunch("/wheel", "Wheel");
```

## 📱 Mobile/Tablet Usage

While optimized for desktop, the launcher works on tablets:

- Touch-friendly buttons
- Responsive layout
- Simplified navigation
- Status tracking

**Note**: Fullscreen mode may behave differently on mobile browsers.

## 🔐 Security Notes

- All activities launch within the same origin
- No external dependencies required
- Local storage not used (stateless)
- Window references cleared on close

## 🎓 Training Guide

### For Event Staff

1. **Familiarization** (5 minutes):

   - Open launcher and explore interface
   - Practice clicking activity cards
   - Try different launch modes

2. **Practice Session** (10 minutes):

   - Launch each activity once
   - Test keyboard shortcuts
   - Navigate between activities

3. **Event Simulation** (15 minutes):
   - Run through event flow
   - Practice switching activities
   - Test multi-display setup

## 📊 Activity Types

### Static Activities

- Pre-built, no server interaction
- Can be launched multiple times
- Independent instances
- Examples: Wheel, Phishing, First Day

### Interactive Activities

- Real-time server communication
- Socket.IO based
- Multiplayer support
- Examples: Fact or Trick, Control Room

## 🌐 Network Requirements

- Local network access for multiplayer activities
- Internet connection for external resources
- Port 3000 accessible (default)
- WebSocket support for interactive features

## 📈 Performance Tips

1. **For Smooth Operation**:

   - Close unused activity windows
   - Use one activity at a time for presentations
   - Keep launcher open in background

2. **For Multiple Activities**:
   - Use window mode for monitoring
   - Arrange windows on different displays
   - Track via status bar

## 🎨 Event Setup Example

### Single Display Setup

```
1. Open launcher
2. Launch activity in fullscreen
3. Present to audience
4. Close when done
5. Launch next activity
```

### Multi-Display Setup

```
1. Control Monitor: Keep launcher open
2. Display 1: Launch main activity (fullscreen)
3. Display 2: Launch supporting activity (window)
4. Switch as needed using launcher
```

## 📞 Support

For issues or questions:

1. Check this README
2. Review console for errors
3. Test in different browser
4. Check network connectivity

## 🔄 Updates

The launcher integrates seamlessly with NUPCO Hub:

- Automatically includes new activities
- Updates reflected immediately
- No configuration required

## ✨ Future Enhancements

Potential improvements:

- Activity thumbnails/previews
- Launch history
- Scheduled launches
- Activity presets
- Remote control API

---

**Built with ❤️ for NUPCO Events**

_Last Updated: October 2025_
