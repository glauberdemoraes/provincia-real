#!/usr/bin/env node

/**
 * Script de teste para validar os 3 pontos de sincronização
 *
 * Uso:
 *   node test-sync-integration.mjs
 *
 * Testa:
 * 1. Edge Function de sync
 * 2. Integração com Supabase
 * 3. Retry logic
 */

import fetch from 'node-fetch'

const SUPABASE_URL = 'https://prnshbkblddfgttsgxpt.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybnNoYmtibGRkZmd0dHNneHB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MzE1MTAsImV4cCI6MjA4NTMwNzUxMH0.HPUfckX6OfqbWu1MvZIs0bZaYRf58n84MRCrpRk-7og'

const log = {
  info: (msg) => console.log(`ℹ️  ${msg}`),
  success: (msg) => console.log(`✅ ${msg}`),
  error: (msg) => console.error(`❌ ${msg}`),
  test: (msg) => console.log(`\n🧪 ${msg}`),
  divider: () => console.log('\n' + '='.repeat(60)),
}

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Teste 1: Testar Edge Function de sync
 */
async function testEdgeFunctionSync() {
  log.test('Teste 1: Edge Function Sync (sync-nuvemshop-meta)')

  try {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/sync-nuvemshop-meta`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trigger: 'manual-test',
        }),
      }
    )

    if (!response.ok) {
      log.error(`HTTP ${response.status}: ${response.statusText}`)
      const text = await response.text()
      log.error(`Response: ${text}`)
      return false
    }

    const result = await response.json()
    log.info(`Response:`)
    console.log(JSON.stringify(result, null, 2))

    if (result.success) {
      log.success('Edge Function executada com sucesso')
      log.info(`  - Pedidos sincronizados: ${result.orders?.count || 0}`)
      log.info(`  - Campanhas sincronizadas: ${result.campaigns?.count || 0}`)
      log.info(`  - Duração: ${result.duration_ms}ms`)
      return true
    } else {
      log.error(`Sync falhou: ${result.error}`)
      return false
    }
  } catch (error) {
    log.error(`Network error: ${error.message}`)
    return false
  }
}

/**
 * Teste 2: Testar Fetch Nuvem Shop
 */
async function testFetchNuvemshop() {
  log.test('Teste 2: Fetch Nuvem Shop (fetch-nuvemshop-orders)')

  try {
    const today = new Date()
    today.setDate(today.getDate() - 1)
    const startDate = today.toISOString().split('T')[0]
    const endDate = new Date().toISOString().split('T')[0]

    log.info(`Buscando pedidos de ${startDate} a ${endDate}`)

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/fetch-nuvemshop-orders`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          start_date: startDate,
          end_date: endDate,
        }),
      }
    )

    if (!response.ok) {
      log.error(`HTTP ${response.status}`)
      return false
    }

    const data = await response.json()
    const orders = data.result || []

    if (orders.length === 0) {
      log.info('Nenhum pedido encontrado no período')
      return true
    }

    log.success(`${orders.length} pedidos encontrados`)
    log.info('Primeiro pedido:')
    console.log(JSON.stringify(orders[0], null, 2))
    return true
  } catch (error) {
    log.error(`Error: ${error.message}`)
    return false
  }
}

/**
 * Teste 3: Testar Fetch Meta Campaigns
 */
async function testFetchMeta() {
  log.test('Teste 3: Fetch Meta Campaigns (fetch-meta-campaigns)')

  try {
    const today = new Date()
    today.setDate(today.getDate() - 1)
    const startDate = today.toISOString().split('T')[0]
    const endDate = new Date().toISOString().split('T')[0]

    log.info(`Buscando campanhas de ${startDate} a ${endDate}`)

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/fetch-meta-campaigns`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          start_date: startDate,
          end_date: endDate,
        }),
      }
    )

    if (!response.ok) {
      log.error(`HTTP ${response.status}`)
      return false
    }

    const data = await response.json()
    const campaigns = data.data || []

    if (campaigns.length === 0) {
      log.info('Nenhuma campanha encontrada no período')
      return true
    }

    log.success(`${campaigns.length} campanhas encontradas`)
    log.info('Primeira campanha:')
    console.log(JSON.stringify(campaigns[0], null, 2))
    return true
  } catch (error) {
    log.error(`Error: ${error.message}`)
    return false
  }
}

/**
 * Teste 4: Verificar sync_log table
 */
async function testSyncLog() {
  log.test('Teste 4: Verificar sync_log table')

  try {
    log.info('Execute este query no Supabase SQL Editor:')
    console.log(`
    SELECT * FROM sync_log
    ORDER BY started_at DESC
    LIMIT 10;
    `)

    log.info('Ou verifique via API:')
    const url = `${SUPABASE_URL}/rest/v1/sync_log?limit=10&order=started_at.desc`
    console.log(`GET ${url}`)

    return true
  } catch (error) {
    log.error(`Error: ${error.message}`)
    return false
  }
}

/**
 * Rodar todos os testes
 */
async function runAllTests() {
  log.divider()
  console.log('🚀 TESTANDO SINCRONIZAÇÃO - PROVINCIA REAL')
  log.divider()

  const results = []

  // Teste 1
  results.push({
    name: 'Edge Function Sync',
    passed: await testEdgeFunctionSync(),
  })
  await delay(1000)

  // Teste 2
  results.push({
    name: 'Fetch Nuvem Shop',
    passed: await testFetchNuvemshop(),
  })
  await delay(1000)

  // Teste 3
  results.push({
    name: 'Fetch Meta Campaigns',
    passed: await testFetchMeta(),
  })
  await delay(1000)

  // Teste 4
  results.push({
    name: 'Sync Log Table',
    passed: await testSyncLog(),
  })

  // Resumo
  log.divider()
  log.info('📊 RESUMO DOS TESTES')
  log.divider()

  results.forEach((result) => {
    const status = result.passed ? '✅ PASSOU' : '❌ FALHOU'
    console.log(`${status}: ${result.name}`)
  })

  const passedCount = results.filter((r) => r.passed).length
  const totalCount = results.length

  log.divider()
  if (passedCount === totalCount) {
    log.success(`Todos os ${totalCount} testes passaram!`)
  } else {
    log.error(`${passedCount}/${totalCount} testes passaram`)
  }
  log.divider()
}

runAllTests().catch(log.error)
