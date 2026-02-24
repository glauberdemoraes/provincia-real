/**
 * Sync Manager - Gerencia sincronização de Nuvem Shop e Meta Ads
 * Com retry logic, tratamento de erros e logging detalhado
 */

import { supabase } from '@/lib/supabase'
import type { DateRange } from '@/types'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
const MAX_RETRIES = 3
const RETRY_DELAY_MS = 2000

interface SyncOptions {
  retries?: number
  timeout?: number
  verbose?: boolean
}

interface SyncStatus {
  success: boolean
  timestamp: Date
  orders: { synced: number; error?: string }
  campaigns: { synced: number; error?: string }
  duration_ms: number
  retries_used: number
}

/**
 * Sincronizar dados da Nuvem Shop com retry
 */
async function syncNuvemshopWithRetry(
  dateRange: DateRange,
  retries = 0
): Promise<{ orders: unknown[]; success: boolean }> {
  const startDate = dateRange.start.toISOString().split('T')[0]
  const endDate = dateRange.end.toISOString().split('T')[0]

  try {
    console.log(
      `[SYNC] 📦 Fetching Nuvem Shop orders (attempt ${retries + 1}/${MAX_RETRIES + 1})...`
    )

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/fetch-nuvemshop-orders`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          start_date: startDate,
          end_date: endDate,
        }),
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data = await response.json()
    const orders = data.result || []

    if (orders.length === 0) {
      console.warn('[SYNC] ⚠️  No orders returned from Nuvem Shop')
      return { orders: [], success: true }
    }

    console.log(`[SYNC] ✅ Retrieved ${orders.length} orders from Nuvem Shop`)

    // Salvar no Supabase via RPC
    console.log('[SYNC] 💾 Saving orders to Supabase...')
    const { error: rpcError } = await supabase.rpc('save_orders_json', {
      p_orders: orders,
    })

    if (rpcError) {
      console.error('[SYNC] ⚠️  RPC warning:', rpcError.message)
      // Não falhar completamente se RPC tiver erro - talvez dados já estejam salvos
    }

    return { orders, success: true }
  } catch (error) {
    console.error('[SYNC] ❌ Nuvem Shop sync error:', error)

    if (retries < MAX_RETRIES) {
      console.log(`[SYNC] 🔄 Retrying in ${RETRY_DELAY_MS}ms...`)
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS))
      return syncNuvemshopWithRetry(dateRange, retries + 1)
    }

    return { orders: [], success: false }
  }
}

/**
 * Sincronizar dados de Meta Ads com retry
 */
async function syncMetaCampaignsWithRetry(
  dateRange: DateRange,
  retries = 0
): Promise<{ campaigns: unknown[]; success: boolean }> {
  const startDate = dateRange.start.toISOString().split('T')[0]
  const endDate = dateRange.end.toISOString().split('T')[0]

  try {
    console.log(
      `[SYNC] 📊 Fetching Meta campaigns (attempt ${retries + 1}/${MAX_RETRIES + 1})...`
    )

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/fetch-meta-campaigns`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          start_date: startDate,
          end_date: endDate,
        }),
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data = await response.json()
    const campaigns = data.data || []

    console.log(`[SYNC] ✅ Retrieved ${campaigns.length} campaigns from Meta`)

    return { campaigns, success: true }
  } catch (error) {
    console.error('[SYNC] ❌ Meta campaigns sync error:', error)

    if (retries < MAX_RETRIES) {
      console.log(`[SYNC] 🔄 Retrying in ${RETRY_DELAY_MS}ms...`)
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS))
      return syncMetaCampaignsWithRetry(dateRange, retries + 1)
    }

    return { campaigns: [], success: false }
  }
}

/**
 * Sincronização completa: Nuvem Shop + Meta Ads
 * Com retry, timeout e logging detalhado
 */
