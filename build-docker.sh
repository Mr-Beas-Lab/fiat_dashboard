#!/bin/bash

# Exit on error
set -e

# Build the application
echo "Building the application..."
npm run build

# Build the Docker image
echo "Building Docker image..."
docker build -t millionmulugeta/dashboard:latest .

# Push the Docker image
echo "Pushing Docker image..."
docker push millionmulugeta/dashboard:latest

echo "Build and push completed successfully!" 