import { useState, useEffect } from 'react'
import { Activity, TrendingUp, ShoppingCart, Percent, Wallet, Megaphone, BarChart2 } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { useTimezone } from '@/contexts/TimezoneContext'
import { fetchOrders, fetchMetaCampaigns } from '@/services/api'
import { calculateDashboardMetrics } from '@/services/metrics'
import { getTodayRange_LA, getTodayRange_BR } from '@/lib/timezone'
import { getUsdToBrl } from '@/services/exchangeRate'
import type { DashboardData } from '@/types'

const REFRESH_INTERVAL = 60000 // 60 segundos

export default function Realtime() {
  const { theme } = useTheme()
  const { timeZoneMode } = useTimezone()
  const [metrics, setMetrics] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL / 1000)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Atualizar horário a cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Carregar dados e configurar auto-refresh
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        // Usar período do dia no timezone configurado
        const { start, end, label } = timeZoneMode === 'BR' ? getTodayRange_BR() : getTodayRange_LA()
        const dateRange = { start, end, label }

        const orders = await fetchOrders(dateRange)
        const campaigns = await fetchMetaCampaigns(dateRange)
        const exchangeRate = await getUsdToBrl(new Date())

        const dashboardMetrics = await calculateDashboardMetrics(orders, campaigns, exchangeRate, dateRange, timeZoneMode)
        setMetrics(dashboardMetrics)
      } catch (error) {
        console.error('Erro ao carregar dados realtime:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()

    // Setup countdown e refresh automático
    let countdownInterval: ReturnType<typeof setInterval> | null = null

    const scheduleRefresh = () => {
      setCountdown(REFRESH_INTERVAL / 1000)

      countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (countdownInterval) clearInterval(countdownInterval)
            loadData()
            return REFRESH_INTERVAL / 1000
          }
          return prev - 1
        })
      }, 1000)
    }

    scheduleRefresh()

    return () => {
      if (countdownInterval) clearInterval(countdownInterval)
    }
  }, [timeZoneMode])

  const getProfitColor = (profit: number): string => {
    if (profit > 0) return 'text-emerald-400'
    if (profit < 0) return 'text-rose-400'
    return 'text-zinc-400'
  }

  const getRoasColor = (roas: number): string => {
    if (roas >= 3) return 'text-emerald-400'
    if (roas >= 1) return 'text-yellow-400'
    return 'text-rose-400'
  }

  const timeString = currentTime.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: timeZoneMode === 'BR' ? 'America/Sao_Paulo' : 'America/Los_Angeles',
  })

  if (loading && !metrics) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <div className="text-center">
          <Activity className="w-16 h-16 mx-auto mb-4 animate-spin text-blue-500" />
          <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-slate-50' : 'text-slate-900'}`}>Carregando dados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-950 text-slate-50' : 'bg-white text-slate-900'} overflow-hidden`}>
      {/* Badge LIVE pulsante */}
      <div className="fixed top-6 right-6 z-50 flex items-center gap-2">
        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
        <span className="text-sm font-bold text-red-500">LIVE</span>
      </div>

      {/* Header com horário */}
      <div className={`border-b ${theme === 'dark' ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-slate-50'} p-8`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-bold mb-2">Provincia Real</h1>
            <p className={`text-lg ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              {timeZoneMode === 'LA' ? 'Los Angeles • UTC-8' : 'São Paulo • UTC-3'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-6xl font-bold font-mono text-blue-500 mb-2">{timeString}</div>
            <div className={`text-lg font-semibold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              Próxima atualização em {countdown}s
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-8 space-y-8">
        {metrics ? (
          <>
            {/* Seção 1: KPIs Principais (4 colunas, tamanho grande) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Receita Paga */}
              <div className={`rounded-2xl p-8 border-2 ${theme === 'dark' ? 'bg-slate-900 border-blue-800' : 'bg-blue-50 border-blue-300'}`}>
                <div className="flex items-center justify-between mb-6">
                  <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                    Receita Paga
                  </p>
                  <TrendingUp className="w-8 h-8 text-blue-500" />
                </div>
                <p className="text-5xl font-bold text-blue-500 mb-2">
                  R$ {(metrics.revenue.paid / 1000).toFixed(1)}k
                </p>
                <p className={`text-sm ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>
                  {metrics.orders.paid} pedidos
                </p>
              </div>

              {/* Pedidos Pagos */}
              <div className={`rounded-2xl p-8 border-2 ${theme === 'dark' ? 'bg-slate-900 border-emerald-800' : 'bg-emerald-50 border-emerald-300'}`}>
                <div className="flex items-center justify-between mb-6">
                  <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                    Pedidos Pagos
                  </p>
                  <ShoppingCart className="w-8 h-8 text-emerald-500" />
                </div>
                <p className="text-5xl font-bold text-emerald-500 mb-2">{metrics.orders.paid}</p>
                <p className={`text-sm ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>
                  Ticket: R$ {(metrics.orders.paid > 0 ? metrics.revenue.paid / metrics.orders.paid : 0).toFixed(0)}
                </p>
              </div>

              {/* ROAS */}
              <div className={`rounded-2xl p-8 border-2 ${theme === 'dark' ? 'bg-slate-900 border-yellow-800' : 'bg-yellow-50 border-yellow-300'}`}>
                <div className="flex items-center justify-between mb-6">
                  <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                    ROAS
                  </p>
                  <BarChart2 className="w-8 h-8 text-yellow-500" />
                </div>
                <p className={`text-5xl font-bold mb-2 ${getRoasColor(metrics.roas)}`}>
                  {metrics.roas.toFixed(2)}x
                </p>
                <p className={`text-sm ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>
                  Return on Ad Spend
                </p>
              </div>

              {/* ROI */}
              <div className={`rounded-2xl p-8 border-2 ${theme === 'dark' ? 'bg-slate-900 border-purple-800' : 'bg-purple-50 border-purple-300'}`}>
                <div className="flex items-center justify-between mb-6">
                  <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                    ROI
                  </p>
                  <Percent className="w-8 h-8 text-purple-500" />
                </div>
                <p className={`text-5xl font-bold mb-2 ${getProfitColor(metrics.roi)}`}>
                  {metrics.roi.toFixed(1)}%
                </p>
                <p className={`text-sm ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>
                  Retorno sobre Investimento
                </p>
              </div>
            </div>

            {/* Seção 2: Lucro Líquido (destaque hero) */}
            <div className={`rounded-2xl p-10 border-3 ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-300'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-2xl font-semibold mb-4 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                    Lucro Líquido
                  </p>
                  <p className={`text-6xl font-bold ${getProfitColor(metrics.profit.net)}`}>
                    R$ {(metrics.profit.net / 1000).toFixed(1)}k
                  </p>
                </div>
                <Wallet className={`w-20 h-20 ${getProfitColor(metrics.profit.net)}`} />
              </div>
            </div>

            {/* Seção 3: Top Campanhas */}
            <div>
              <h3 className="text-3xl font-bold mb-6">Top Campanhas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {metrics.campaigns.slice(0, 3).map((campaign, idx) => (
                  <div
                    key={idx}
                    className={`rounded-2xl p-6 border-2 ${
                      theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <p className={`text-sm font-semibold mb-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                          {campaign.campaign_name}
                        </p>
                        <p className="text-2xl font-bold">{campaign.orders} pedidos</p>
                      </div>
                      <Megaphone className="w-6 h-6 text-blue-500 flex-shrink-0" />
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className={theme === 'dark' ? 'text-slate-500' : 'text-slate-600'}>Vendas:</span>
                        <span className="font-semibold">R$ {(campaign.sales / 1000).toFixed(1)}k</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={theme === 'dark' ? 'text-slate-500' : 'text-slate-600'}>ROAS:</span>
                        <span className={`font-semibold ${getRoasColor(campaign.roas)}`}>{campaign.roas.toFixed(2)}x</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={theme === 'dark' ? 'text-slate-500' : 'text-slate-600'}>Lucro:</span>
                        <span className={`font-semibold ${getProfitColor(campaign.profit)}`}>
                          R$ {(campaign.profit / 1000).toFixed(1)}k
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rodapé com informações */}
            <div className={`rounded-lg p-4 text-center text-sm ${theme === 'dark' ? 'text-slate-500' : 'text-slate-600'}`}>
              Dados sincronizados • NuvemShop + Meta Ads • Taxa: R$ {metrics.exchangeRate.toFixed(2)}/USD
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-2xl">Nenhum dado disponível</p>
          </div>
        )}
      </div>
    </div>
  )
}
