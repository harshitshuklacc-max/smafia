@echo off
set PATH=%~dp0.tools\node;%PATH%
cd /d "%~dp0"
echo Starting SHOE MAFIA...
if not exist node_modules (
  echo Installing dependencies...
  call npm install
  call npx prisma db push
  call npx tsx prisma/seed.ts
)
start http://localhost:3000
call npm run dev
