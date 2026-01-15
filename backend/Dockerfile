FROM python:3.11-slim

WORKDIR /app

# NOTE: Debian - это операционная система Linux внутри Docker образа
# Она нужна только если Python пакеты требуют компиляции (gcc) или системных библиотек (libpq-dev)
# 
# В нашем случае:
# - psycopg2-binary - предкомпилированный, НЕ требует libpq-dev
# - python-jose[cryptography] - может требовать gcc для компиляции
# 
# Попробуем установить только gcc (без libpq-dev), так как используем psycopg2-binary
# Если сборка упадёт - значит нужны оба пакета

# Install only gcc (for compiling Python packages like cryptography)
# libpq-dev НЕ нужен, так как используем psycopg2-binary (предкомпилированный)
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    gcc \
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
