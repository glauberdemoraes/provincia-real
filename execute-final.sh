#!/bin/bash

TOKEN="sbp_918272d9db25c6800e4dcbbf5c3c8a6df212b4f3"
PROJECT_ID="prnshbkblddfgttsgxpt"

echo "🔐 Executando migration no Supabase com token..."
echo ""

# SQL como string (escapado para JSON)
SQL="CREATE TABLE IF NOT EXISTS public.exchange_rates (date DATE PRIMARY KEY, usd_brl NUMERIC(10, 4) NOT NULL, source TEXT DEFAULT 'awesomeapi', fetched_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(), CONSTRAINT exchange_rates_usd_brl_positive CHECK (usd_brl > 0)); CREATE INDEX IF NOT EXISTS idx_exchange_rates_date ON public.exchange_rates(date DESC); ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY; CREATE POLICY \"Allow public read access to exchange_rates\" ON public.exchange_rates FOR SELECT USING (true); CREATE POLICY \"Allow authenticated insert to exchange_rates\" ON public.exchange_rates FOR INSERT WITH CHECK (auth.role() = 'authenticated'); CREATE POLICY \"Allow authenticated update to exchange_rates\" ON public.exchange_rates FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated'); CREATE OR REPLACE FUNCTION public.update_exchange_rates_timestamp() RETURNS TRIGGER AS \$\$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; \$\$ LANGUAGE plpgsql; DROP TRIGGER IF EXISTS trigger_exchange_rates_timestamp ON public.exchange_rates; CREATE TRIGGER trigger_exchange_rates_timestamp BEFORE UPDATE ON public.exchange_rates FOR EACH ROW EXECUTE FUNCTION public.update_exchange_rates_timestamp(); INSERT INTO public.exchange_rates (date, usd_brl, source) VALUES (CURRENT_DATE, 4.97, 'awesomeapi') ON CONFLICT (date) DO NOTHING;"

echo "1️⃣  Enviando SQL ao Supabase..."

# Fazer POST com SQL como JSON
RESPONSE=$(curl -s -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.supabase.com/v1/projects/$PROJECT_ID/sql" \
  -d "{\"sql\":\"$SQL\"}")

echo "Resposta: $RESPONSE" | head -200

if echo "$RESPONSE" | grep -q "error\|Error\|message"; then
  echo ""
  echo "⚠️  API retornou resposta. Tentando verificação..."
  
  # Tentar verificar se tabela foi criada via REST API
  echo ""
  echo "2️⃣  Verificando se tabela foi criada..."
  
  ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybnNoYmtibGRkZmd0dHNneHB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MzE1MTAsImV4cCI6MjA4NTMwNzUxMH0.HPUfckX6OfqbWu1MvZIs0bZaYRf58n84MRCrpRk-7og"
  
  CHECK=$(curl -s \
    -H "apikey: $ANON_KEY" \
    "https://prnshbkblddfgttsgxpt.supabase.co/rest/v1/exchange_rates?select=*&limit=1" \
    -w "\nHTTP: %{http_code}")
  
  HTTP_CODE=$(echo "$CHECK" | tail -n1)
  BODY=$(echo "$CHECK" | head -n-1)
  
  if [ "$HTTP_CODE" = "HTTP: 200" ]; then
    echo "✅ Tabela EXISTE!"
    echo ""
    echo "📊 Dados:"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
  else
    echo "❌ Tabela não existe ainda ($HTTP_CODE)"
    echo "Body: $BODY"
  fi
else
  echo "✅ SQL Executado!"
fi

echo ""
echo "🎉 Migration concluída!"
echo "📍 Dashboard: https://provincia-real.vercel.app"
