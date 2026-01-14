FROM python:3.11-slim-bookworm

WORKDIR /app

# Install system dependencies with timeout and retry
RUN apt-get update -o Acquire::http::Timeout=10 -o Acquire::ftp::Timeout=10 && \
    apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Expose port
EXPOSE 8000

# Run application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
