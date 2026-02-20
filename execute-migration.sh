#!/bin/bash

TOKEN="sbp_918272d9db25c6800e4dcbbf5c3c8a6df212b4f3"
PROJECT_ID="prnshbkblddfgttsgxpt"

echo "🚀 Executando migration via Supabase CLI..."
echo ""

# Salvar SQL em arquivo
cat > migration.sql << 'SQLEOF'
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

CREATE POLICY "Allow public read access to exchange_rates" ON public.exchange_rates
  FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated insert to exchange_rates" ON public.exchange_rates
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update to exchange_rates" ON public.exchange_rates
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

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
VALUES (CURRENT_DATE, 4.97, 'awesomeapi')
ON CONFLICT (date) DO NOTHING;
SQLEOF

echo "1️⃣  Autenticando..."

# Tentar usar supabase CLI via token
# Se não tiver CLI, tentar instalar
if ! command -v supabase &> /dev/null; then
  echo "2️⃣  Instalando Supabase CLI..."
  
  # Tentar download direto do binário
  OS=$(uname -s)
  ARCH=$(uname -m)
  
  if [ "$OS" = "Linux" ] && [ "$ARCH" = "x86_64" ]; then
    echo "   Baixando binário para Linux x64..."
    curl -fsSL "https://github.com/supabase/cli/releases/download/v1.225.3/supabase_linux_amd64" -o supabase
    chmod +x supabase
    SUPABASE_CMD="./supabase"
  else
    echo "   ❌ Plataforma não suportada via curl"
    echo "   Usando método alternativo..."
    SUPABASE_CMD="npx -y @supabase/cli"
  fi
else
  SUPABASE_CMD="supabase"
fi

echo "3️⃣  Executando SQL..."

# Tentar executar a migration
$SUPABASE_CMD --version 2>/dev/null || echo "⚠️  CLI não disponível"

# Usar curl direto com token para executar a migration
# Tentar via API REST do Supabase com bearer token
echo "4️⃣  Enviando migration via API..."

curl -s -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.supabase.com/v1/projects/$PROJECT_ID/sql" \
  --data-binary @migration.sql \
  -w "\nHTTP: %{http_code}\n" | head -20

echo ""
echo "✅ Migration enviada!"
echo ""
echo "⏱️  Aguardando 10 segundos para sincronização..."
sleep 10

echo ""
echo "🎉 Pronto!"
echo "📍 Acesse: https://provincia-real.vercel.app"
echo ""

# Limpar
rm -f migration.sql
