#!/bin/bash

# Environment Variables Setup Script for Project Echo
# This script helps you set up your .env file interactively

echo "=========================================="
echo "Project Echo - Environment Setup"
echo "=========================================="
echo ""

# Check if .env already exists
if [ -f ".env" ]; then
    echo "⚠️  .env file already exists!"
    read -p "Do you want to overwrite it? (y/N): " overwrite
    if [ "$overwrite" != "y" ] && [ "$overwrite" != "Y" ]; then
        echo "Exiting. Your existing .env file is safe."
        exit 0
    fi
fi

# Copy example file
echo "📋 Copying env.example to .env..."
cp documents/env.example .env

echo ""
echo "✅ .env file created!"
echo ""
echo "Now let's fill in your credentials."
echo "Press Enter to skip any credential you don't have yet."
echo ""

# Generate JWT secret
echo "🔐 Generating JWT secret..."
JWT_SECRET=$(openssl rand -base64 32)
sed -i '' "s|JWT_SECRET=your-super-secret-jwt-key-change-this-in-production|JWT_SECRET=$JWT_SECRET|g" .env
echo "✅ JWT secret generated and added"

echo ""
echo "📝 Please provide your credentials:"
echo ""

# Mapbox
read -p "Mapbox Access Token (from https://account.mapbox.com/access-tokens/): " mapbox_token
if [ ! -z "$mapbox_token" ]; then
    sed -i '' "s|MAPBOX_ACCESS_TOKEN=your-mapbox-access-token|MAPBOX_ACCESS_TOKEN=$mapbox_token|g" .env
    echo "✅ Mapbox token added"
fi

# Foursquare
read -p "Foursquare API Key (from https://developer.foursquare.com/): " foursquare_key
if [ ! -z "$foursquare_key" ]; then
    sed -i '' "s|FOURSQUARE_API_KEY=your-foursquare-api-key|FOURSQUARE_API_KEY=$foursquare_key|g" .env
    echo "✅ Foursquare API Key added"
fi
# Note: Foursquare Places API v3 only requires API key (not OAuth Client Secret)

# AWS
read -p "AWS Access Key ID: " aws_key_id
if [ ! -z "$aws_key_id" ]; then
    sed -i '' "s|AWS_ACCESS_KEY_ID=your-aws-access-key-id|AWS_ACCESS_KEY_ID=$aws_key_id|g" .env
    echo "✅ AWS Access Key ID added"
fi

read -p "AWS Secret Access Key: " aws_secret
if [ ! -z "$aws_secret" ]; then
    sed -i '' "s|AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key|AWS_SECRET_ACCESS_KEY=$aws_secret|g" .env
    echo "✅ AWS Secret Access Key added"
fi

read -p "AWS Region (default: us-east-1): " aws_region
if [ ! -z "$aws_region" ]; then
    sed -i '' "s|AWS_REGION=us-east-1|AWS_REGION=$aws_region|g" .env
    echo "✅ AWS Region updated"
fi

read -p "S3 Bucket Name (default: echo-media): " s3_bucket
if [ ! -z "$s3_bucket" ]; then
    sed -i '' "s|AWS_S3_BUCKET_NAME=echo-media|AWS_S3_BUCKET_NAME=$s3_bucket|g" .env
    echo "✅ S3 Bucket Name updated"
fi

# Database
read -p "PostgreSQL Database URL (default: postgresql://echo_user:echo_password@localhost:5432/echo_dev): " db_url
if [ ! -z "$db_url" ]; then
    sed -i '' "s|DATABASE_URL=postgresql://echo_user:echo_password@localhost:5432/echo_dev|DATABASE_URL=$db_url|g" .env
    echo "✅ Database URL updated"
fi

echo ""
echo "=========================================="
echo "✅ Setup complete!"
echo "=========================================="
echo ""
echo "📋 Your .env file has been created with your credentials."
echo ""
echo "⚠️  IMPORTANT:"
echo "   1. Make sure .env is in .gitignore (never commit it!)"
echo "   2. Review your .env file to ensure all values are correct"
echo "   3. You can edit .env directly if you need to add more credentials later"
echo ""
echo "📖 See documents/ENV-SETUP-GUIDE.md for more details"
echo ""

