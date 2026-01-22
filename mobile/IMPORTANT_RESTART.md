# ⚠️ IMPORTANT: Restart Required

I've updated your `.env` file to use your computer's IP address:
```
EXPO_PUBLIC_API_URL=http://192.168.29.253:5001/api
```

## 🔄 You MUST Restart Expo Now:

1. **Stop Expo** (press `Ctrl+C` in the terminal where Expo is running)

2. **Restart Expo**:
   ```bash
   cd mobile
   npm start
   ```

3. **Reload your app** on your device:
   - Shake device → "Reload"
   - Or press `r` in Expo terminal

## ✅ After Restart:

- Your mobile app will now connect to: `http://192.168.29.253:5001/api`
- Login and signup should work!

## 📝 Notes:

- **Backend is running** ✓ (confirmed on port 5001)
- **Your IP**: `192.168.29.253`
- **Make sure** your phone and computer are on the **same WiFi network**

If it still doesn't work after restart, check:
1. Phone and computer on same WiFi?
2. Firewall blocking port 5001?
3. Backend still running? (`cd backend && npm start`)
