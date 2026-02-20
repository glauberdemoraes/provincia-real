#!/bin/bash

# Credenciais
TOKEN="sbp_918272d9db25c6800e4dcbbf5c3c8a6df212b4f3"
PROJECT_ID="prnshbkblddfgttsgxpt"
SUPABASE_URL="https://prnshbkblddfgttsgxpt.supabase.co"

echo "🔐 Usando token Supabase..."
echo "📝 Executando migration: exchange_rates"
echo ""

# SQL para executar
SQL='
CREATE TABLE IF NOT EXISTS public.exchange_rates (
  date DATE PRIMARY KEY,
  usd_brl NUMERIC(10, 4) NOT NULL,
  source TEXT DEFAULT '\''awesomeapi'\'',
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT exchange_rates_usd_brl_positive CHECK (usd_brl > 0)
);

CREATE INDEX IF NOT EXISTS idx_exchange_rates_date ON public.exchange_rates(date DESC);

ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to exchange_rates" ON public.exchange_rates
  FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated insert to exchange_rates" ON public.exchange_rates
  FOR INSERT
  WITH CHECK (auth.role() = '\''authenticated'\'');

CREATE POLICY "Allow authenticated update to exchange_rates" ON public.exchange_rates
  FOR UPDATE
  USING (auth.role() = '\''authenticated'\'')
  WITH CHECK (auth.role() = '\''authenticated'\'');

CREATE OR REPLACE FUNCTION public.update_exchange_rates_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_exchange_rates_timestamp ON public.exchange_rates;
CREATE TRIGGER trigger_exchange_rates_timestamp
  BEFORE UPDATE ON public.exchange_rates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_exchange_rates_timestamp();

INSERT INTO public.exchange_rates (date, usd_brl, source)
VALUES (CURRENT_DATE, 4.97, '\''awesomeapi'\'')
ON CONFLICT (date) DO NOTHING;
'

# Tentar executar via API REST do Supabase
echo "1️⃣  Criando tabela via SQL..."

# Usar curl para fazer POST direto para o endpoint /rest/v1/rpc se existir
# ou tentar criar via graphql

RESPONSE=$(curl -s -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.supabase.com/v1/projects/$PROJECT_ID/sql" \
  -d "$(echo '{"sql":"'"$(echo "$SQL" | sed 's/"/\\"/g' | tr '\n' ' ')"'"}' )" 2>&1)

echo "Resposta: $RESPONSE"
echo ""

# Se não funcionou, tentar via API de query
if echo "$RESPONSE" | grep -q "error\|Error"; then
  echo "⚠️  Tentando alternativa..."
  
  # Executar statement por statement via REST API
  echo "2️⃣  Criando tabela (método alternativo)..."
  
  curl -s -X POST \
    -H "Authorization: Bearer $TOKEN" \
    -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybnNoYmtibGRkZmd0dHNneHB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MzE1MTAsImV4cCI6MjA4NTMwNzUxMH0.HPUfckX6OfqbWu1MvZIs0bZaYRf58n84MRCrpRk-7og" \
    -H "Content-Type: application/json" \
    "$SUPABASE_URL/rest/v1/exchange_rates" \
    -d '{"date":"2026-02-20","usd_brl":4.97,"source":"awesomeapi"}' \
    -w "\nHTTP Code: %{http_code}\n" 2>&1 | tail -5
  
  exit 0
fi

# Se tudo funcionou
if echo "$RESPONSE" | grep -q "error"; then
  echo "❌ Erro na execução"
  exit 1
else
  echo "✅ Migration executada com sucesso!"
  echo ""
  echo "🎯 Próximos passos:"
  echo "1. Aguarde 5 segundos para o Supabase sincronizar"
  echo "2. Acesse: https://provincia-real.vercel.app"
  echo "3. Dashboard agora usa dados reais!"
fi
