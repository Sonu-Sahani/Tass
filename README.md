# 🃏 Card Game Tracker

Track balances, transfers, and settlements during card games. Works seamlessly on both mobile and desktop devices.

---

## ✨ Features

- ✅ Supports 2–15 players
- ✅ Track player balances in real-time
- ✅ Transfer money between players
- ✅ Transaction history for each player
- ✅ Automatic debt settlement calculation
- ✅ Data persistence using Local Storage
- ✅ JSON Export / Import support
- ✅ Mobile-friendly responsive UI
- ✅ Works offline after loading
- ✅ Reset game functionality

---

## 🛠️ Tech Stack

- React
- Vite
- Tailwind CSS
- Local Storage API

---

## 📂 Project Setup

### Prerequisites

Make sure you have the following installed:

- Node.js (v18 or higher recommended)
- npm

Check installation:

```bash
node -v
npm -v
```

---

## 🚀 Run Locally

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/card-game-tracker.git
```

### 2. Navigate to Project Folder

```bash
cd card-game-tracker
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start Development Server

```bash
npm run dev
```

The application will start at:

```text
http://localhost:5173
```

---

## 📦 Build for Production

Create an optimized production build:

```bash
npm run build
```

The build files will be generated inside:

```text
dist/
```

Preview the production build:

```bash
npm run preview
```

---

## 🌐 Deploy on Vercel

### Method 1: Deploy via GitHub (Recommended)

1. Create a GitHub repository.
2. Push your project to GitHub.

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/card-game-tracker.git
git push -u origin main
```

3. Login to Vercel:
   https://vercel.com

4. Click **Add New Project**

5. Import your GitHub repository.

6. Use the following settings:

```text
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

7. Click **Deploy**

Your project will be live in a few minutes.

---

## 🌐 Deploy on Netlify

### Build the Project

```bash
npm run build
```

### Deploy

1. Login to https://app.netlify.com
2. Click **Add New Site**
3. Choose **Deploy Manually**
4. Drag and drop the **dist** folder

Or connect your GitHub repository and use:

```text
Build Command: npm run build
Publish Directory: dist
```

---

## 📱 How It Works

### Setup

- Select the number of players
- Enter player names
- Start the game

### During the Game

- Adjust balances
- Transfer money between players
- Track transaction history
- Export or import game data using JSON

### End Game

- View final standings
- Automatically calculate who owes whom
- Reset and start a new game

---

## 💾 Data Persistence

All game data is automatically saved in the browser using Local Storage.

This means:

- Refreshing the page won't lose data
- Closing and reopening the browser won't lose data
- No backend or database required

---

## 📄 License

This project is open-source and available under the MIT License.

---

## 👨‍💻 Author

Developed with React, Vite, and Tailwind CSS.