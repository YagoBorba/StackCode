#!/bin/bash

echo "🧪 Testing StackCode GitHub Integration"
echo "======================================"
echo ""

echo "1. Testing CLI GitHub Commands:"
echo "------------------------------"

echo "📋 GitHub Auth Help:"
node packages/cli/dist/index.js github auth --help
echo ""

echo "📋 GitHub Issues Help:"
node packages/cli/dist/index.js github issues --help
echo ""

echo "🔐 Authentication Status:"
node packages/cli/dist/index.js github auth --status
echo ""

echo "2. Testing VSCode Extension:"
echo "---------------------------"

echo "📦 Extension Installation:"
code --list-extensions | grep stackcode
echo ""

echo "🎯 Available Commands:"
echo "- stackcode.auth.login (Login to GitHub)"
echo "- stackcode.auth.logout (Logout from GitHub)"
echo "- stackcode.dashboard (Open StackCode Dashboard)"
echo ""

echo "3. Package Builds:"
echo "-----------------"

echo "📦 CLI Build:"
cd packages/cli && npm run build
echo ""

echo "📦 Extension Build:"
cd ../vscode-extension && npm run compile:ext
echo ""

echo "📦 i18n Build:"
cd ../i18n && npm run build
echo ""

echo "✅ GitHub Integration Test Complete!"
echo ""
echo "🚀 Next Steps:"
echo "1. Open VS Code command palette (Ctrl+Shift+P)"
echo "2. Run 'StackCode: Login to GitHub' to test OAuth"
echo "3. Open 'StackCode: Open StackCode Dashboard' to see issues panel"
echo "4. Test CLI: 'stackcode github auth --login' for token setup"
