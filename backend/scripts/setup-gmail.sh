#!/bin/bash

# Gmail Email Setup Script for TaskCRM

echo "=================================================="
echo "  📧 Gmail Email Configuration Setup"
echo "=================================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}This script will help you configure Gmail for sending emails.${NC}"
echo ""

# Step 1: Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found!${NC}"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo -e "${GREEN}✅ Created .env file${NC}"
    echo ""
fi

echo -e "${YELLOW}📋 STEP 1: Enable 2-Factor Authentication on Gmail${NC}"
echo "   1. Go to: https://myaccount.google.com/security"
echo "   2. Find '2-Step Verification' and turn it ON"
echo "   3. Complete the setup process"
echo ""
read -p "Press Enter when you've enabled 2FA..."

echo ""
echo -e "${YELLOW}📋 STEP 2: Create App-Specific Password${NC}"
echo "   1. Go to: https://myaccount.google.com/apppasswords"
echo "   2. Select 'Mail' and 'Other (Custom name)'"
echo "   3. Name it 'TaskCRM Backend'"
echo "   4. Click 'Generate'"
echo "   5. Copy the 16-character password (remove spaces)"
echo ""
read -p "Press Enter to continue..."

echo ""
echo -e "${GREEN}Now, enter your Gmail details:${NC}"
echo ""

# Get email
read -p "Your Gmail address: " gmail_address

# Get app password
echo ""
echo -e "${YELLOW}Paste the 16-character App-Specific Password (spaces will be removed):${NC}"
read -s app_password
app_password=$(echo "$app_password" | tr -d ' ')

echo ""
echo ""

# Update .env file
echo "Updating .env file..."

# Use different sed syntax for macOS vs Linux
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s|EMAIL_USER=.*|EMAIL_USER=$gmail_address|" .env
    sed -i '' "s|EMAIL_PASSWORD=.*|EMAIL_PASSWORD=$app_password|" .env
else
    # Linux
    sed -i "s|EMAIL_USER=.*|EMAIL_USER=$gmail_address|" .env
    sed -i "s|EMAIL_PASSWORD=.*|EMAIL_PASSWORD=$app_password|" .env
fi

echo -e "${GREEN}✅ Email configuration updated in .env${NC}"
echo ""

# Show current configuration
echo -e "${BLUE}📧 Current Email Configuration:${NC}"
echo "   Email User: $gmail_address"
echo "   Email Password: ${app_password:0:4}************ (configured)"
echo "   Email Host: smtp.gmail.com"
echo "   Email Port: 587"
echo ""

echo -e "${YELLOW}⚠️  IMPORTANT: Restart your backend server for changes to take effect!${NC}"
echo ""
echo "   $ npm start"
echo ""

echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "To test email sending:"
echo "   1. Restart backend: npm start"
echo "   2. Send a test invitation"
echo "   3. Check server console for detailed logs"
echo "   4. Check your email inbox"
echo ""
echo "Troubleshooting: See backend/docs/EMAIL_SETUP.md"
echo ""
