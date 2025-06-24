#!/bin/bash

# Hetzner Cloud Deployment Script
# Usage: ./deploy.sh [SERVER_IP] [DOMAIN_OPTIONAL]

SERVER_IP=$1
DOMAIN=$2

if [ -z "$SERVER_IP" ]; then
    echo "Usage: ./deploy.sh [SERVER_IP] [DOMAIN_OPTIONAL]"
    echo "Example: ./deploy.sh 123.456.789.123 yourdomain.com"
    exit 1
fi

echo "🚀 Deploying LookalikeCeleb app to Hetzner Cloud..."

# Build the project locally
echo "📦 Building project..."
bun install
bun run build

# Create deployment package
echo "📁 Creating deployment package..."
tar -czf deploy.tar.gz \
    dist/ \
    server/ \
    public/ \
    package.json \
    bun.lockb \
    .env.example

# Copy to server
echo "📤 Copying files to server..."
scp deploy.tar.gz root@$SERVER_IP:/tmp/
scp Dockerfile root@$SERVER_IP:/tmp/

# Deploy on server
echo "🔧 Setting up application on server..."
ssh root@$SERVER_IP << EOF
    # Clean up any existing deployment
    docker stop lookalike-app 2>/dev/null || true
    docker rm lookalike-app 2>/dev/null || true

    # Extract new deployment
    cd /opt
    rm -rf lookalike-app
    mkdir lookalike-app
    cd lookalike-app
    tar -xzf /tmp/deploy.tar.gz
    cp /tmp/Dockerfile .

    # Create .env if it doesn't exist
    if [ ! -f .env ]; then
        echo "INFERENCE_API_KEY=your_api_key_here" > .env
        echo "PORT=3001" >> .env
        echo "NODE_ENV=production" >> .env
        echo "⚠️  Please edit /opt/lookalike-app/.env with your actual API key"
    fi

    # Build and run Docker container
    docker build -t lookalike-app .
    docker run -d \\
        -p 80:3001 \\
        --env-file .env \\
        --name lookalike-app \\
        --restart unless-stopped \\
        lookalike-app

    # Setup firewall
    ufw allow 80 2>/dev/null || true
    ufw allow 22 2>/dev/null || true
    ufw --force enable 2>/dev/null || true

    echo "✅ Deployment complete!"
EOF

# Clean up local files
rm deploy.tar.gz

echo "🌐 Your app should be available at: http://$SERVER_IP"
if [ ! -z "$DOMAIN" ]; then
    echo "🌐 Don't forget to point $DOMAIN to $SERVER_IP"
fi

echo ""
echo "📝 Next steps:"
echo "1. SSH to your server: ssh root@$SERVER_IP"
echo "2. Edit your environment: nano /opt/lookalike-app/.env"
echo "3. Restart the app: docker restart lookalike-app"
echo "4. Check logs: docker logs lookalike-app" 