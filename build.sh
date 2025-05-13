#!/bin/bash
# Install all dependencies including dev dependencies
npm install --include=dev

# Build the project with the simplified Vite config for Render
NODE_ENV=production vite build --config vite.render.config.ts && NODE_ENV=production esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist 