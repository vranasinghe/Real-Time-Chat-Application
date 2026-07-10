# Dateza - Real-Time Dating App

This repository contains the full-stack codebase for **Dateza**, a real-time dating application built with React Native (Expo) and Node.js.

## 📁 Repository Structure

```
Real-Time-Chat-Application/
├── backend/                  # Node.js + Express + Socket.io Server
└── mobile/                   # React Native (Expo Router) Universal App
```

---

## 🌎 1. Backend Setup (`backend/`)

The backend is built with Node.js, Express, Socket.io (for WebSockets), and PostgreSQL.

### Installation & Run:
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your `.env` variables (e.g. database URL, JWT secret).
4. Run the development server:
   ```bash
   npm run dev
   ```

---

## 📱 2. Mobile App Setup (`mobile/`)

The mobile client is a universal React Native app powered by Expo. It runs on Android, iOS, and Web.

### Installation & Run:
1. Navigate to the mobile folder:
   ```bash
   cd mobile
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up the backend URL in `mobile/.env`.
4. Start the Expo bundler:
   ```bash
   npx expo start
   ```
5. Choose your target platform:
   - Press `a` for Android Emulator.
   - Press `i` for iOS Simulator.
   - Press `w` for Web view.

### Building APK:
To build the Android APK via EAS:
```bash
eas build --platform android --profile preview
```
