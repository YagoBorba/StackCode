#!/bin/bash

set -e

echo "🔧 Instalando dependências para testes da extensão VS Code..."
echo ""

cd "$(dirname "$0")/../packages/vscode-extension" || exit 1

echo "📦 Instalando dependências de teste..."
npm install --save-dev \
  @vscode/test-electron@^2.3.9 \
  @types/mocha@^10.0.6 \
  @types/glob@^8.1.0 \
  mocha@^10.3.0 \
  glob@^10.3.10 \
  ts-node@^10.9.2

echo ""
echo "✅ Dependências instaladas com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo "  1. Compilar a extensão: npm run compile:ext"
echo "  2. Executar testes: npm run test:all"
echo "  3. Ou usar o script helper: ../../scripts/run-extension-tests.sh"
echo ""
