import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getTodayRange_BR, getTodayRange_LA } from '@/lib/timezone'
import type { NuvemshopOrder, MetaCampaign } from '@/types'

interface RefreshButtonProps {
  onRefreshComplete?: () => void
  timeZoneMode?: 'BR' | 'LA'
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

/**
 * Força sincronização com Edge Functions e salva no Supabase
 * Isso garante que dados recentes (segundos/minutos atrás) sejam capturados
 */
async function forceFullSync(range: { start: Date; end: Date }): Promise<{
  orders: NuvemshopOrder[]
  campaigns: MetaCampaign[]
}> {
  const startStr = range.start.toISOString().split('T')[0]
  const endStr = range.end.toISOString().split('T')[0]

  console.log('🔄 Iniciando sincronização forçada com Edge Functions...')

  try {
    // 1. Sync Orders (NuvemShop → Edge Function → RPC → Supabase)
    console.log('📦 Sincronizando pedidos da Nuvem Shop...')
    const ordersResponse = await fetch(
      `${SUPABASE_URL}/functions/v1/fetch-nuvemshop-orders`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          start_date: startStr,
          end_date: endStr,
        }),
      }
    )

    if (!ordersResponse.ok) {
      throw new Error(`Orders sync failed: ${ordersResponse.status}`)
    }

    const ordersData = await ordersResponse.json()
    const orders = ordersData.result || []
    console.log(`✅ Edge Function retornou ${orders.length} pedidos`)

    // 1b. Salvar no Supabase via RPC (importante para sincronizar)
    if (orders.length > 0) {
      console.log('💾 Salvando pedidos no Supabase via RPC...')
      const { error: rpcError } = await supabase.rpc('save_orders_json', {
        p_orders: orders,
      })

      if (rpcError) {
        console.warn('⚠️  RPC warning (pode ser config):', rpcError)
      } else {
        console.log('✅ Pedidos salvos no Supabase')
      }
    }

    // 2. Sync Campaigns (Meta Ads → Edge Function → Supabase cache)
    console.log('📊 Sincronizando campanhas Meta Ads...')
    const campaignsResponse = await fetch(
      `${SUPABASE_URL}/functions/v1/fetch-meta-campaigns`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          start_date: startStr,
          end_date: endStr,
        }),
      }
    )

    if (!campaignsResponse.ok) {
      throw new Error(`Campaigns sync failed: ${campaignsResponse.status}`)
    }

    const campaignsData = await campaignsResponse.json()
    const campaigns = campaignsData.data || []
    console.log(`✅ Edge Function retornou ${campaigns.length} campanhas`)

    // 3. Buscar dados atualizados do Supabase (garantir que estão lá)
    console.log('🔍 Buscando dados atualizados do Supabase...')
    const { data: cachedOrders } = await supabase
      .from('orders_cache')
      .select('*')
      .gte('order_created_at', range.start.toISOString())
      .lte('order_created_at', range.end.toISOString())
      .order('order_created_at', { ascending: false })

    console.log(`✅ Supabase retornou ${cachedOrders?.length || 0} pedidos do cache`)

    return {
      orders: cachedOrders || orders,
      campaigns: campaigns,
    }
  } catch (error) {
    console.error('❌ Sync failure:', error)
    throw error
  }
}

export const RefreshButton: React.FC<RefreshButtonProps> = ({ onRefreshComplete, timeZoneMode = 'LA' }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const handleRefresh = async () => {
    try {
      setIsLoading(true)

      // Get today's range
      const dateRange = timeZoneMode === 'BR' ? getTodayRange_BR() : getTodayRange_LA()

      console.log('🔄 Iniciando refresh manual completo...')
      console.log(`📅 Período: ${dateRange.start.toISOString()} a ${dateRange.end.toISOString()}`)

      // Forçar sincronização completa com Edge Functions
      const syncResult = await forceFullSync(dateRange)
      console.log(`✅ Sincronização concluída: ${syncResult.orders.length} pedidos, ${syncResult.campaigns.length} campanhas`)

      // Update last refresh time
      setLastRefresh(new Date())

      // Call callback to update parent component
      if (onRefreshComplete) {
        onRefreshComplete()
      }
    } catch (error) {
      console.error('❌ Refresh falhou:', error)
      alert('❌ Erro ao sincronizar. Verifique o console para mais detalhes.')
    } finally {
      setIsLoading(false)
    }
  }

  const formatLastRefresh = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleRefresh}
        disabled={isLoading}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
          isLoading
            ? 'bg-blue-600 dark:bg-blue-700 text-white opacity-75 cursor-not-allowed'
            : 'bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-800 active:scale-95'
        }`}
        title={isLoading ? 'Sincronizando...' : 'Atualizar dados de Nuvem Shop e Meta Ads'}
      >
        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        {isLoading ? 'Sincronizando...' : 'Atualizar'}
      </button>

      {lastRefresh && (
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          Última atualização: {formatLastRefresh(lastRefresh)}
        </span>
      )}
    </div>
  )
}
