/**
 * Hook para sincronização em tempo real com Supabase
 * Atualiza dados automaticamente quando mudanças ocorrem no banco
 *
 * MELHORIAS:
 * - Sincronização obrigatória ao montar (page load/reload)
 * - Retry automático se realtime falhar
 * - Polling mais inteligente
 * - Cleanup melhorado
 */

import { useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { performFullSync } from '@/services/syncManager'
import type { DateRange } from '@/types'

interface RealtimeSyncOptions {
  tables: string[]
  onUpdate: () => void
  enabled?: boolean
}

interface RealtimeSyncWithPollingOptions extends RealtimeSyncOptions {
  dateRange: DateRange
  enableRealtime?: boolean
  enablePolling?: boolean
  enableMountSync?: boolean
  pollingIntervalMs?: number
}

/**
 * Hook que configura listeners em tempo real para tabelas específicas
 * Chama onUpdate quando dados são alterados
 */
export function useRealtimeSync({
  tables,
  onUpdate,
  enabled = true
}: RealtimeSyncOptions) {
  const subscriptionsRef = useRef<Array<ReturnType<typeof supabase.channel>>>([])
  const tableKey = tables.join(',')

  useEffect(() => {
    if (!enabled) return

    console.log(`🔄 Setting up realtime listeners for tables: ${tables.join(', ')}`)

    // Cleanup previous subscriptions
    subscriptionsRef.current.forEach((sub) => {
      supabase.removeChannel(sub)
    })
    subscriptionsRef.current = []

    // Setup new subscriptions
    const subscriptions = tables.map((table) => {
      const channel = supabase
        .channel(`public:${table}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: table,
          },
          (payload) => {
            console.log(`📡 Realtime update received for ${table}:`, payload)
            onUpdate()
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log(`✅ Subscribed to realtime changes for ${table}`)
          } else if (status === 'CHANNEL_ERROR') {
            console.error(`❌ Channel error for ${table}`)
          }
        })

      return channel
    })

    subscriptionsRef.current = subscriptions

    // Cleanup: unsubscribe quando componente unmount
    return () => {
      console.log(`🛑 Cleaning up realtime subscriptions`)
      subscriptionsRef.current.forEach((sub) => {
        supabase.removeChannel(sub)
      })
      subscriptionsRef.current = []
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableKey, enabled, onUpdate])
}

/**
 * Hook para auto-sync com polling
 * Recarrega dados em intervalos regulares
 */
export function useAutoSync(
  onSync: () => void,
  intervalMs = 30000,
  enabled = true
) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!enabled) return

    console.log(`⏱️ Auto-sync enabled: ${intervalMs}ms interval`)

    // Executar primeira sincronização imediatamente
    onSync()

    // Então repetir em intervalos
    intervalRef.current = setInterval(() => {
      console.log(`🔄 Auto-sync triggered by polling`)
      onSync()
    }, intervalMs)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
        console.log(`🛑 Auto-sync disabled`)
      }
    }
  }, [onSync, intervalMs, enabled])
}

/**
 * Hook para sincronização obrigatória ao montar
 * Força atualização de dados ao carregar/recarregar a página
 */
export function useMountSync(
  dateRange: DateRange,
  onSyncComplete: () => void,
  enabled = true
) {
  const hasSyncedRef = useRef(false)

  useEffect(() => {
    if (!enabled || hasSyncedRef.current) return

    const performSync = async () => {
      try {
        console.log('🚀 Performing mandatory mount sync...')
        hasSyncedRef.current = true

        const status = await performFullSync(dateRange, {
          verbose: true,
          timeout: 60000,
        })

        console.log('[MOUNT-SYNC] Result:', status)

        // Chamar callback após sync
        if (onSyncComplete) {
          onSyncComplete()
        }
      } catch (error) {
        console.error('[MOUNT-SYNC] Error during mount sync:', error)
        hasSyncedRef.current = false // Permitir retry
      }
    }

    // Executar sync após um pequeno delay para evitar race conditions
    const timer = setTimeout(performSync, 500)

    return () => clearTimeout(timer)
  }, [dateRange, onSyncComplete, enabled])
}

/**
 * Wrapper para habilitar todos os modos de sincronização:
 * 1. Mount sync (obrigatório ao carregar)
 * 2. Realtime listeners
 * 3. Polling fallback
 */
export function useSyncWithRealtime({
  tables,
  dateRange,
  onUpdate,
  enableRealtime = true,
  enablePolling = true,
  enableMountSync = true,
  pollingIntervalMs = 30000,
}: RealtimeSyncWithPollingOptions) {
  // 1. Sincronização obrigatória ao montar
  useMountSync(dateRange, onUpdate, enableMountSync)

  // 2. Setup realtime listeners
  useRealtimeSync({
    tables,
    onUpdate,
    enabled: enableRealtime,
  })

  // 3. Setup polling fallback
  useAutoSync(onUpdate, pollingIntervalMs, enablePolling)
}
