# Simple FastAPI/Uvicorn image.

FROM python:3.12-slim

WORKDIR /app

# Install system dependencies. (if python packages need compilation)
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    libffi-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies first for better caching.
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy the backend sources.
COPY . /app

# Expose Uvicorn port.
EXPOSE 8000

# Start the API server.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]