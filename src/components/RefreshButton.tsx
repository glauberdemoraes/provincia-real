import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { fetchOrders, fetchMetaCampaigns } from '@/services/api'
import { getTodayRange_BR, getTodayRange_LA } from '@/lib/timezone'

interface RefreshButtonProps {
  onRefreshComplete?: () => void
  timeZoneMode?: 'BR' | 'LA'
}

export const RefreshButton: React.FC<RefreshButtonProps> = ({ onRefreshComplete, timeZoneMode = 'LA' }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const handleRefresh = async () => {
    try {
      setIsLoading(true)

      // Get today's range
      const dateRange = timeZoneMode === 'BR' ? getTodayRange_BR() : getTodayRange_LA()

      console.log('🔄 Starting manual refresh...')
      console.log(`📅 Period: ${dateRange.start.toISOString()} to ${dateRange.end.toISOString()}`)

      // Fetch orders from NuvemShop → Supabase
      console.log('📦 Fetching NuvemShop orders...')
      const orders = await fetchOrders(dateRange)
      console.log(`✅ Synced ${orders.length} orders`)

      // Fetch campaigns from Meta Ads
      console.log('📊 Fetching Meta campaigns...')
      const campaigns = await fetchMetaCampaigns(dateRange)
      console.log(`✅ Synced ${campaigns.length} campaigns`)

      // Update last refresh time
      setLastRefresh(new Date())

      console.log('✅ Refresh complete!')

      // Call callback to update parent component
      if (onRefreshComplete) {
        onRefreshComplete()
      }
    } catch (error) {
      console.error('❌ Refresh failed:', error)
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
