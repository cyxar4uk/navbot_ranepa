#!/bin/bash

# Скрипт для проверки и освобождения портов

echo "🔍 Checking which containers are using ports 8000, 6379, 5432, 3000..."

# Проверка портов
echo ""
echo "Port 8000 (Backend):"
docker ps --format "table {{.ID}}\t{{.Names}}\t{{.Ports}}" | grep 8000 || echo "  Not in use"

echo ""
echo "Port 6379 (Redis):"
docker ps --format "table {{.ID}}\t{{.Names}}\t{{.Ports}}" | grep 6379 || echo "  Not in use"

echo ""
echo "Port 5432 (PostgreSQL):"
docker ps --format "table {{.ID}}\t{{.Names}}\t{{.Ports}}" | grep 5432 || echo "  Not in use"

echo ""
echo "Port 3000 (Frontend):"
docker ps --format "table {{.ID}}\t{{.Names}}\t{{.Ports}}" | grep 3000 || echo "  Not in use"

echo ""
echo "💡 To stop conflicting containers, run:"
echo "   docker stop <container_id>"
echo ""
echo "💡 Or stop all containers:"
echo "   docker stop \$(docker ps -q)"