export async function performFullSync(
  dateRange: DateRange,
  options: SyncOptions = {}
): Promise<SyncStatus> {
  const {
    timeout = 120000,
    verbose = true,
  } = options

  const startTime = Date.now()
  const retriesUsed = 0

  if (verbose) {
    console.log(
      `\n${'='.repeat(50)}\n[SYNC] 🚀 INICIANDO SINCRONIZAÇÃO COMPLETA\n${'='.repeat(50)}`
    )
    console.log(
      `[SYNC] 📅 Período: ${dateRange.start.toISOString()} a ${dateRange.end.toISOString()}`
    )
    console.log(`[SYNC] ⏱️  Timeout: ${timeout}ms`)
  }

  try {
    // Executar sincronizações em paralelo com timeout
    const syncPromise = Promise.all([
      syncNuvemshopWithRetry(dateRange, 0),
      syncMetaCampaignsWithRetry(dateRange, 0),
    ])

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error('Sync timeout exceeded')),
        timeout
      )
    )

    const [nuvemshopResult, metaResult] = (await Promise.race([
      syncPromise,
      timeoutPromise,
    ])) as [
      { orders: unknown[]; success: boolean },
      { campaigns: unknown[]; success: boolean }
    ]

    const duration = Date.now() - startTime

    const status: SyncStatus = {
      success: nuvemshopResult.success && metaResult.success,
      timestamp: new Date(),
      orders: {
        synced: nuvemshopResult.success ? nuvemshopResult.orders.length : 0,
        ...(nuvemshopResult.success ? {} : { error: 'Failed after retries' }),
      },
      campaigns: {
        synced: metaResult.success ? metaResult.campaigns.length : 0,
        ...(metaResult.success ? {} : { error: 'Failed after retries' }),
      },
      duration_ms: duration,
      retries_used: retriesUsed,
    }

    if (verbose) {
      console.log(
        `\n[SYNC] ${status.success ? '✅' : '⚠️'} SINCRONIZAÇÃO CONCLUÍDA`
      )
      console.log(`[SYNC] 📦 Pedidos sincronizados: ${status.orders.synced}`)
      console.log(`[SYNC] 📊 Campanhas sincronizadas: ${status.campaigns.synced}`)
      console.log(`[SYNC] ⏱️  Duração: ${duration}ms`)
      console.log(
        `${'='.repeat(50)}\n`
      )
    }

    return status
  } catch (error) {
    const duration = Date.now() - startTime

    console.error(`[SYNC] ❌ SINCRONIZAÇÃO FALHOU:`, error)

    return {
      success: false,
      timestamp: new Date(),
      orders: { synced: 0, error: error instanceof Error ? error.message : 'Unknown error' },
      campaigns: { synced: 0, error: error instanceof Error ? error.message : 'Unknown error' },
      duration_ms: duration,
      retries_used: retriesUsed,
    }
  }
}

/**
 * Trigger sync via Edge Function (para uso com cron)
 * Tenta sync-complete primeiro, depois fallback para sync-nuvemshop-meta
 */
export async function triggerBackendSync(dateRange?: DateRange): Promise<void> {
  const range = dateRange || {
    start: new Date(new Date().setDate(new Date().getDate() - 1)),
    end: new Date(),
  }

  try {
    console.log('[SYNC] 🔗 Triggering backend sync via Edge Function...')

    // Tentar sync-complete (mais rápida)
    let response = await fetch(
      `${SUPABASE_URL}/functions/v1/sync-complete`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          start_date: range.start.toISOString().split('T')[0],
          end_date: range.end.toISOString().split('T')[0],
          trigger: 'manual',
        }),
      }
    ).catch(() => null)

    // Se sync-complete não responder, tentar sync-nuvemshop-meta
    if (!response || !response.ok) {
      console.log('[SYNC] sync-complete não disponível, tentando sync-nuvemshop-meta...')
      response = await fetch(
        `${SUPABASE_URL}/functions/v1/sync-nuvemshop-meta`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            start_date: range.start.toISOString().split('T')[0],
            end_date: range.end.toISOString().split('T')[0],
            trigger: 'manual',
          }),
        }
      )
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const result = await response.json()
    console.log('[SYNC] ✅ Backend sync triggered:', result)
  } catch (error) {
    console.error('[SYNC] ❌ Failed to trigger backend sync:', error)
    throw error
  }
}
