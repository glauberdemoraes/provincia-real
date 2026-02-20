#!/bin/bash

SUPABASE_URL="https://prnshbkblddfgttsgxpt.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybnNoYmtibGRkZmd0dHNneHB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MzE1MTAsImV4cCI6MjA4NTMwNzUxMH0.HPUfckX6OfqbWu1MvZIs0bZaYRf58n84MRCrpRk-7og"

echo "🔧 Testando acesso ao Supabase..."
echo ""

# Testar se tabela existe
RESPONSE=$(curl -s -w "\n%{http_code}" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  "$SUPABASE_URL/rest/v1/exchange_rates?select=*&limit=1")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

echo "Status HTTP: $HTTP_CODE"
echo ""

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Tabela exchange_rates JÁ EXISTE!"
  echo ""
  echo "📊 Dados atuais:"
  echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
  echo ""
  echo "🚀 Dashboard pronto!"
  exit 0
elif [ "$HTTP_CODE" = "404" ]; then
  echo "❌ Tabela não existe"
  echo ""
  echo "📋 Executando SQL via API do Supabase..."
  
  # Tentar criar via RPC
  curl -s -X POST \
    -H "apikey: $SUPABASE_ANON_KEY" \
    -H "Content-Type: application/json" \
    "$SUPABASE_URL/rest/v1/rpc/execute_sql" \
    -d @- << 'SQL_EOF' > /tmp/response.txt 2>&1
{
  "query": "CREATE TABLE IF NOT EXISTS public.exchange_rates (date DATE PRIMARY KEY, usd_brl NUMERIC(10, 4) NOT NULL, source TEXT DEFAULT 'awesomeapi', fetched_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(), CONSTRAINT exchange_rates_usd_brl_positive CHECK (usd_brl > 0));"
}
SQL_EOF

  RESULT=$(cat /tmp/response.txt)
  
  if echo "$RESULT" | grep -q "error\|Error"; then
    echo "⚠️  RPC não disponível. Você precisa executar manualmente."
    echo ""
    echo "🔗 Abra: https://supabase.com/dashboard/project/prnshbkblddfgttsgxpt/sql/new"
    echo "📋 Cole o arquivo: SETUP_SUPABASE.md"
    echo "▶️  Clique RUN"
    exit 1
  else
    echo "✅ Tabela criada com sucesso!"
  fi
else
  echo "❌ Erro ao conectar ($HTTP_CODE)"
  echo "$BODY"
  exit 1
fi
