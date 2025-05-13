#!/bin/bash
set -e

echo "Installing all dependencies..."
npm install --include=dev

# Install specific Tailwind plugins that might be missing
echo "Installing Tailwind plugins..."
npm install @tailwindcss/typography tailwindcss-animate

# Copy the custom Tailwind config for Render
echo "Setting up Tailwind config for Render..."
cp tailwind.render.config.ts tailwind.config.ts

# Build the project with the simplified Vite config for Render
echo "Building the application..."
NODE_ENV=production vite build --config vite.render.config.ts && NODE_ENV=production esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

echo "Build completed successfully!" 