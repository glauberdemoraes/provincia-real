const https = require('https');
const fs = require('fs');

const TOKEN = 'sbp_918272d9db25c6800e4dcbbf5c3c8a6df212b4f3';
const PROJECT_ID = 'prnshbkblddfgttsgxpt';

const migrationsSQL = fs.readFileSync('./supabase/MIGRATIONS_COMBINED.sql', 'utf8');

console.log('🔐 Usando Management API com token pessoal...\n');

// Supabase Management API - PostgreSQL SQL endpoint
const path = `/v1/projects/${PROJECT_ID}/database/query`;

const payload = JSON.stringify({
  query: migrationsSQL
});

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

console.log(`📤 POST api.supabase.com${path}`);
console.log(`📏 Payload: ${(Buffer.byteLength(payload) / 1024).toFixed(2)} KB\n`);

const req = https.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => { data += chunk; });
  
  res.on('end', () => {
    console.log(`📊 Status: ${res.statusCode}\n`);
    
    if (res.statusCode === 200 || res.statusCode === 201) {
      console.log('✅ Migrations aplicadas com SUCESSO!\n');
      try {
        const result = JSON.parse(data);
        console.log('✅ Resultado:', JSON.stringify(result, null, 2));
      } catch {
        console.log('✅ Resposta:', data);
      }
    } else if (res.statusCode === 404) {
      console.log('⚠️  Endpoint não encontrado');
      console.log('Detalhes:', data);
    } else {
      console.log('❌ Erro:', data.substring(0, 500));
    }
  });
});

req.on('error', (err) => {
  console.error('❌ Erro na requisição:', err.message);
});

req.write(payload);
req.end();
