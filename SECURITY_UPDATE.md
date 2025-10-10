# 🔐 Security Update - Hidden Admin Panel

## Changes Made

For security reasons, the launcher/dashboard has been moved to a non-obvious path:

### Before:

- **Root (`/`)**: Redirected to launcher → ❌ Too obvious
- **Launcher**: Available at `/launcher` → ❌ Easy to guess

### After:

- **Root (`/`)**: Shows blank page → ✅ No information revealed
- **Admin Panel**: Available at `/admin-panel` → ✅ Secure path

## Access URLs

### 🔐 Admin Panel (Control Dashboard)

```
http://localhost:3000/admin-panel
```

### 🎮 Public Games

- First Day: `http://localhost:3000/first-day`
- Phishing: `http://localhost:3000/phishing`
- Wheel: `http://localhost:3000/wheel`
- Control Room: `http://localhost:3000/control-room`
- Fact or Trick: `http://localhost:3000/fact-or-trick`

## Security Benefits

1. **Root page is blank** - No information is revealed to visitors
2. **Admin panel at non-obvious path** - Harder to discover the control panel
3. **Individual games remain accessible** - Direct access to activities for participants
4. **No sensitive information in console logs** - Admin URL is clearly marked as secure

## How to Use

1. **For administrators**: Bookmark or memorize `/admin-panel`
2. **For participants**: Share direct game URLs (e.g., `/wheel`, `/phishing`)
3. **For deployment**: The root URL can be shared publicly without exposing the admin interface

## Future Enhancements (Optional)

Consider adding:

- Password protection for `/admin-panel`
- IP whitelist for admin access
- Session-based authentication
- Rate limiting

## Notes

- The old `/launcher` path no longer works
- All game paths remain unchanged
- Asset paths in the admin panel have been updated to work with the new location
