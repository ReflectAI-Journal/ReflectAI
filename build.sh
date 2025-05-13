#!/bin/bash
set -e

echo "Setting up for Render deployment..."

# Use simplified package.json without dev dependencies
echo "Using simplified package.json..."
cp package.render.json package.json

echo "Installing dependencies..."
npm install

echo "Using minimal Tailwind config..."
cp tailwind.minimal.config.ts tailwind.config.ts

# Use simplified CSS file
echo "Using simplified CSS file..."
cp client/src/index.render.css client/src/index.css

# Build the project with the simplified Vite config for Render
echo "Building the application..."
NODE_ENV=production vite build --config vite.render.config.ts && NODE_ENV=production esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

echo "Build completed successfully!" 