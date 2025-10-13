@echo off
echo Stopping all Node.js processes...
taskkill /F /IM node.exe 2>nul
echo All Node.js processes stopped.
echo You can now start the server with: npm start
pause
