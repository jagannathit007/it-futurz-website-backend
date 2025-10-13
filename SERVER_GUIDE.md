# Server Management Guide

## The Port Conflict Problem

**What's happening:**
- Nodemon restarts the server when you save files
- Sometimes the old Node.js process doesn't exit properly
- The new process tries to use the same port (3000) and crashes
- This creates a loop: save → restart → port conflict → crash → save → restart...

## Solutions

### Option 1: Use the Batch Scripts (Recommended)
```bash
# Double-click start-server.bat
# This will stop any existing processes and start fresh
```

### Option 2: Manual Commands
```powershell
# Stop all Node processes
npm run stop

# Start server
npm start
```

### Option 3: PowerShell Commands
```powershell
# Stop all Node processes
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# Start server
npm start
```

## Best Practices

1. **Always stop the server properly** with `Ctrl+C` when you're done
2. **Use the batch scripts** to avoid conflicts
3. **Check for running processes** if you get port conflicts
4. **Save files less frequently** during development to reduce restarts

## Current Configuration

- **Port:** 3000
- **Database:** MongoDB (localhost:27017/it-futurz)
- **Environment:** Development mode
- **Auto-restart:** Enabled (nodemon)

## Troubleshooting

If you still get port conflicts:
1. Run `npm run stop` to kill all Node processes
2. Wait 2-3 seconds
3. Run `npm start` to restart

## File Watching

Nodemon watches these files/folders:
- `app.js`
- `routes/`
- `controllers/`
- `models/`
- `middlewares/`
- `utils/`
- `config/`

Files in `node_modules/`, `uploads/`, and `*.log` are ignored.
