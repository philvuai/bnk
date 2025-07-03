#!/bin/bash

# Bank Statement AI Analyzer - Development Startup Script

echo "🚀 Starting Bank Statement AI Analyzer..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Port $1 is already in use. Please stop the service running on port $1."
        return 1
    fi
    return 0
}

# Check if ports are available
check_port 3000 || exit 1
check_port 5001 || exit 1

# Create necessary directories
mkdir -p server/uploads

# Check if .env file exists
if [ ! -f "server/.env" ]; then
    echo "⚠️  Environment file not found. Creating from template..."
    cp server/.env.example server/.env
    echo "📝 Please edit server/.env and add your OpenAI API key."
    echo "💡 You can get an API key from: https://platform.openai.com/api-keys"
fi

# Install dependencies if node_modules don't exist
if [ ! -d "server/node_modules" ]; then
    echo "📦 Installing server dependencies..."
    cd server && npm install
    cd ..
fi

if [ ! -d "client/node_modules" ]; then
    echo "📦 Installing client dependencies..."
    cd client && npm install
    cd ..
fi

# Build server
echo "🔨 Building server..."
cd server && npm run build
cd ..

echo "✅ Setup complete!"
echo ""
echo "🌐 Starting development servers..."
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:5001"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Start both servers concurrently
trap 'kill $(jobs -p)' EXIT

# Start server in background
cd server && npm start &
SERVER_PID=$!

# Wait a moment for server to start
sleep 3

# Start client
cd ../client && npm start &
CLIENT_PID=$!

# Wait for both processes
wait $SERVER_PID $CLIENT_PID
