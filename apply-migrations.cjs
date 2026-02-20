const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const SUPABASE_URL = 'https://prnshbkblddfgttsgxpt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybnNoYmtibGRkZmd0dHNneHB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MzE1MTAsImV4cCI6MjA4NTMwNzUxMH0.HPUfckX6OfqbWu1MvZIs0bZaYRf58n84MRCrpRk-7og';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

(async () => {
  try {
    console.log('📋 Lendo arquivo de migrations...');
    const migrationsSQL = fs.readFileSync('./supabase/MIGRATIONS_COMBINED.sql', 'utf8');
    console.log(`✅ ${migrationsSQL.length} caracteres lidos\n`);

    console.log('⚠️  Supabase REST API (ANON_KEY) não permite executar SQL arbitrário');
    console.log('🔐 Motivo: Risco de segurança (SQL injection, privilege escalation)\n');

    console.log('✅ SOLUÇÕES DISPONÍVEIS:\n');
    console.log('1️⃣  USE SUPABASE CLI (Recomendado):');
    console.log('   npm install -g supabase');
    console.log('   supabase login');
    console.log('   supabase db push\n');

    console.log('2️⃣  USE SUPABASE DASHBOARD (Manual):');
    console.log('   1. Ir para https://app.supabase.com/project/{id}/sql');
    console.log('   2. Copiar conteúdo de ./supabase/MIGRATIONS_COMBINED.sql');
    console.log('   3. Colar no SQL Editor e clique em "Run"\n');

    console.log('3️⃣  USE SERVICE_ROLE_KEY (Se tiver):');
    console.log('   - Requer token pessoal do Supabase (não público)\n');

  } catch (err) {
    console.error('❌ Erro:', err.message);
  }
})();
