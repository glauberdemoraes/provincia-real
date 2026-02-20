#!/bin/bash

# URLs e chaves
SUPABASE_URL="https://prnshbkblddfgttsgxpt.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybnNoYmtibGRkZmd0dHNneHB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MzE1MTAsImV4cCI6MjA4NTMwNzUxMH0.HPUfckX6OfqbWu1MvZIs0bZaYRf58n84MRCrpRk-7og"

echo "🔧 Criando tabela via pgvector/editor..."
echo ""

# Ler o SQL do arquivo
SQL=$(cat << 'SQLEOF'
CREATE TABLE IF NOT EXISTS public.exchange_rates (
  date DATE PRIMARY KEY,
  usd_brl NUMERIC(10, 4) NOT NULL,
  source TEXT DEFAULT 'awesomeapi',
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT exchange_rates_usd_brl_positive CHECK (usd_brl > 0)
);

CREATE INDEX IF NOT EXISTS idx_exchange_rates_date ON public.exchange_rates(date DESC);

ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON public.exchange_rates FOR SELECT USING (true);

INSERT INTO public.exchange_rates (date, usd_brl, source)
VALUES (CURRENT_DATE, 4.97, 'awesomeapi')
ON CONFLICT (date) DO NOTHING;
SQLEOF
)

# Tentar executar via RPC (pode não existir)
echo "Tentando criar tabela..."
RESPONSE=$(curl -s -X POST \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  "$SUPABASE_URL/rest/v1/rpc/execute_sql" \
  -d "$(jq -n --arg q "$SQL" '{query: $q}')" 2>&1)

echo "Resposta: $RESPONSE"
echo ""

# Verificar se criou
sleep 2
echo "Verificando se tabela foi criada..."
CHECK=$(curl -s \
  -H "apikey: $SUPABASE_ANON_KEY" \
  "$SUPABASE_URL/rest/v1/exchange_rates?select=*")

if echo "$CHECK" | grep -q "usd_brl\|code.*PGRST"; then
  if echo "$CHECK" | grep -q "code"; then
    echo "❌ Tabela ainda não criada"
    echo ""
    echo "⚠️  A função RPC não existe neste projeto"
    echo ""
    echo "📋 Por favor, execute manualmente:"
    echo "1. Abra: https://supabase.com/dashboard/project/prnshbkblddfgttsgxpt/sql/new"
    echo "2. Execute o arquivo: SETUP_SUPABASE.md"
    exit 1
  else
    echo "✅ Tabela criada com sucesso!"
    echo ""
    echo "📊 Dados:"
    echo "$CHECK" | jq '.'
  fi
else
  echo "❌ Erro desconhecido"
  echo "$CHECK"
fi
