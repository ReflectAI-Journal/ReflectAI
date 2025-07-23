#!/bin/bash

echo "Building application for Firebase hosting..."

# Clean previous build
rm -rf dist

# Run the standard build
npm run build

# Move files from dist/public to dist root
if [ -d "dist/public" ]; then
    echo "Moving files from dist/public to dist root..."
    cp -r dist/public/* dist/
    rm -rf dist/public
    echo "Build files moved to correct location for Firebase hosting"
else
    echo "No dist/public directory found"
fi

echo "Firebase build complete!"