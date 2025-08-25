#!/bin/bash

echo "🚀 Setting up GitHub PR Review MCP Server (FastMCP)..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2)
REQUIRED_VERSION="20.19.0"

# Simple version comparison (works for most cases)
if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    echo "❌ Node.js version $REQUIRED_VERSION+ is required. Current version: $(node -v)"
    echo "💡 Use 'nvm install $REQUIRED_VERSION' to upgrade"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building project..."
npm run build

# Setup environment
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please edit .env and add your GitHub token"
else
    echo "✅ .env file already exists"
fi

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env and add your GitHub Personal Access Token"
echo "   Get token: https://github.com/settings/tokens"
echo "   Required scopes: repo, read:user"
echo ""
echo "2. Test locally:"
echo "   npm run dev"
echo ""
echo "3. Build for production:"
echo "   npm run build"
echo ""
echo "4. Configure in Cursor/VSCode MCP settings:"
echo '   {'
echo '     "mcpServers": {'
echo '       "github-pr-review": {'
echo '         "command": "npx",'
echo '         "args": ["github-pr-review-mcp"]'
echo '       }'
echo '     }'
echo '   }'
echo ""
echo "Available MCP Tools:"
echo "  • get_pr_reviews - Get all reviews for a PR"
echo "  • get_pr_comments - Get PR comments"
echo "  • analyze_pr_code - AI code analysis"
echo "  • get_pr_files - List changed files"
echo "  • get_pr_details - Get PR information"
echo "  • submit_pr_review - Submit reviews"
echo "  • add_pr_comment - Add comments"
echo "  • update_pr - Update PR details"