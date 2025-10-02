#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' 

print_color() {
    color=$1
    message=$2
    echo -e "${color}${message}${NC}"
}

print_header() {
    echo ""
    print_color "$BLUE" "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    print_color "$BLUE" "  $1"
    print_color "$BLUE" "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
}

cd "$(dirname "$0")/../.." || exit 1

print_header "🧪 StackCode Extension - Test Suite"

if [ ! -f "package.json" ]; then
    print_color "$RED" "❌ Erro: package.json não encontrado. Execute este script do diretório da extensão."
    exit 1
fi

if [ ! -d "node_modules" ]; then
    print_color "$YELLOW" "⚠️  node_modules não encontrado. Instalando dependências..."
    npm install
fi

print_header "🔨 Compilando Extensão"
npm run compile:ext
if [ $? -ne 0 ]; then
    print_color "$RED" "❌ Falha na compilação"
    exit 1
fi
print_color "$GREEN" "✅ Compilação concluída"

FAILED_TESTS=0

print_header "🧪 Executando Testes Unitários (Jest)"
npm test -- --coverage --verbose
if [ $? -ne 0 ]; then
    print_color "$RED" "❌ Testes unitários falharam"
    FAILED_TESTS=$((FAILED_TESTS + 1))
else
    print_color "$GREEN" "✅ Testes unitários passaram"
fi

print_header "🔗 Executando Testes de Integração"
npm run test:integration -- --verbose
if [ $? -ne 0 ]; then
    print_color "$RED" "❌ Testes de integração falharam"
    FAILED_TESTS=$((FAILED_TESTS + 1))
else
    print_color "$GREEN" "✅ Testes de integração passaram"
fi

if [ "$(uname)" = "Linux" ]; then
    print_header "🔥 Executando Smoke Tests"

    if ! command -v xvfb-run &> /dev/null; then
        print_color "$YELLOW" "⚠️  xvfb não encontrado. Instale com: sudo apt-get install xvfb"
        print_color "$YELLOW" "⚠️  Pulando smoke tests..."
    else
        xvfb-run -a npm run test:smoke
        if [ $? -ne 0 ]; then
            print_color "$RED" "❌ Smoke tests falharam"
            FAILED_TESTS=$((FAILED_TESTS + 1))
        else
            print_color "$GREEN" "✅ Smoke tests passaram"
        fi
    fi
else
    print_color "$YELLOW" "⚠️  Smoke tests são executados apenas no Linux. Pulando..."
fi

print_header "📊 Relatório de Testes"

if [ $FAILED_TESTS -eq 0 ]; then
    print_color "$GREEN" "✅ TODOS OS TESTES PASSARAM!"
    echo ""
    print_color "$GREEN" "🎉 A extensão está pronta para deploy!"
    echo ""
    
    if [ -f "coverage/coverage-summary.json" ]; then
        print_color "$BLUE" "📊 Relatório de Cobertura:"
        cat coverage/coverage-summary.json | grep -A 4 '"total"'
    fi
    
    exit 0
else
    print_color "$RED" "❌ $FAILED_TESTS grupo(s) de testes falharam"
    echo ""
    print_color "$RED" "Por favor, corrija os erros antes de fazer commit."
    echo ""
    exit 1
fi
