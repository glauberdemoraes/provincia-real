const https = require('https');
const fs = require('fs');

const SUPABASE_URL = 'prnshbkblddfgttsgxpt.supabase.co';
const TOKEN = 'sbp_918272d9db25c6800e4dcbbf5c3c8a6df212b4f3';

const migrationsSQL = fs.readFileSync('./supabase/MIGRATIONS_COMBINED.sql', 'utf8');

console.log('🔐 Usando token pessoal do Supabase\n');

// Tentar endpoint de query SQL
const path = '/rest/v1/sql';

const payload = JSON.stringify({
  query: migrationsSQL
});

const options = {
  hostname: SUPABASE_URL,
  path: path,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${TOKEN}`,
    'X-Supabase-Auth-Token': TOKEN,
    'Content-Length': Buffer.byteLength(payload)
  }
};

console.log(`📤 POST ${SUPABASE_URL}${path}`);
console.log(`📏 Payload: ${(Buffer.byteLength(payload) / 1024).toFixed(2)} KB\n`);

const req = https.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => { data += chunk; });
  
  res.on('end', () => {
    console.log(`Status: ${res.statusCode}\n`);
    
    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log('✅ Sucesso!\n');
      console.log('Resposta:', data.substring(0, 500));
    } else if (res.statusCode === 404) {
      console.log('⚠️  Endpoint não encontrado');
      console.log('Tentando alternativa...\n');
      
      // Tentar usar query endpoint
      tryAlternative();
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

function tryAlternative() {
  console.log('💡 Sugestão: Use o dashboard Supabase manualmente\n');
  console.log('1. Acesse: https://app.supabase.com/project/prnshbkblddfgttsgxpt/sql');
  console.log('2. Copie o arquivo: ./supabase/MIGRATIONS_COMBINED.sql');
  console.log('3. Cole no SQL Editor');
  console.log('4. Clique em "Run"\n');
}
