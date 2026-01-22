# Quick Fix for "Error status: undefined"

This error means your mobile app **cannot reach the backend server**. Here's how to fix it:

## ✅ Step 1: Verify Backend is Running

```bash
cd backend
npm start
```

You should see: `server is running on PORT: 5001`

## ✅ Step 2: Test Backend Connection

Open in browser: `http://localhost:5001/api/health`

Should return: `{"message":"Server is running"}`

## ✅ Step 3: Check Your Device Type

### If using **iOS Simulator** or **Android Emulator**:
- Your `.env` is correct: `EXPO_PUBLIC_API_URL=http://localhost:5001/api`
- ✅ This should work!

### If using **Physical Device** (iPhone/Android):
- `localhost` **WON'T WORK** - you need your computer's IP address
- Find your IP:
  ```bash
  # Mac/Linux
  ifconfig | grep "inet " | grep -v 127.0.0.1
  
  # Windows
  ipconfig
  ```
- Update `mobile/.env`:
  ```
  EXPO_PUBLIC_API_URL=http://192.168.x.x:5001/api
  ```
  (Replace `192.168.x.x` with your actual IP)
- **Restart Expo** after changing `.env`:
  ```bash
  # Stop Expo (Ctrl+C)
  # Then restart
  cd mobile
  npm start
  ```

## ✅ Step 4: Verify Both Devices on Same Network

- Phone and computer must be on the **same WiFi network**
- Firewall might be blocking - temporarily disable to test

## ✅ Step 5: Check Console Logs

When you try to login, check the Expo console. You should see:
```
🔗 Mobile API Base URL: http://localhost:5001/api
Attempting login to: http://localhost:5001/api/auth/login
```

If you see "No response from server", the backend isn't reachable.

## Common Issues:

1. **Backend not running** → Start it!
2. **Wrong IP address** → Use your computer's IP, not localhost
3. **Different networks** → Phone and computer must be on same WiFi
4. **Firewall blocking** → Allow port 5001 in firewall
5. **Expo not restarted** → Always restart after changing `.env`
