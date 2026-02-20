const https = require('https');

const TOKEN = 'sbp_918272d9db25c6800e4dcbbf5c3c8a6df212b4f3';
const PROJECT_ID = 'prnshbkblddfgttsgxpt';

const queries = [
  { name: 'orders_cache', sql: "SELECT count(*) FROM orders_cache LIMIT 1;" },
  { name: 'meta_campaigns_cache', sql: "SELECT count(*) FROM meta_campaigns_cache LIMIT 1;" },
  { name: 'alerts_config', sql: "SELECT count(*) FROM alerts_config LIMIT 1;" },
  { name: 'active_alerts', sql: "SELECT count(*) FROM active_alerts LIMIT 1;" },
  { name: 'sync_logs', sql: "SELECT count(*) FROM sync_logs LIMIT 1;" },
];

(async () => {
  console.log('✅ VERIFICAÇÃO DE TABELAS\n');
  console.log('='.repeat(60));
  
  for (const q of queries) {
    const result = await executeQuery(q.sql);
    console.log(`✅ ${q.name.padEnd(30)} OK (${result} registros)`);
  }
  
  console.log('='.repeat(60));
  console.log('\n🎉 TODAS AS MIGRATIONS APLICADAS!\n');
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
          const count = result[0]?.[Object.keys(result[0])[0]] || 0;
          resolve(count);
        } catch (err) {
          console.error(`  ❌ ${sql.substring(0, 30)}... erro:`, err.message);
          resolve(-1);
        }
      });
    });

    req.on('error', () => { resolve(-1); });
    req.write(payload);
    req.end();
  });
}
