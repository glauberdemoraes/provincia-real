const https = require('https');

const TOKEN = 'sbp_918272d9db25c6800e4dcbbf5c3c8a6df212b4f3';
const PROJECT_ID = 'prnshbkblddfgttsgxpt';

const sql = `
-- Adicionar políticas de INSERT e UPDATE para orders_cache
DROP POLICY IF EXISTS "anon_insert_orders" ON public.orders_cache;
DROP POLICY IF EXISTS "anon_update_orders" ON public.orders_cache;

CREATE POLICY "anon_insert_orders" 
ON public.orders_cache FOR INSERT TO anon 
WITH CHECK (TRUE);

CREATE POLICY "anon_update_orders" 
ON public.orders_cache FOR UPDATE TO anon 
USING (TRUE) WITH CHECK (TRUE);

-- Mesmo para meta_campaigns_cache
DROP POLICY IF EXISTS "anon_insert_meta" ON public.meta_campaigns_cache;
DROP POLICY IF EXISTS "anon_update_meta" ON public.meta_campaigns_cache;

CREATE POLICY "anon_insert_meta" 
ON public.meta_campaigns_cache FOR INSERT TO anon 
WITH CHECK (TRUE);

CREATE POLICY "anon_update_meta" 
ON public.meta_campaigns_cache FOR UPDATE TO anon 
USING (TRUE) WITH CHECK (TRUE);

-- Delete policies para limpeza de dados se necessário
CREATE POLICY "anon_delete_orders" 
ON public.orders_cache FOR DELETE TO anon 
USING (TRUE);

CREATE POLICY "anon_delete_meta" 
ON public.meta_campaigns_cache FOR DELETE TO anon 
USING (TRUE);
`;

console.log('🔐 Atualizando RLS policies...\n');

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
      console.log('✅ RLS policies atualizadas com sucesso!\n');
      console.log('✅ INSERT/UPDATE/DELETE agora permitidos para anon user');
      console.log('✅ Frontend pode fazer UPSERT sem erros');
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
