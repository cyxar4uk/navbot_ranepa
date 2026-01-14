FROM python:3.11-slim

WORKDIR /app

# Configure apt with longer timeouts and retries for slow networks
RUN echo 'Acquire::http::Timeout "60";' > /etc/apt/apt.conf.d/99timeout && \
    echo 'Acquire::ftp::Timeout "60";' >> /etc/apt/apt.conf.d/99timeout && \
    echo 'Acquire::Retries "5";' >> /etc/apt/apt.conf.d/99timeout && \
    echo 'Acquire::http::Pipeline-Depth "0";' >> /etc/apt/apt.conf.d/99timeout

# Install system dependencies with retry logic
RUN for i in 1 2 3; do \
        apt-get update && \
        apt-get install -y --no-install-recommends \
        gcc \
        libpq-dev && \
        rm -rf /var/lib/apt/lists/* && \
        break || sleep 10; \
    done

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Expose port
EXPOSE 8000

# Run application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
