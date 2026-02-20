#!/bin/bash

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Provincia Real: Aplicando Migrations${NC}"
echo ""

# Configurações
SUPABASE_URL="https://prnshbkblddfgttsgxpt.supabase.co"
SUPABASE_PROJECT="prnshbkblddfgttsgxpt"
PROJECT_ID="prnshbkblddfgttsgxpt"

echo -e "${YELLOW}📋 Para executar as migrations:${NC}"
echo ""
echo "1️⃣  Abra o SQL Editor do Supabase:"
echo "   https://supabase.com/dashboard/project/${PROJECT_ID}/sql/new"
echo ""
echo "2️⃣  Copie TODO o conteúdo deste arquivo:"
echo "   supabase/MIGRATIONS_COMBINED.sql"
echo ""
echo "3️⃣  Cole no SQL Editor"
echo ""
echo "4️⃣  Clique no botão RUN"
echo ""
echo "5️⃣  Aguarde 10-20 segundos até aparecer a mensagem de sucesso"
echo ""
echo -e "${GREEN}✅ Depois que as migrations forem executadas:${NC}"
echo ""
echo "O seu dashboard terá:"
echo "  ✓ Tabelas de cache para NuvemShop + Meta Ads"
echo "  ✓ Funções para sincronização de dados"
echo "  ✓ Sistema de alertas configurável"
echo "  ✓ Análise de campanhas em tempo real"
echo "  ✓ Cotação USD/BRL automatizada"
echo ""
echo -e "${YELLOW}⏱️  Tempo esperado: 2-3 minutos${NC}"
echo ""
echo "Precisa de ajuda? Consulte: docs/architecture.md"
