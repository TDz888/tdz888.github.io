#!/bin/bash

# VPS Generator Setup Script
# Màu xanh hacker
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     🚀 VPS GENERATOR SETUP SCRIPT     ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"

# Kiểm tra Node.js
if ! command -v node &> /dev/null; then
    echo -e "${GREEN}📦 Installing Node.js...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
fi

# Kiểm tra Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo -e "${GREEN}📦 Installing Vercel CLI...${NC}"
    npm install -g vercel
fi

# Cài đặt dependencies
echo -e "${GREEN}📦 Installing dependencies...${NC}"
npm init -y
npm install --save-dev vercel

# Tạo file .env mẫu
echo -e "${GREEN}📝 Creating .env.example...${NC}"
cat > .env.example << EOF
# GitHub Token (tạo tại github.com/settings/tokens)
# Cần quyền: repo, workflow
GITHUB_TOKEN=ghp_xxxxxxxxxxxx

# Tailscale Token (tùy chọn)
TAILSCALE_TOKEN=tskey-auth-xxxxx
EOF

echo -e "${GREEN}✅ Setup completed!${NC}"
echo -e "${GREEN}📌 Next steps:${NC}"
echo "   1. Copy .env.example to .env and fill your tokens"
echo "   2. Run: vercel deploy --prod"
