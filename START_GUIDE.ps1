#!/usr/bin/env PowerShell
# Quick Start Guide for Pipeline Application
# This file documents the steps to start the application

Write-Host "=== Pipeline Application - Quick Start Guide ===" -ForegroundColor Green
Write-Host ""
Write-Host "Prerequisites:"
Write-Host "  - Node.js installed"
Write-Host "  - Python 3.8+ installed" 
Write-Host "  - PORT 3000 (frontend) and PORT 8003 (backend) available"
Write-Host ""

# Kill any existing processes on ports
Write-Host "Checking for existing processes..." -ForegroundColor Yellow
$port3000 = netstat -ano | findstr :3000
$port8003 = netstat -ano | findstr :8003

if ($port3000) {
    Write-Host "Port 3000 is in use. Killing process..." -ForegroundColor Yellow
    $pid3000 = ($port3000 -split '\s+')[-1]
    taskkill /PID $pid3000 /F
    Write-Host "✓ Killed process on port 3000" -ForegroundColor Green
}

if ($port8003) {
    Write-Host "Port 8003 is in use. Killing process..." -ForegroundColor Yellow
    $pid8003 = ($port8003 -split '\s+')[-1]
    taskkill /PID $pid8003 /F
    Write-Host "✓ Killed process on port 8003" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== Starting Frontend ===" -ForegroundColor Cyan
Write-Host "Location: c:\FrontendUI\frontend"
Write-Host "Command:  npm start"
Write-Host "URL:      http://localhost:3000"
Write-Host ""
Write-Host "To start frontend:"
Write-Host "  cd c:\FrontendUI\frontend"
Write-Host "  npm start"
Write-Host ""

Write-Host "=== Starting Backend ===" -ForegroundColor Cyan
Write-Host "Location: c:\FrontendUI\backend"
Write-Host "Command:  py main.py"
Write-Host "URL:      http://localhost:8003"
Write-Host ""
Write-Host "To start backend:"
Write-Host "  cd c:\FrontendUI\backend"
Write-Host "  pip install -r requirements.txt  (only first time)"
Write-Host "  py main.py"
Write-Host ""

Write-Host "=== Environment Setup (Optional) ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "MongoDB Integration:"
Write-Host "  Create .env file in backend/ with:"
Write-Host "  MONGO_URI=mongodb://username:password@host:port/database"
Write-Host ""

Write-Host "Ollama LLM Integration:"
Write-Host "  Install Ollama from https://ollama.ai"
Write-Host "  Run: ollama serve"
Write-Host "  Backend will automatically detect and use it"
Write-Host ""

Write-Host "=== API Endpoints ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Health Check:        GET  /health"
Write-Host "Pipeline Parse:      POST /pipelines/parse"
Write-Host "Pipeline Run:        POST /run"
Write-Host "LLM Generate:        POST /api/llm"
Write-Host "Database Query:      POST /database/query"
Write-Host "Database Connect:    POST /database/connect"
Write-Host "Database Schema:     POST /database/schema/create"
Write-Host "Generate Chart:      POST /database/chart"
Write-Host "Store Execution:     POST /executions"
Write-Host "Get Executions:      GET  /executions"
Write-Host "Dashboard:           GET  /database/dashboard"
Write-Host ""

Write-Host "=== Troubleshooting ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Frontend won't start:"
Write-Host "  - Check if port 3000 is free"
Write-Host "  - npm install (reinstall dependencies)"
Write-Host "  - Clear npm cache: npm cache clean --force"
Write-Host ""

Write-Host "Backend won't start:"
Write-Host "  - Check if port 8003 is free"
Write-Host "  - pip install -r requirements.txt (install deps)"
Write-Host "  - Check Python version: py --version"
Write-Host ""

Write-Host "Can't connect frontend to backend:"
Write-Host "  - Verify setupProxy.js has correct port (8003)"
Write-Host "  - Check CORS is enabled in backend"
Write-Host "  - Check both frontend and backend are running"
Write-Host ""

Write-Host "=== Complete ===" -ForegroundColor Green
Write-Host "All systems ready. Start the services above to run the application."
Write-Host ""
