import { createClient } from '@supabase/supabase-js'

const url = 'https://prnshbkblddfgttsgxpt.supabase.co'
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybnNoYmtibGRkZmd0dHNneHB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MzE1MTAsImV4cCI6MjA4NTMwNzUxMH0.HPUfckX6OfqbWu1MvZIs0bZaYRf58n84MRCrpRk-7og'

const supabase = createClient(url, anonKey)

console.log('🔧 Setup Supabase - Exchange Rates\n')

// Paso 1: Testar conexão
console.log('1️⃣  Testando conexão ao Supabase...')
try {
  const { data, error } = await supabase.from('nuvemshop_orders').select('*').limit(1)
  
  if (!error) {
    console.log('✅ Conexão OK\n')
  } else if (error.code === 'PGRST204') {
    console.log('✅ Conexão OK (tabela vazia)\n')
  } else {
    throw error
  }
} catch (e) {
  console.error('❌ Erro na conexão:', e.message)
  process.exit(1)
}

// Paso 2: Tentar acessar exchange_rates
console.log('2️⃣  Verificando tabela exchange_rates...')
try {
  const { data, error } = await supabase.from('exchange_rates').select('*').limit(1)
  
  if (error && error.code === 'PGRST205') {
    // Tabela não existe - precisa ser criada
    console.log('❌ Tabela não existe\n')
    console.log('⚠️  Execute manualmente no SQL Editor do Supabase:\n')
    console.log('📋 URL: https://supabase.com/dashboard/project/prnshbkblddfgttsgxpt/sql/new\n')
    console.log('Copy & paste este SQL completo:\n')
    console.log('---')
    
    const sql = `CREATE TABLE IF NOT EXISTS public.exchange_rates (
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

INSERT INTO public.exchange_rates (date, usd_brl, source)
VALUES (CURRENT_DATE, 4.97, 'awesomeapi')
ON CONFLICT (date) DO NOTHING;`
    
    console.log(sql)
    console.log('---\n')
    console.log('Depois clique em RUN (botão azul)')
    process.exit(1)
  }
  
  if (!error) {
    console.log('✅ Tabela existe!\n')
    console.log('📊 Dados atuais:')
    console.log(JSON.stringify(data, null, 2))
    
    // Tentar inserir cotação do dia
    const today = new Date().toISOString().split('T')[0]
    const { error: insertError } = await supabase.from('exchange_rates').insert({
      date: today,
      usd_brl: 4.97,
      source: 'awesomeapi'
    }).select()
    
    if (insertError && insertError.code !== 'PGRST204') {
      console.log('\n⚠️  Não consegui inserir (pode estar vazia):', insertError.message)
    } else {
      console.log('\n✅ Cotação do dia inserida/atualizada')
    }
  }
} catch (e) {
  console.error('❌ Erro:', e.message)
  process.exit(1)
}

console.log('\n✨ Setup concluído!')
console.log('🚀 Dashboard pronto em: https://provincia-real.vercel.app')
