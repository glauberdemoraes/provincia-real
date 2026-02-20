import fetch from 'node-fetch'
import fs from 'fs'

const SUPABASE_URL = 'https://prnshbkblddfgttsgxpt.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybnNoYmtibGRkZmd0dHNneHB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MzE1MTAsImV4cCI6MjA4NTMwNzUxMH0.HPUfckX6OfqbWu1MvZIs0bZaYRf58n84MRCrpRk-7og'

// SQL a executar
const SQL = `
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
`

async function executeSQL() {
  console.log('🔧 Executando migration no Supabase...\n')

  try {
    // Tentar criar tabela via REST API (insert na tabela)
    // Primeiro, verificar se tabela existe tentando fazer uma query
    console.log('1️⃣  Verificando se tabela exchange_rates existe...')
    
    const checkResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/exchange_rates?select=*&limit=0`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    )

    if (checkResponse.status === 404) {
      console.log('❌ Tabela não existe. Executando criação...\n')
      
      // Tentar via RPC se disponível
      console.log('⚠️  A tabela precisa ser criada via SQL Editor do Supabase.')
      console.log('📋 Siga os passos:\n')
      console.log('1. Abra: https://supabase.com/dashboard/project/prnshbkblddfgttsgxpt/sql/new')
      console.log('2. Cole o SQL abaixo e clique RUN\n')
      console.log('---SQL START---')
      console.log(SQL)
      console.log('---SQL END---\n')
      process.exit(1)
    }

    // Tabela existe, tentar inserir cotação
    console.log('✅ Tabela exchange_rates já existe!\n')
    
    const today = new Date().toISOString().split('T')[0]
    console.log(`2️⃣  Inserindo cotação USD/BRL para ${today}...`)

    const insertResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/exchange_rates`,
      {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates',
        },
        body: JSON.stringify({
          date: today,
          usd_brl: 4.97,
          source: 'awesomeapi',
        }),
      }
    )

    if (insertResponse.ok) {
      console.log('✅ Cotação inserida com sucesso!\n')
      
      // Verificar dados
      const dataResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/exchange_rates?select=*&order=date.desc&limit=5`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          },
        }
      )

      const data = await dataResponse.json()
      console.log('📊 Últimas cotações:')
      console.log(JSON.stringify(data, null, 2))
      console.log('\n✨ Setup concluído!')
      console.log('🚀 Dashboard pronto para usar em: https://provincia-real.vercel.app')
    } else {
      console.error('❌ Erro ao inserir cotação:', await insertResponse.text())
      process.exit(1)
    }
  } catch (error) {
    console.error('❌ Erro:', error.message)
    console.log('\n💡 Se a tabela não existe, execute manualmente:')
    console.log('1. https://supabase.com/dashboard/project/prnshbkblddfgttsgxpt/sql/new')
    console.log('2. Cole o SQL em SETUP_SUPABASE.md')
    process.exit(1)
  }
}

executeSQL()
