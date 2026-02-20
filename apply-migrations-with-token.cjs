const https = require('https');
const fs = require('fs');

const SUPABASE_URL = 'https://prnshbkblddfgttsgxpt.supabase.co';
const TOKEN = 'sbp_918272d9db25c6800e4dcbbf5c3c8a6df212b4f3';

const migrationsSQL = fs.readFileSync('./supabase/MIGRATIONS_COMBINED.sql', 'utf8');

console.log('🚀 Iniciando aplicação de migrations com token pessoal...\n');

// Fazer request para executar SQL
const url = new URL(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`);

const payload = JSON.stringify({
  sql: migrationsSQL
});

const options = {
  hostname: url.hostname,
  path: '/rest/v1/rpc/exec_sql',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${TOKEN}`,
    'apikey': TOKEN,
    'Content-Length': Buffer.byteLength(payload)
  }
};

console.log('📤 Enviando para: ' + SUPABASE_URL);
console.log(`📏 Tamanho: ${(Buffer.byteLength(payload) / 1024).toFixed(2)} KB\n`);

const req = https.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => { data += chunk; });
  
  res.on('end', () => {
    console.log(`\n📊 Resposta: ${res.statusCode}`);
    
    if (res.statusCode === 200) {
      console.log('✅ Migrations aplicadas com sucesso!\n');
      try {
        const result = JSON.parse(data);
        console.log('📋 Resultado:', JSON.stringify(result, null, 2));
      } catch {
        console.log('📋 Resposta:', data);
      }
    } else if (res.statusCode === 404) {
      console.log('\n⚠️  RPC function não existe no banco.');
      console.log('💡 Alternativa: Usar dashboard SQL Editor manualmente');
      console.log('📌 URL: https://app.supabase.com/project/prnshbkblddfgttsgxpt/sql\n');
    } else {
      console.log(`\n❌ Erro ${res.statusCode}`);
      console.log('📋 Detalhes:', data);
    }
  });
});

req.on('error', (err) => {
  console.error('❌ Erro na conexão:', err.message);
});

req.write(payload);
req.end();
