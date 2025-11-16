#!/bin/bash

# Add development tools to PATH for this session
# To make permanent, add these lines to your ~/.zshrc file

export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"
export PATH="/opt/homebrew/opt/node@20/bin:$PATH"
export PATH="/opt/homebrew/opt/redis/bin:$PATH"

echo "✅ PostgreSQL and Node.js added to PATH"
echo ""
echo "To make this permanent, add these lines to your ~/.zshrc:"
echo ""
echo "export PATH=\"/opt/homebrew/opt/postgresql@15/bin:\$PATH\""
echo "export PATH=\"/opt/homebrew/opt/node@20/bin:\$PATH\""
echo ""
echo "Then run: source ~/.zshrc"

