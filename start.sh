#!/bin/bash
set -e

# Check which service to run based on environment
if [ "$SERVICE" = "backend" ]; then
    echo "Starting Backend..."
    cd backend
    pip install -r requirements.txt
    python main.py
elif [ "$SERVICE" = "frontend" ]; then
    echo "Starting Frontend..."
    cd frontend
    npm install
    npm run build
    npm run preview
else
    echo "Error: SERVICE environment variable not set (backend or frontend)"
    exit 1
fi
