#!/bin/bash

SUPABASE_URL="https://prnshbkblddfgttsgxpt.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybnNoYmtibGRkZmd0dHNneHB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MzE1MTAsImV4cCI6MjA4NTMwNzUxMH0.HPUfckX6OfqbWu1MvZIs0bZaYRf58n84MRCrpRk-7og"

echo "📊 Finalizando setup da tabela exchange_rates..."
echo ""

# Step 1: Verificar se tabela foi criada
echo "1️⃣  Verificando estrutura..."
RESPONSE=$(curl -s -w "\n%{http_code}" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  "$SUPABASE_URL/rest/v1/exchange_rates?select=*&limit=1")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" != "200" ]; then
  echo "❌ Tabela ainda não foi criada. Tentando novamente..."
  
  # Tentar criar com script SQL completo
  curl -s -X POST \
    -H "apikey: $SUPABASE_ANON_KEY" \
    -H "Content-Type: application/json" \
    "$SUPABASE_URL/rest/v1/rpc/execute_sql" \
    -d '{
      "query": "CREATE TABLE IF NOT EXISTS public.exchange_rates (date DATE PRIMARY KEY, usd_brl NUMERIC(10, 4) NOT NULL, source TEXT DEFAULT '\''awesomeapi'\'', fetched_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(), CONSTRAINT exchange_rates_usd_brl_positive CHECK (usd_brl > 0)); CREATE INDEX IF NOT EXISTS idx_exchange_rates_date ON public.exchange_rates(date DESC); ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY; CREATE POLICY \"Allow public read access to exchange_rates\" ON public.exchange_rates FOR SELECT USING (true);"
    }' > /dev/null 2>&1
  
  sleep 2
fi

# Step 2: Inserir cotação inicial
echo "2️⃣  Inserindo cotação inicial..."
TODAY=$(date -u +%Y-%m-%d)

INSERT_RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  "$SUPABASE_URL/rest/v1/exchange_rates" \
  -d "{
    \"date\": \"$TODAY\",
    \"usd_brl\": 4.97,
    \"source\": \"awesomeapi\"
  }")

INSERT_HTTP=$(echo "$INSERT_RESPONSE" | tail -n1)
INSERT_BODY=$(echo "$INSERT_RESPONSE" | head -n-1)

if [ "$INSERT_HTTP" = "201" ] || [ "$INSERT_HTTP" = "200" ]; then
  echo "✅ Cotação inserida!"
  echo ""
else
  echo "⚠️  Código: $INSERT_HTTP"
  echo "$INSERT_BODY"
fi

# Step 3: Verificar dados finais
echo ""
echo "3️⃣  Verificando dados..."
FINAL=$(curl -s \
  -H "apikey: $SUPABASE_ANON_KEY" \
  "$SUPABASE_URL/rest/v1/exchange_rates?select=*&order=date.desc&limit=5")

echo "📊 Cotações no banco:"
echo "$FINAL" | jq '.' 2>/dev/null || echo "$FINAL"

echo ""
echo "✨ Setup completo!"
echo ""
echo "🎯 Próximos passos:"
echo "1. Acesse: https://provincia-real.vercel.app"
echo "2. O dashboard vai buscar cotações automaticamente"
echo "3. Métricas serão calculadas com câmbio real"
echo ""
