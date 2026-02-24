#!/usr/bin/env node

/**
 * Serviço de Sincronização Automática - Provincia Real
 *
 * Executa sincronização a cada 30 minutos
 * Mantém SSH ativo sem sobrecarregar
 *
 * Uso:
 *   node sync-service.mjs
 *   npm run sync:service (se configurado)
 */

import fetch from 'node-fetch'
import cron from 'node-cron'
import fs from 'fs'

const SUPABASE_URL = 'https://prnshbkblddfgttsgxpt.supabase.co'
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybnNoYmtibGRkZmd0dHNneHB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MzE1MTAsImV4cCI6MjA4NTMwNzUxMH0.HPUfckX6OfqbWu1MvZIs0bZaYRf58n84MRCrpRk-7og'

const LOG_FILE = '.sync-service.log'
const STATUS_FILE = '.sync-service-status.json'

// Cores para console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
}

function log(message, color = 'reset') {
  const timestamp = new Date().toISOString()
  const formatted = `[${timestamp}] ${message}`

  console.log(`${colors[color]}${formatted}${colors.reset}`)

  // Salvar em arquivo
  fs.appendFileSync(LOG_FILE, formatted + '\n')
}

function saveStatus(status) {
  fs.writeFileSync(STATUS_FILE, JSON.stringify(status, null, 2))
}

async function performSync() {
  const startTime = Date.now()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 1)
  startDate.setHours(0, 0, 0, 0)

  const endDate = new Date()
  endDate.setHours(23, 59, 59, 999)

  const startDateStr = startDate.toISOString().split('T')[0]
  const endDateStr = endDate.toISOString().split('T')[0]

  try {
    log(
      `🔄 Iniciando sincronização (${startDateStr} a ${endDateStr})...`,
      'blue'
    )

    // Tentar sync-complete (melhor opção)
    let response = await fetch(`${SUPABASE_URL}/functions/v1/sync-complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ANON_KEY}`,
      },
      body: JSON.stringify({
        start_date: startDateStr,
        end_date: endDateStr,
        trigger: 'auto-sync-service',
      }),
      timeout: 60000,
    }).catch((err) => {
      log(`⚠️  sync-complete não disponível: ${err.message}`, 'yellow')
      return null
    })

    // Fallback para sync-nuvemshop-meta
    if (!response || !response.ok) {
      log('Tentando sync-nuvemshop-meta...', 'yellow')
      response = await fetch(`${SUPABASE_URL}/functions/v1/sync-nuvemshop-meta`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ANON_KEY}`,
        },
        body: JSON.stringify({
          start_date: startDateStr,
          end_date: endDateStr,
          trigger: 'auto-sync-service',
        }),
        timeout: 60000,
      }).catch((err) => {
        log(`❌ Ambas funções falharam: ${err.message}`, 'red')
        return null
      })
    }

    if (!response) {
      throw new Error('Unable to reach any sync function')
    }

    const data = await response.json()
    const duration = Date.now() - startTime

    if (response.ok && data.success) {
      log(
        `✅ Sincronização completa! (${duration}ms) Orders: ${data.orders?.count || 0}, Campaigns: ${data.campaigns?.count || 0}`,
        'green'
      )

      saveStatus({
        lastSync: new Date().toISOString(),
        success: true,
        ordersCount: data.orders?.count || 0,
        campaignsCount: data.campaigns?.count || 0,
        duration: duration,
      })

      return true
    } else {
      throw new Error(data.error || 'Sync returned false')
    }
  } catch (error) {
    const duration = Date.now() - startTime
    log(`❌ Erro na sincronização (${duration}ms): ${error.message}`, 'red')

    saveStatus({
      lastSync: new Date().toISOString(),
      success: false,
      error: error.message,
      duration: duration,
    })

    return false
  }
}

async function main() {
  log('═══════════════════════════════════════════════════════', 'bright')
  log('  Serviço de Sincronização - Provincia Real', 'bright')
  log('═══════════════════════════════════════════════════════', 'bright')
  log('')

  // Executar sync na startup
  log('📍 Sincronização inicial...', 'blue')
  await performSync()
  log('')

  // Agendar para cada 30 minutos
  log('⏰ Próximas sincronizações: a cada 30 minutos', 'blue')
  log('🛡️  Serviço será mantido ativo (sem SSH drop)', 'blue')
  log('')

  // Cron: a cada 30 minutos (*/30 * * * *)
  cron.schedule('*/30 * * * *', async () => {
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue')
    await performSync()
  })

  // Heartbeat a cada 1 minuto (para manter SSH ativo)
  cron.schedule('* * * * *', () => {
    // Silencioso, só para manter conexão viva
  })

  log('✨ Serviço iniciado com sucesso!', 'green')
  log('Pressione Ctrl+C para parar', 'blue')
  log('')

  // Tratar Ctrl+C gracefully
  process.on('SIGINT', () => {
    log('', 'reset')
    log('═══════════════════════════════════════════════════════', 'bright')
    log('  Parando serviço de sincronização...', 'yellow')
    log('═══════════════════════════════════════════════════════', 'bright')
    process.exit(0)
  })
}

main()
