const https = require('https');

const TOKEN = 'sbp_918272d9db25c6800e4dcbbf5c3c8a6df212b4f3';
const PROJECT_ID = 'prnshbkblddfgttsgxpt';

const queries = [
  { name: '📋 Tabelas existentes', sql: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;" },
  { name: '🔧 Functions/RPC', sql: "SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public' ORDER BY routine_name;" },
  { name: '⚡ Triggers', sql: "SELECT trigger_name, event_object_table FROM information_schema.triggers WHERE trigger_schema = 'public' ORDER BY event_object_table;" },
];

(async () => {
  for (const query of queries) {
    console.log(`\n${query.name}:`);
    console.log('='.repeat(50));
    
    await executeQuery(query.sql);
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
          if (result.result && result.result.rows) {
            result.result.rows.forEach(row => {
              console.log('  ✓', Object.values(row).join(' | '));
            });
            if (result.result.rows.length === 0) {
              console.log('  (nenhum resultado)');
            }
          } else {
            console.log('  ', data.substring(0, 200));
          }
        } catch (err) {
          console.log('  Error:', data.substring(0, 200));
        }
        resolve();
      });
    });

    req.on('error', (err) => {
      console.error('  ❌ Erro:', err.message);
      resolve();
    });

    req.write(payload);
    req.end();
  });
}
