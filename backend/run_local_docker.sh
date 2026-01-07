#!/bin/bash

# Build the Docker image
echo "Building Docker image..."
# Use --platform linux/amd64 to simulate AWS ECS environment
docker build --platform linux/amd64 -t shithead-backend .

# Run the container
echo "Starting container on port 4000..."
# --rm: Remove container when it exits
# -p 4000:4000: Map port 4000
# --env-file .env: Pass environment variables from .env file
# --platform linux/amd64: Run as linux/amd64
# -e HOST=0.0.0.0: Force binding to all interfaces (required for Docker), overrides .env
docker run --rm --platform linux/amd64 -p 4000:4000 --env-file .env -e HOST=0.0.0.0 shithead-backend
