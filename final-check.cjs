const https = require('https');

const TOKEN = 'sbp_918272d9db25c6800e4dcbbf5c3c8a6df212b4f3';
const PROJECT_ID = 'prnshbkblddfgttsgxpt';

// Checklist completo
const checks = [
  { name: 'orders_cache', sql: "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_name='orders_cache';" },
  { name: 'meta_campaigns_cache', sql: "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_name='meta_campaigns_cache';" },
  { name: 'sync_orders_to_cache (RPC)', sql: "SELECT COUNT(*) as count FROM information_schema.routines WHERE routine_name='sync_orders_to_cache';" },
  { name: 'sync_meta_to_cache (RPC)', sql: "SELECT COUNT(*) as count FROM information_schema.routines WHERE routine_name='sync_meta_to_cache';" },
  { name: 'alerts_config', sql: "SELECT COUNT(*) as count FROM alerts_config;" },
  { name: 'daily_sales_summary (VIEW)', sql: "SELECT COUNT(*) as count FROM information_schema.views WHERE table_name='daily_sales_summary';" },
];

(async () => {
  console.log('✅ VALIDAÇÃO DE MIGRATIONS\n');
  console.log('='.repeat(60));
  
  let allOk = true;
  
  for (const check of checks) {
    const result = await executeQuery(check.sql);
    const ok = result > 0;
    allOk = allOk && ok;
    
    const status = ok ? '✅' : '❌';
    console.log(`${status} ${check.name.padEnd(35)} ${ok ? 'EXISTE' : 'FALTANDO'}`);
  }
  
  console.log('='.repeat(60));
  
  if (allOk) {
    console.log('\n🎉 TODAS AS MIGRATIONS APLICADAS COM SUCESSO!\n');
    console.log('📊 Próximas ações:');
    console.log('  1. Testar sincronização de orders');
    console.log('  2. Verificar se utm_campaign está preenchido');
    console.log('  3. Abrir dashboard e verificar campanhas matcheando');
  } else {
    console.log('\n⚠️  Algumas migrations faltam');
  }
})();

async function executeQuery(sql) {
  return new Promise((resolve) => {
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
        try {
          const result = JSON.parse(data);
          const count = result.result?.rows?.[0]?.count || 0;
          resolve(count);
        } catch (err) {
          resolve(0);
        }
      });
    });

    req.on('error', () => { resolve(0); });
    req.write(payload);
    req.end();
  });
}
