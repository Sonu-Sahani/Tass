# 🃏 Card Game Tracker

Track balances, transfers & who owes whom — works on mobile & desktop.

---

## 🖥️ VS Code mein Run Karna (Local)

### Step 1 — Prerequisites Install Karo
- [Node.js](https://nodejs.org/) download karo (LTS version, e.g. v20)
- Install karne ke baad terminal mein check karo:
  ```
  node -v
  npm -v
  ```

### Step 2 — Project Open Karo VS Code Mein
1. VS Code open karo
2. `File → Open Folder` → `card-game-tracker` folder select karo

### Step 3 — Dependencies Install Karo
VS Code ka integrated terminal open karo (`Ctrl + `` ` ``) aur likho:
```bash
npm install
```
Yeh sab packages download karega (node_modules folder banega).

### Step 4 — Dev Server Start Karo
```bash
npm run dev
```
Browser mein khulega: **http://localhost:5173**

### Step 5 — Build Karna (Optional)
Production build banana ho toh:
```bash
npm run build
```
`dist/` folder mein final files aayengi.

---

## 🚀 Vercel Pe Deploy Karna

### Method 1 — GitHub se (Recommended)

1. **GitHub account** banao agar nahi hai — https://github.com
2. **New repository** banao:
   - GitHub pe `+` → `New repository`
   - Name: `card-game-tracker`
   - Public ya Private — dono kaam karega
3. **Code upload karo** (terminal mein):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/card-game-tracker.git
   git push -u origin main
   ```
4. **Vercel** pe jao — https://vercel.com
5. **Sign up / Login** karo (GitHub se login karo)
6. **"Add New Project"** click karo
7. **GitHub repo select karo** — `card-game-tracker`
8. Settings mein kuch change karne ki zarurat nahi, Vercel automatic detect karega:
   - Framework: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
9. **"Deploy"** button dabao
10. 1-2 minute mein live ho jayega! URL milega jaise: `https://card-game-tracker-xyz.vercel.app`

### Method 2 — Vercel CLI se (Direct)

```bash
npm install -g vercel
vercel login
vercel --prod
```

---

## 📱 Features

- ✅ 2–15 players support
- ✅ Transfer money between players
- ✅ Transaction history
- ✅ Auto debt settlement at game end
- ✅ **Reset button** — page refresh pe reset nahi hota (localStorage use karta hai)
- ✅ JSON export/import
- ✅ Mobile friendly
- ✅ Data browser close karne ke baad bhi saved rehta hai
