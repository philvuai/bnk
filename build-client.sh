#!/bin/bash

# Build script for Netlify deployment
echo "🔨 Building React client for production..."

# Navigate to client directory
cd client

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build the application
echo "🏗️ Building application..."
npm run build

echo "✅ Build complete! Output in client/build/"
