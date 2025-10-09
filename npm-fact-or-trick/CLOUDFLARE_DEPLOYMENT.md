# 🌐 Cloudflare Deployment Guide - حقيقة أم خدعة

This guide provides **three different methods** to deploy your "Fact or Trick" game using Cloudflare services.

## 📋 Table of Contents

1. [Method 1: Cloudflare Tunnel (Easiest - Recommended)](#method-1-cloudflare-tunnel-easiest)
2. [Method 2: Traditional VPS with Cloudflare CDN](#method-2-traditional-vps-with-cloudflare-cdn)
3. [Method 3: Cloudflare Workers (Advanced)](#method-3-cloudflare-workers-advanced)

---

## Method 1: Cloudflare Tunnel (Easiest - Recommended) ⭐

Cloudflare Tunnel allows you to expose your local server to the internet **without opening ports** or configuring complex networking. Perfect for events and temporary deployments!

## Method 2: Traditional VPS with Cloudflare CDN

Deploy on a cloud server and use Cloudflare for DNS and CDN.

### Prerequisites

- A VPS/Cloud server (DigitalOcean, AWS, Linode, etc.)
- A domain name
- Domain DNS pointed to Cloudflare

### Step 1: Set Up Your Server

#### 1.1: Choose a Cloud Provider

- **DigitalOcean:** $6/month droplet (easiest)
- **AWS EC2:** Free tier available
- **Linode:** $5/month
- **Vultr:** $2.50/month

#### 1.2: Create Ubuntu Server

- Ubuntu 22.04 LTS recommended
- Minimum: 1GB RAM, 1 CPU

#### 1.3: Connect via SSH

```bash
ssh root@YOUR_SERVER_IP
```

### Step 2: Install Node.js on Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version

# Install PM2 (process manager)
sudo npm install -g pm2
```

### Step 3: Upload Your Application

#### Option A: Using Git (Recommended)

```bash
# On your server
cd /var/www
sudo git clone YOUR_GITHUB_REPO_URL fact-or-trick
cd fact-or-trick
sudo npm install
```

#### Option B: Using SCP

```bash
# On your local machine
cd /c/Users/faisa/Desktop/Projects/nupco
scp -r fact-or-trick root@YOUR_SERVER_IP:/var/www/
```

### Step 4: Configure Environment

On your server:

```bash
cd /var/www/fact-or-trick
sudo nano .env
```

Add:

```env
PORT=3000
BIND_HOST=0.0.0.0
PUBLIC_URL=https://fact-or-trick.yourdomain.com
NODE_ENV=production
```

### Step 5: Start with PM2

```bash
# Start the application
pm2 start server.js --name fact-or-trick

# Make it start on boot
pm2 startup
pm2 save

# View logs
pm2 logs fact-or-trick

# Other useful commands
pm2 restart fact-or-trick
pm2 stop fact-or-trick
pm2 status
```

### Step 6: Configure Nginx (Reverse Proxy)

```bash
# Install Nginx
sudo apt install -y nginx

# Create config file
sudo nano /etc/nginx/sites-available/fact-or-trick
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name fact-or-trick.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket support for Socket.IO
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/fact-or-trick /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 7: Configure Cloudflare

#### 7.1: Add Your Domain to Cloudflare

1. Go to https://dash.cloudflare.com
2. Click "Add a Site"
3. Enter your domain
4. Follow the instructions to change nameservers

#### 7.2: Add DNS Record

1. Go to DNS settings
2. Add an A record:
   - **Name:** `fact-or-trick` (or `@` for root domain)
   - **IPv4 address:** Your server's IP
   - **Proxy status:** Proxied (orange cloud ☁️)

#### 7.3: Configure SSL/TLS

1. Go to SSL/TLS settings
2. Set SSL/TLS encryption mode to **"Full"** or **"Full (strict)"**
3. Go to Edge Certificates
4. Enable "Always Use HTTPS"

#### 7.4: Optimize for WebSockets

1. Go to Network settings
2. Enable **"WebSockets"**
3. (Optional) Enable **"HTTP/2"** and **"HTTP/3"**

### Step 8: Install SSL Certificate (Optional but Recommended)

If using "Full (strict)" mode:

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d fact-or-trick.yourdomain.com

# Auto-renewal is set up automatically
```

### Step 9: Configure Firewall

```bash
# Allow SSH, HTTP, HTTPS
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### Access Your Game

- **URL:** `https://fact-or-trick.yourdomain.com`
- Protected by Cloudflare's CDN and DDoS protection
- Automatic HTTPS
- Fast global access

### Maintenance Commands

```bash
# Update application
cd /var/www/fact-or-trick
sudo git pull  # if using git
sudo npm install
pm2 restart fact-or-trick

# View logs
pm2 logs fact-or-trick
sudo tail -f /var/log/nginx/error.log

# Server status
pm2 status
sudo systemctl status nginx
```

---

## Method 3: Cloudflare Workers (Advanced)

⚠️ **Note:** Socket.IO real-time features don't work well with standard Workers. You'd need to use Cloudflare Durable Objects, which is complex and beyond the scope of this guide.

**Recommendation:** Use Method 1 (Tunnel) or Method 2 (VPS) instead for this Socket.IO application.

---

## 🔧 Troubleshooting

### WebSocket Connection Issues

If players can't connect:

1. **Check Cloudflare Settings:**

   - Ensure WebSockets are enabled (Network settings)
   - Check if SSL/TLS mode is compatible

2. **Check Server Logs:**

   ```bash
   # Local
   Check terminal output

   # VPS
   pm2 logs fact-or-trick
   ```

3. **Test Connection:**

   ```bash
   # Check if server is responding
   curl http://localhost:3000

   # Check WebSocket
   curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" http://localhost:3000/socket.io/
   ```

### QR Code Shows Wrong URL

Make sure `.env` file has correct `PUBLIC_URL`:

```env
PUBLIC_URL=https://your-actual-domain.com
```

Restart the server after changing.

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process
kill -9 PID  # Replace PID with actual process ID
```

### Cloudflare Tunnel Disconnects

For permanent deployments, use a **named tunnel** with the config file instead of quick tunnels.

---

## 📊 Comparison: Which Method to Choose?

| Feature           | Cloudflare Tunnel   | VPS + Cloudflare      | Workers       |
| ----------------- | ------------------- | --------------------- | ------------- |
| **Cost**          | Free                | $5-10/month           | Complex       |
| **Setup Time**    | 5 minutes           | 30-60 minutes         | Hours         |
| **Difficulty**    | Easy ⭐             | Medium ⭐⭐           | Hard ⭐⭐⭐⭐ |
| **Performance**   | Good                | Excellent             | N/A           |
| **Uptime**        | Requires your PC on | 99.9%                 | N/A           |
| **Custom Domain** | Yes (with setup)    | Yes                   | Yes           |
| **Best For**      | Events, Testing     | Production, Long-term | Not suitable  |

## 🎯 Recommendations

- **For a single event:** Use **Method 1** (Cloudflare Tunnel - Quick)
- **For recurring events:** Use **Method 1** (Cloudflare Tunnel - Named)
- **For permanent deployment:** Use **Method 2** (VPS + Cloudflare)
- **For learning/testing:** Use **Method 1** (Cloudflare Tunnel - Quick)

---

## 🚀 Quick Start Summary

### Fastest Way (5 minutes):

```bash
# Terminal 1: Start server
cd /c/Users/faisa/Desktop/Projects/nupco/fact-or-trick
npm start

# Terminal 2: Create tunnel
cloudflared tunnel --url http://localhost:3000

# Copy the https://xxx.trycloudflare.com URL
# Open it in your browser
# Players scan the QR code!
```

**That's it!** Your game is now accessible worldwide! 🎉

---

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section
2. Verify all terminals are running
3. Check firewall and antivirus settings
4. Ensure PUBLIC_URL in .env matches your actual URL

## 🔗 Useful Links

- Cloudflare Tunnel Docs: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/
- Cloudflare Dashboard: https://dash.cloudflare.com
- Socket.IO Documentation: https://socket.io/docs/v4/

---

**Happy Deploying! 🎮**
