# 💖 Dateza — Universal Real-Time Dating Application

Dateza is a modern, full-stack, real-time dating application featuring matching, instant messaging, discovery swipe decks, and a multi-user ephemeral stories system. It is built as a monorepo consisting of an **Express (Node.js) API server** backed by a **PostgreSQL database**, and a **universal React Native (Expo) client** that runs on iOS, Android, and Web browsers.

---

## 🚀 Key Features

* **⚡ Real-Time Chatting:** Powered by `Socket.io` WebSockets for instant message delivery, online indicators, and typing notifications.
* **🔥 Discovery Swipe Deck:** A swipe card deck with smooth gestures for swiping profiles (`like`, `pass`, `super-like`) and matching.
* **🌟 Multi-User Stories System:** Share photos or videos to your ephemeral story feed. Stories from other users are displayed in a clean, scrollable horizontal avatar bar.
* **📬 Icebreakers & Notifications:** Send custom introductory icebreaker messages on swipe to boost match rates, with native push-ready notification lists.
* **🎨 Premium Aesthetics:** Responsive glassmorphism layout, dark-mode color theme, and custom visual scrollbar integration.
* **🛠️ Profile setup wizard:** Interactive multi-step setup wizard to configure gender preferences, birthday, bio, height, and photo uploads.

---

## 📁 Repository Structure

```text
Dating App/
├── backend/                  # Node.js + Express + Socket.io Server
│   ├── db.js                 # PostgreSQL connection & pool config
│   ├── db_init.sql           # Database schema definition script
│   └── index.js              # Express app routing and server initialization
├── mobile/                   # Universal React Native (Expo Router) Client
│   ├── app/                  # Application screens (Tabs navigation)
│   ├── components/           # Reusable UI widgets (SwipeDeck, Buttons)
│   ├── lib/                  # State management store (Zustand) & hooks
│   └── global.css            # Stylesheets & Web scrollbar styles
├── package.json              # Monorepo root script forwarding configuration
└── powershell.bat            # Workspace terminal execution hook
```

---

## 🛠️ Technology Stack

| Component | Technology |
| :--- | :--- |
| **Client Core** | React Native (Expo Router v57.0) |
| **State Management** | Zustand (with local persistence) |
| **Styling** | Vanilla CSS, NativeWind (Tailwind CSS) |
| **Server Engine** | Node.js, Express, Socket.io |
| **Database** | PostgreSQL (Neon serverless cloud) |
| **Media Picker** | Expo Image Picker (camera roll integrations) |

---

## 💻 Installation & Quick Start

You can manage both the frontend and backend from the **root directory** using the configured workspace script shortcuts.

### Prerequisites
* [Node.js](https://nodejs.org/) (v18+)
* [Git](https://git-scm.com/)

---

### 1. Project Initialization

Clone this repository and install the dependencies for both modules:

```bash
# Install backend dependencies
cd backend
npm install

# Install mobile/web client dependencies
cd ../mobile
npm install
```

---

### 2. Running in Development

You can start the development servers directly from the **root directory**:

#### Start the Backend Server:
```bash
npm run dev
```
*This starts the Express server with `nodemon` on `http://localhost:5000` (auto-mapping to `10.0.2.2:5000` in Android emulators).*

#### Start the Expo Client:
```bash
npm run dev:mobile
```
*This opens the Expo builder on the web or console. Inside the console, you can select:*
* Press **`w`** to open and run the app in your desktop Web browser.
* Press **`a`** to load the app in your running Android Emulator.
* Press **`i`** to open the app on the iOS Simulator.

---

## 🔧 Environment Variables Configuration

Copy variables into local `.env` files in their respective folders:

### Backend Configuration (`backend/.env`)
```env
DATABASE_URL=postgresql://user:password@hostname/dbname?sslmode=require
PORT=5000
JWT_SECRET=your_super_secret_key_here
```

### Mobile App Configuration (`mobile/.env`)
```env
EXPO_PUBLIC_BACKEND_URL=http://localhost:5000
```
*(On Android emulators, this is automatically redirected to `http://10.0.2.2:5000`).*

---

## 📦 Deployment Guides

### 🌐 Deploying the Backend (API Server)
You can deploy the backend to host platforms like **Render**, **Railway**, or **Fly.io**:
1. Connect your Git repository.
2. Set the **Root Directory** to `backend`.
3. Set the **Build Command** to `npm install` and **Start Command** to `node index.js`.
4. Add your database connection string and environment variables in the host provider panel.

### 🖥️ Deploying the Web Client
Export the static bundle and host it on **Vercel** or **Netlify**:
1. Change `EXPO_PUBLIC_BACKEND_URL` in `mobile/.env` to point to your live backend endpoint.
2. Build the static bundle inside the `mobile` folder:
   ```bash
   npx expo export --platform web
   ```
3. Deploy the resulting `dist` folder to Vercel:
   ```bash
   npx vercel
   ```

### 📱 Building App Packages (Android / iOS)
Compile executable packages using **EAS (Expo Application Services)**:
```bash
# Login to your Expo developer account
eas login

# Initialize configuration
eas project:init

# Build Android APK (preview release)
eas build --platform android --profile preview

# Build iOS IPA package
eas build --platform ios
```
