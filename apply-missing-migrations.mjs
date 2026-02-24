#!/usr/bin/env node

/**
 * Aplica migrations faltantes via Supabase SQL Editor
 * - save_orders_json RPC
 * - customer_ltv_all view
 * - exchange_rates RLS fix
 */

import fs from 'fs'

const SUPABASE_URL = 'https://prnshbkblddfgttsgxpt.supabase.co'
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybnNoYmtibGRkZmd0dHNneHB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MzE1MTAsImV4cCI6MjA4NTMwNzUxMH0.HPUfckX6OfqbWu1MvZIs0bZaYRf58n84MRCrpRk-7og'

console.log('📝 APLICANDO MIGRATIONS FALTANTES')
console.log('═'.repeat(50))
console.log('')

// Ler o arquivo de migration
const migrationSql = fs.readFileSync('./supabase/migrations/20260224000002_fix_save_orders_rpc.sql', 'utf8')

// Remover comentários e BEGIN/COMMIT para executar comando por comando
const sqlStatements = migrationSql
  .split(';')
  .map(stmt => stmt.trim())
  .filter(stmt => stmt && !stmt.startsWith('--') && stmt !== 'BEGIN' && stmt !== 'COMMIT')

console.log(`📋 ${sqlStatements.length} statements encontrados`)
console.log('')

async function executeSQL(sql) {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ANON_KEY}`,
      },
      body: JSON.stringify({ query: sql }),
    })

    if (!response.ok) {
      const error = await response.json()
      return { success: false, error, status: response.status }
    }

    return { success: true, data: await response.json() }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

async function main() {
  console.log('⚠️  ATENÇÃO: Para aplicar as migrations, execute no SQL Editor do Supabase:')
  console.log('')
  console.log('1. Abrir: https://app.supabase.com/project/prnshbkblddfgttsgxpt/sql')
  console.log('2. Colar o SQL abaixo:')
  console.log('')
  console.log('─'.repeat(50))
  console.log('')
  console.log(migrationSql)
  console.log('')
  console.log('─'.repeat(50))
  console.log('')
  console.log('3. Clicar em "Run"')
  console.log('')
  console.log('✅ Após executar, os pedidos serão salvos corretamente no Supabase!')
  console.log('')

  // Verificar se conseguimos executar via API
  console.log('🧪 Tentando via API REST...')
  console.log('')

  // Executar uma migration simples primeiro
  const testSQL = `
    SELECT EXISTS (
      SELECT 1 FROM pg_proc
      WHERE proname = 'save_orders_json'
    ) as function_exists
  `

  const result = await executeSQL(testSQL)

  if (result.success) {
    console.log('✅ Conexão com Supabase OK')
    console.log('ℹ️  Função save_orders_json:', result.data[0]?.function_exists ? 'JÁ EXISTE' : 'NÃO ENCONTRADA')
  } else {
    console.log('❌ Não foi possível executar via API')
    console.log('   Status:', result.status)
    console.log('   Erro:', result.error?.message || result.error)
  }

  console.log('')
  console.log('📝 Arquivo de migration criado:')
  console.log('   supabase/migrations/20260224000002_fix_save_orders_rpc.sql')
  console.log('')
  console.log('🚀 Próximo passo: Executar no SQL Editor do Supabase')
}

main().catch(console.error)
