#!/bin/bash

TOKEN="sbp_918272d9db25c6800e4dcbbf5c3c8a6df212b4f3"
PROJECT_ID="prnshbkblddfgttsgxpt"
SUPABASE_API="https://api.supabase.com/v1"
SUPABASE_URL="https://prnshbkblddfgttsgxpt.supabase.co"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybnNoYmtibGRkZmd0dHNneHB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MzE1MTAsImV4cCI6MjA4NTMwNzUxMH0.HPUfckX6OfqbWu1MvZIs0bZaYRf58n84MRCrpRk-7og"

echo "🔐 Executando migration no Supabase..."
echo ""

# Teste 1: Verificar se tabela já existe
echo "1️⃣  Verificando tabela exchange_rates..."

CHECK=$(curl -s \
  -H "apikey: $ANON_KEY" \
  "$SUPABASE_URL/rest/v1/exchange_rates?select=*&limit=1" \
  -w "\nHTTP:%{http_code}")

HTTP=$(echo "$CHECK" | grep "HTTP:" | cut -d: -f2)
BODY=$(echo "$CHECK" | grep -v "HTTP:")

if [ "$HTTP" = "200" ]; then
  echo "✅ Tabela JÁ EXISTE!"
  echo ""
  echo "📊 Dados:"
  echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
  echo ""
  echo "🎉 Pronto!"
  exit 0
fi

# Se não existe, tentar criar
echo "❌ Tabela não existe"
echo ""
echo "2️⃣  Criando tabela via API..."

# Usar jq para construir JSON válido
JSON=$(jq -n \
  --arg sql 'CREATE TABLE IF NOT EXISTS public.exchange_rates (date DATE PRIMARY KEY, usd_brl NUMERIC(10, 4) NOT NULL, source TEXT DEFAULT '\''awesomeapi'\'', fetched_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(), CONSTRAINT exchange_rates_usd_brl_positive CHECK (usd_brl > 0)); CREATE INDEX IF NOT EXISTS idx_exchange_rates_date ON public.exchange_rates(date DESC); ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY; CREATE POLICY "Allow public read access to exchange_rates" ON public.exchange_rates FOR SELECT USING (true); CREATE POLICY "Allow authenticated insert to exchange_rates" ON public.exchange_rates FOR INSERT WITH CHECK (auth.role() = '\''authenticated'\''); CREATE POLICY "Allow authenticated update to exchange_rates" ON public.exchange_rates FOR UPDATE USING (auth.role() = '\''authenticated'\'') WITH CHECK (auth.role() = '\''authenticated'\''); CREATE OR REPLACE FUNCTION public.update_exchange_rates_timestamp() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql; DROP TRIGGER IF EXISTS trigger_exchange_rates_timestamp ON public.exchange_rates; CREATE TRIGGER trigger_exchange_rates_timestamp BEFORE UPDATE ON public.exchange_rates FOR EACH ROW EXECUTE FUNCTION public.update_exchange_rates_timestamp(); INSERT INTO public.exchange_rates (date, usd_brl, source) VALUES (CURRENT_DATE, 4.97, '\''awesomeapi'\'') ON CONFLICT (date) DO NOTHING;' \
  '{sql: $sql}')

RESPONSE=$(curl -s -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  "$SUPABASE_API/projects/$PROJECT_ID/sql" \
  -d "$JSON")

echo "Resposta: $RESPONSE"
echo ""

# Aguardar sincronização
sleep 3

# Verificar novamente
echo "3️⃣  Verificando se foi criada..."

CHECK2=$(curl -s \
  -H "apikey: $ANON_KEY" \
  "$SUPABASE_URL/rest/v1/exchange_rates?select=*&limit=1")

if echo "$CHECK2" | grep -q "usd_brl"; then
  echo "✅ Tabela CRIADA COM SUCESSO!"
  echo ""
  echo "📊 Dados:"
  echo "$CHECK2" | jq '.'
else
  echo "⚠️  Tabela ainda não criada"
  echo ""
  echo "📋 Por favor, execute manualmente:"
  echo "1. Abra: https://supabase.com/dashboard/project/prnshbkblddfgttsgxpt/sql/new"
  echo "2. Cole: SUPABASE_EXECUTE_NOW.md"
  echo "3. Clique RUN"
fi

echo ""
echo "🎉 Setup concluído!"
echo "📍 Dashboard: https://provincia-real.vercel.app"
