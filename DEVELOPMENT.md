# Luxe Touch - Development Guide

This guide explains all the development scripts and commands available for the Luxe Touch mobile application.

## 📱 Project Overview

Luxe Touch is an Ionic Angular application built with Capacitor for native mobile development. This app provides spa booking and wellness services.

- **Framework**: Ionic Angular
- **Native Bridge**: Capacitor
- **Package ID**: `io.deeplycalm.knoxweb`
- **App Name**: Luxe Touch

## 🚀 Quick Start

### Prerequisites
- Node.js and npm
- Android Studio with Android SDK
- Android Emulator or physical device
- ADB (Android Debug Bridge)

### Basic Setup
```bash
# Install dependencies
npm install

# Build the web app
npm run build

# Sync with Capacitor
npx cap sync android
```

## 📋 Available Scripts

### 🔨 Build Scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Build Angular app for production |
| `npm run android:build` | Build web app and sync with Android |
| `npm run ios:build` | Build web app and sync with iOS |

### 📱 Android Development

#### Basic Android Commands
| Command | Description |
|---------|-------------|
| `npm run android:dev` | **Main development command** - Build, sync, and run on Android |
| `npm run android:run` | Run app on Android (assumes already built) |
| `npm run android:open` | Open project in Android Studio |
| `npm run android:list` | List available Android devices/emulators |

#### Live Reload Commands
| Command | Description |
|---------|-------------|
| `npm run android:live` | **Live reload with external IP** - For physical devices on same network |
| `npm run android:live-local` | **Live reload with localhost** - For emulators (recommended) |

**Live Reload Workflow:**
1. Start Angular dev server: `npm start`
2. In another terminal: `npm run android:live-local`
3. Make changes to your code - they appear instantly in the app!

### 🍎 iOS Development

| Command | Description |
|---------|-------------|
| `npm run ios:dev` | Build, sync, and run on iOS |
| `npm run ios:run` | Run app on iOS simulator |
| `npm run ios:open` | Open project in Xcode |
| `npm run ios:live` | Live reload with external IP (iOS) |
| `npm run ios:live-local` | Live reload with localhost (iOS) |

### 🐛 Debugging & Logging

#### General Logs
| Command | Description |
|---------|-------------|
| `npm run android:logs` | **Main logging command** - View all app-related logs |
| `npm run android:logs-js` | View JavaScript console logs only |
| `npm run android:logs-errors` | View error logs only |
| `npm run android:logs-clear` | Clear logs and start fresh |

#### Network Monitoring
| Command | Description |
|---------|-------------|
| `npm run android:network` | Monitor HTTP requests and network activity |
| `npm run android:network-requests` | View network connectivity information |
| `npm run android:network-tcpdump` | Raw HTTP traffic monitoring (advanced) |

## 🛠️ Development Workflows

### 1. Standard Development
```bash
# Build and run on Android
npm run android:dev

# View logs in another terminal
npm run android:logs
```

### 2. Live Reload Development (Recommended)
```bash
# Terminal 1: Start Angular dev server
npm start

# Terminal 2: Start live reload
npm run android:live-local

# Terminal 3: Monitor logs
npm run android:logs-js
```

### 3. Network Debugging
```bash
# Monitor API calls and network requests
npm run android:network

# Or use Chrome DevTools:
# 1. Open Chrome
# 2. Go to chrome://inspect
# 3. Click "Inspect" next to your app
# 4. Use Network tab
```

### 4. Error Debugging
```bash
# View only errors
npm run android:logs-errors

# Or view JavaScript console logs
npm run android:logs-js
```

## 🔧 Advanced Debugging

### Chrome DevTools (Recommended for Network Monitoring)
1. Enable USB Debugging on your Android device
2. Open Chrome browser
3. Navigate to `chrome://inspect`
4. Find your app and click "Inspect"
5. Use Network tab to monitor all API calls

### Android Studio Logcat
1. Open Android Studio
2. Go to View → Tool Windows → Logcat
3. Filter by package name: `io.deeplycalm.knoxweb`

### Network Monitoring Tools
- **Chrome DevTools**: Best for web-based debugging
- **Flipper**: Facebook's mobile debugging platform
- **Charles Proxy**: Professional HTTP debugging proxy
- **Proxyman**: macOS HTTP debugging proxy

## 📊 Log Types and What They Show

### `npm run android:logs`
Shows comprehensive app logs including:
- Capacitor plugin activities
- App lifecycle events
- General system messages
- Error messages

### `npm run android:logs-js`
Shows JavaScript console output:
- `console.log()` statements
- API request/response logs (we added custom logging)
- JavaScript errors
- Angular/Ionic framework messages

### `npm run android:network`
Shows network-related activities:
- HTTP requests and responses
- Network connectivity changes
- API call attempts
- Network errors

## 🔍 API Monitoring

We've added custom API logging to the `ApiService`. When you make API calls, you'll see:

```
🌐 API Request: {
  method: 'POST',
  url: 'https://api.example.com/login',
  payload: {...},
  headers: {...}
}

✅ API Response: {
  url: 'https://api.example.com/login',
  data: {...}
}
```

View these logs with: `npm run android:logs-js`

## 🚨 Common Issues & Solutions

### Live Reload Not Working
1. Make sure Angular dev server is running: `npm start`
2. Use `android:live-local` instead of `android:live`
3. Check that emulator can reach localhost:4200

### App Not Installing
1. Check if emulator is running: `npm run android:list`
2. Clear and rebuild: `npm run build && npm run android:build`
3. Try opening in Android Studio: `npm run android:open`

### No Logs Appearing
1. Make sure device is connected: `adb devices`
2. Clear logs first: `npm run android:logs-clear`
3. Check if app is running on the device

### Network Requests Not Visible
1. Use Chrome DevTools: `chrome://inspect`
2. Check API service logs: `npm run android:logs-js`
3. Verify network connectivity

## 📝 Development Tips

1. **Use Live Reload**: Saves significant development time
2. **Monitor Logs**: Always have a terminal with logs running
3. **Chrome DevTools**: Best for debugging network issues
4. **Android Studio**: Use for native debugging and advanced features
5. **Clear Logs**: Use `android:logs-clear` when starting new debugging sessions

## 🔄 Typical Development Session

```bash
# Terminal 1: Start Angular dev server
npm start

# Terminal 2: Start live reload
npm run android:live-local

# Terminal 3: Monitor logs
npm run android:logs-js

# Make changes to your code and see them instantly!
```

## 📞 Support

For development issues:
1. Check the logs first using the appropriate script
2. Use Chrome DevTools for network debugging
3. Refer to [Ionic Documentation](https://ionicframework.com/docs)
4. Refer to [Capacitor Documentation](https://capacitorjs.com/docs)

---

**Happy Coding! 🚀**
