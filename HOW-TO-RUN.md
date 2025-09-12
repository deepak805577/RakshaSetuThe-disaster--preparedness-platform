# 🚀 How to Run Disaster Preparedness PWA for Punjab Schools

## Prerequisites (One-time setup)

Before running the project, make sure you have:

1. **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
2. **MongoDB** (v4.4 or higher) - [Download here](https://www.mongodb.com/try/download/community)
3. **VS Code** (recommended) - [Download here](https://code.visualstudio.com/)
4. **Git** (optional) - [Download here](https://git-scm.com/)

## 🎯 **Method 1: Single Command (EASIEST)**

### Option A: Using npm (Recommended)
```bash
# Navigate to project folder
cd C:\Users\Omkar\OneDrive\Desktop\sih-disaster-app

# Run both servers with one command
npm run dev
```

### Option B: Using PowerShell script
```powershell
# Navigate to project folder
cd C:\Users\Omkar\OneDrive\Desktop\sih-disaster-app

# Run the launcher script
.\start-dev.ps1
```

## 🎯 **Method 2: VS Code Tasks (BEST for Development)**

1. **Open project in VS Code:**
   ```bash
   code C:\Users\Omkar\OneDrive\Desktop\sih-disaster-app
   ```

2. **Run the task:**
   - Press `Ctrl+Shift+P`
   - Type "Tasks: Run Task"
   - Select "🚀 Start Disaster PWA"

3. **Or use keyboard shortcut:**
   - Press `Ctrl+Shift+P`
   - Type "Run Build Task" or just press `Ctrl+Shift+B`

## 🎯 **Method 3: Manual (If you want control)**

### Terminal 1 - Backend:
```bash
cd C:\Users\Omkar\OneDrive\Desktop\sih-disaster-app\backend
npm run dev
```

### Terminal 2 - Frontend:
```bash
cd C:\Users\Omkar\OneDrive\Desktop\sih-disaster-app\frontend
npm start
```

## 📍 **URLs After Starting**

- **Frontend (Main App):** http://localhost:3000
- **Backend API:** http://localhost:5000
- **API Health Check:** http://localhost:5000/api/health

## 🎯 **Demo Accounts**

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@demo.com | admin123 |
| Teacher | teacher@demo.com | teacher123 |
| Student | student@demo.com | student123 |

## 🛠️ **Troubleshooting**

### If MongoDB is not running:
```bash
# Windows - Start MongoDB manually
mongod
```

### If ports are busy:
```bash
# Kill existing Node processes
taskkill /F /IM node.exe

# Or use PowerShell
Stop-Process -Name node -Force
```

### If dependencies are missing:
```bash
# Install all dependencies
npm run install-all
```

### If there are compilation errors:
```bash
# Clear cache and reinstall
cd backend
rm -rf node_modules package-lock.json
npm install

cd ../frontend  
rm -rf node_modules package-lock.json
npm install
```

## 🔄 **Project Structure Reminder**

```
sih-disaster-app/
├── backend/          # Node.js + Express + MongoDB
├── frontend/         # React + TypeScript + Tailwind
├── package.json      # Root scripts for running both
├── start-dev.ps1     # PowerShell launcher
├── .vscode/          # VS Code tasks configuration
└── HOW-TO-RUN.md     # This guide
```

## ⚡ **Quick Start Commands**

```bash
# 1. Navigate to project
cd C:\Users\Omkar\OneDrive\Desktop\sih-disaster-app

# 2. Start everything
npm run dev

# 3. Open browser
# Frontend will auto-open at: http://localhost:3000
```

## 🛑 **How to Stop**

- If running in terminal: Press `Ctrl+C`
- If running as VS Code task: Close the terminal or press `Ctrl+C`
- If processes are stuck: `taskkill /F /IM node.exe`

## 📱 **Features Available**

✅ Multi-role authentication system
✅ Interactive disaster learning modules  
✅ Virtual evacuation drills with real-time timing
✅ Gamification (points, badges, leaderboards)
✅ Admin dashboard with analytics
✅ Punjab-specific emergency contacts
✅ PWA features for offline access
✅ Real-time features with Socket.io

## 🎉 **That's it!**

The project is ready to run anytime with just `npm run dev` command!
