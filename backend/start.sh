#!/bin/bash
set -e

echo "Initializing database..."
python init_db.py

echo "Starting application..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
