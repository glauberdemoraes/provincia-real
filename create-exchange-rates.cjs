const https = require('https');

const TOKEN = 'sbp_918272d9db25c6800e4dcbbf5c3c8a6df212b4f3';
const PROJECT_ID = 'prnshbkblddfgttsgxpt';

const sql = `
-- Criar tabela exchange_rates
CREATE TABLE IF NOT EXISTS public.exchange_rates (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    usd_brl NUMERIC(10, 4) NOT NULL,
    source TEXT DEFAULT 'bcb',
    fetched_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exchange_rates_date ON public.exchange_rates(date DESC);

-- RLS
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_read_exchange_rates" ON public.exchange_rates FOR SELECT TO anon USING (TRUE);

-- Seed com cotação de hoje (2026-02-20)
INSERT INTO public.exchange_rates (date, usd_brl) VALUES ('2026-02-20', 5.25)
ON CONFLICT (date) DO UPDATE SET usd_brl = 5.25, updated_at = NOW();
`;

console.log('📊 Criando tabela exchange_rates...\n');

const path = `/v1/projects/${PROJECT_ID}/database/query`;
const payload = JSON.stringify({ query: sql });

const options = {
  hostname: 'api.supabase.com',
  path: path,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Length': Buffer.byteLength(payload)
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log(`📊 Status: ${res.statusCode}`);
    
    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log('✅ Tabela exchange_rates criada com sucesso!');
      console.log('✅ Seed inserido para 2026-02-20 (USD/BRL = 5.25)\n');
    } else {
      console.log('❌ Erro:', data);
    }
  });
});

req.on('error', (err) => {
  console.error('❌ Erro:', err.message);
});

req.write(payload);
req.end();
