#!/bin/bash

# Build the Docker image
echo "Building Docker image..."

docker build shithead-backend .

# Run the container
echo "Starting container on port 4000..."
# --rm: Remove container when it exits
# -p 4000:4000: Map port 4000
# --env-file .env: Pass environment variables from .env file
# -e HOST=0.0.0.0: Force binding to all interfaces (required for Docker), overrides .env
docker run --rm -p 4000:4000 --env-file .env -e HOST=0.0.0.0 shithead-backend
