# 🔧 Port Already in Use - Quick Fix Guide

## The Error

```
Error: listen EADDRINUSE: address already in use 0.0.0.0:3000
```

This means another process is already using port 3000.

## ✅ Solution 1: Wait and Retry (Easiest)

Sometimes the port is in TIME_WAIT state and will be released in a few seconds.

```bash
# Wait 3 seconds and try again
sleep 3 && npm start
```

**This is what we just did and it worked!** ✅

## Solution 2: Use a Different Port

Edit `.env` file and change the port:

```bash
PORT=3001  # or 3002, 8080, etc.
BIND_HOST=0.0.0.0
PUBLIC_URL=
NODE_ENV=development
```

Then restart:

```bash
npm start
```

## Solution 3: Find and Kill the Process (Windows)

### Step 1: Find what's using port 3000

```bash
netstat -ano | findstr :3000
```

Look for a line with `LISTENING` and note the PID (last column).

### Step 2: Kill the process

```bash
taskkill /PID <PID_NUMBER> /F
```

Example:

```bash
taskkill /PID 12345 /F
```

### Or kill all Node.js processes:

```bash
taskkill /IM node.exe /F
```

⚠️ **Warning**: This will kill ALL Node.js processes on your computer!

## Solution 4: Check for Running Terminals

1. Look at VS Code terminal tabs
2. Check if there's a terminal with a running `npm start`
3. Press `Ctrl+C` to stop it
4. Try starting again

## Solution 5: Restart VS Code

If nothing else works:

1. Close VS Code completely
2. Reopen it
3. Try `npm start` again

## 🎯 Current Status

✅ **Server is now running on port 3000**

Access at:

- Landing: http://localhost:3000/
- Control Room: http://localhost:3000/control-room
- Fact or Trick: http://localhost:3000/fact-or-trick
- Test Page: http://localhost:3000/test-sockets

## 📝 Prevention Tips

1. **Always stop the server cleanly**: Press `Ctrl+C` instead of closing the terminal
2. **Check before starting**: Make sure no other server is running
3. **Use different ports**: If testing multiple projects, use different ports
4. **Close terminals**: Don't leave terminals with running processes in the background

## 🆘 Still Having Issues?

If the port is still in use after trying all solutions:

1. **Check Docker/WSL**: If you have Docker or WSL running, they might be using the port
2. **Check other applications**: Some apps (Skype, web servers) use port 3000
3. **Restart your computer**: Last resort, but it works!

## 📞 Common Port Numbers

If port 3000 is always busy, try these alternatives in your `.env`:

- `PORT=3001` - Next available port
- `PORT=8080` - Common HTTP alternative
- `PORT=5000` - Another common choice
- `PORT=4000` - GraphQL default port

Just remember to update your URLs when accessing the app!
