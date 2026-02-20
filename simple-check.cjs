const https = require('https');

const TOKEN = 'sbp_918272d9db25c6800e4dcbbf5c3c8a6df212b4f3';
const PROJECT_ID = 'prnshbkblddfgttsgxpt';

// Query simples
const sql = "SELECT 'orders_cache'::text as table_name;";

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

console.log('🔍 Testando conexão com Management API...\n');

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('📊 Status:', res.statusCode);
    console.log('📋 Resposta:', JSON.stringify(JSON.parse(data), null, 2));
  });
});

req.on('error', (err) => {
  console.error('❌ Erro:', err.message);
});

req.write(payload);
req.end();
