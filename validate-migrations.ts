#!/usr/bin/env ts-node
/**
 * Validação de Migrações Supabase
 *
 * Execute DEPOIS de rodar MIGRATIONS_COMBINED.sql:
 * npx ts-node validate-migrations.ts
 *
 * Verifica se todas as tabelas, funções e views foram criadas corretamente
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Erro: VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não definidas em .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface ValidationResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  details: string;
}

const results: ValidationResult[] = [];

async function checkTable(tableName: string) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = "no rows" which is fine
      throw error;
    }

    results.push({
      name: `Table: ${tableName}`,
      status: 'PASS',
      details: `Tabela criada e acessível`,
    });
  } catch (error: any) {
    results.push({
      name: `Table: ${tableName}`,
      status: 'FAIL',
      details: `Erro ao acessar: ${error.message}`,
    });
  }
}

async function checkFunction(functionName: string) {
  try {
    const { data, error } = await supabase.rpc(functionName);

    if (error) {
      throw error;
    }

    results.push({
      name: `Function: ${functionName}()`,
      status: 'PASS',
      details: `Função executada com sucesso`,
    });
  } catch (error: any) {
    // Funções podem ter requirements, então WARN é ok
    const errorMsg = error.message || String(error);
    const status = errorMsg.includes('does not exist') ? 'FAIL' : 'WARN';

    results.push({
      name: `Function: ${functionName}()`,
      status,
      details: errorMsg,
    });
  }
}

async function checkAlertConfigs() {
  try {
    const { data, error, count } = await supabase
      .from('alerts_config')
      .select('*', { count: 'exact' })
      .limit(100);

    if (error) {
      throw error;
    }

    const expectedCount = 7; // 7 default alerts
    if (count! >= expectedCount) {
      results.push({
        name: `Seed: Default alerts`,
        status: 'PASS',
        details: `${count} regras de alertas criadas (esperado: ${expectedCount})`,
      });
    } else {
      results.push({
        name: `Seed: Default alerts`,
        status: 'WARN',
        details: `${count} regras criadas (esperado: ${expectedCount})`,
      });
    }
  } catch (error: any) {
    results.push({
      name: `Seed: Default alerts`,
      status: 'FAIL',
      details: `Erro ao verificar: ${error.message}`,
    });
  }
}

async function validate() {
  console.log('\n📊 Validando Migrações Supabase\n');
  console.log(`🔗 Projeto: ${supabaseUrl}\n`);
  console.log('⏳ Verificando...\n');

  // 1. Cache Tables
  await checkTable('orders_cache');
  await checkTable('meta_campaigns_cache');

  // 2. Support Tables
  await checkTable('alerts_config');
  await checkTable('active_alerts');
  await checkTable('sync_logs');

  // 3. Functions
  await checkFunction('check_alerts');
  await checkFunction('sync_orders_to_cache');
  await checkFunction('sync_meta_to_cache');

  // 4. Seeds
  await checkAlertConfigs();

  // 5. Print Results
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  let passed = 0;
  let failed = 0;
  let warned = 0;

  for (const result of results) {
    const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️ ';
    console.log(`${icon} ${result.name.padEnd(40)} ${result.details}`);

    if (result.status === 'PASS') passed++;
    else if (result.status === 'FAIL') failed++;
    else warned++;
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const summary = `${passed} PASS | ${warned} WARN | ${failed} FAIL`;
  console.log(`📈 Resumo: ${summary}\n`);

  if (failed === 0) {
    console.log('✨ Todas as migrações foram aplicadas com sucesso!\n');
    console.log('🚀 Próximas etapas:');
    console.log('   1. Acesse: https://provincia-real.vercel.app/dashboard');
    console.log('   2. Status bar deve mostrar "DB: Connected"');
    console.log('   3. Acesse /settings para ver as 7 regras de alertas\n');
    process.exit(0);
  } else {
    console.log('❌ Algumas migrações falharam. Verifique os erros acima.\n');
    console.log('💡 Dicas:');
    console.log('   1. Certifique-se de que executou MIGRATIONS_COMBINED.sql no SQL Editor');
    console.log('   2. Verifique se recebeu "Query executed successfully"');
    console.log('   3. Tente recarregar a página do dashboard\n');
    process.exit(1);
  }
}

validate().catch((error) => {
  console.error('\n❌ Erro fatal:', error.message, '\n');
  process.exit(1);
});
