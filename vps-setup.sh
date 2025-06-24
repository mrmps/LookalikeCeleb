#!/bin/bash

# VPS Setup Script for Celebrity Lookalike App
# Run this script on your VPS to prepare it for GitHub Actions deployment

set -e

echo "🚀 Setting up VPS for Celebrity Lookalike App deployment..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Docker if not already installed
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
else
    echo "✅ Docker already installed"
fi

# Install Docker Compose if not already installed
if ! command -v docker-compose &> /dev/null; then
    echo "🐳 Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
else
    echo "✅ Docker Compose already installed"
fi

# Install Git if not already installed
if ! command -v git &> /dev/null; then
    echo "📁 Installing Git..."
    sudo apt install git -y
else
    echo "✅ Git already installed"
fi

# Create deployment directory
echo "📁 Creating deployment directory..."
sudo mkdir -p /srv/celeb
sudo chown $USER:$USER /srv/celeb

# Create .env file template
echo "📝 Creating environment file template..."
cat > /srv/celeb/.env << 'EOF'
# Celebrity Lookalike App Environment Variables
# Copy this to your app directory and update with real values

INFERENCE_API_KEY=your_inference_api_key_here
NODE_ENV=production
PORT=3001
EOF

echo "✅ VPS setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Edit /srv/celeb/.env with your real API key"
echo "2. Set up GitHub repository secrets"
echo "3. Push to main branch to trigger deployment"
echo ""
echo "🔧 Manual first deployment (optional):"
echo "cd /srv/celeb"
echo "git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git app"
echo "cd app"
echo "cp ../.env ."
echo "docker-compose up -d" 