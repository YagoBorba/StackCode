#!/bin/bash

echo "🎓 === DEMONSTRAÇÃO COMPLETA DO MODO EDUCACIONAL StackCode ==="
echo ""

echo "📋 1. CONFIGURAÇÃO GLOBAL - Habilitando modo educacional:"
npx stackcode config set educate true
echo ""

echo "✅ 2. TESTE COM CONFIGURAÇÃO ATIVADA (sem precisar de --educate):"
echo "   → Testando commit válido:"
npx stackcode validate "feat: implementar modo educacional"
echo ""
echo "   → Testando commit inválido:"
npx stackcode validate "commit sem padrão" || true
echo ""

echo "❌ 3. DESABILITANDO CONFIGURAÇÃO GLOBAL:"
npx stackcode config set educate false
echo ""

echo "⚙️ 4. TESTE COM CONFIGURAÇÃO DESABILITADA:"
echo "   → Sem --educate (modo normal):"
npx stackcode validate "feat: implementar modo educacional"
echo ""
echo "   → Com --educate (forçando modo educacional):"
npx stackcode validate "feat: implementar modo educacional" --educate
echo ""

echo "📚 5. COMO CONFIGURAR:"
echo "   • Habilitar globalmente: stackcode config set educate true"
echo "   • Desabilitar globalmente: stackcode config set educate false"  
echo "   • Usar pontualmente: stackcode [comando] --educate"
echo "   • Configurar interativamente: stackcode config"
echo ""

echo "🎉 === DEMONSTRAÇÃO CONCLUÍDA ==="""
echo "✨ Agora o StackCode pode ensinar as melhores práticas automaticamente!"
