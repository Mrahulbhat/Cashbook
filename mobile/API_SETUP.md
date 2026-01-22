# Mobile App API Setup Guide

## Backend API URL Configuration

The mobile app needs to know where your backend server is running. This is configured in the `.env` file.

### Current Setup

Your `.env` file should contain:
```
EXPO_PUBLIC_API_URL=http://localhost:5001/api
```

### For Different Scenarios

#### 1. Testing on Simulator/Emulator (Current Setup)
```
EXPO_PUBLIC_API_URL=http://localhost:5001/api
```
This works when testing on iOS Simulator or Android Emulator.

#### 2. Testing on Physical Device
When testing on a real phone, you need to use your computer's IP address instead of `localhost`.

1. Find your computer's IP address:
   - **Mac/Linux**: Run `ifconfig | grep "inet " | grep -v 127.0.0.1`
   - **Windows**: Run `ipconfig` and look for "IPv4 Address"

2. Update `.env`:
   ```
   EXPO_PUBLIC_API_URL=http://192.168.x.x:5001/api
   ```
   Replace `192.168.x.x` with your actual IP address.

3. Make sure your phone and computer are on the same WiFi network.

#### 3. Production
```
EXPO_PUBLIC_API_URL=https://your-backend-domain.com/api
```

### Important Notes

- After changing `.env`, **restart your Expo dev server** (stop and run `npm start` again)
- The backend server must be running on the specified port (default: 5001)
- CORS is configured on the backend to allow mobile app requests

## Backend Endpoints

The mobile app uses these endpoints:
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User signup
- `GET /api/auth/me` - Get current user (protected)
- `POST /api/auth/logout` - User logout

## Troubleshooting

### "Network Error" or "Failed to connect"
- Check that your backend server is running
- Verify the API URL in `.env` is correct
- For physical devices, ensure you're using your computer's IP, not `localhost`
- Make sure both devices are on the same network

### "CORS Error"
- The backend CORS is configured to allow mobile requests
- If you see CORS errors, check `backend/src/server.js` CORS configuration
- Restart the backend server after CORS changes

### "Login Failed"
- Check backend server logs for errors
- Verify database connection is working
- Ensure user credentials are correct
