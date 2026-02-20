import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Sun,
  Moon,
  BarChart3,
  TrendingUp,
  Clock,
  Settings as SettingsIcon,
  Package,
  Truck,
  Zap,
} from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { useTimezone } from '@/contexts/TimezoneContext'
import { AlertBanner } from '@/components/AlertBanner'
import { MetricCard } from '@/components/ui/MetricCard'
import { CampaignTable } from '@/components/CampaignTable'
import { checkAlerts } from '@/services/alerts'
import { fetchOrdersFromCache, fetchMetaFromCache, generateMockOrders } from '@/services/api'
import { calculateDashboardMetrics } from '@/services/metrics'
import { getTodayRange_LA } from '@/lib/timezone'
import { getUsdToBrl } from '@/services/exchangeRate'
import type { ActiveAlert, DashboardData } from '@/types'

type PeriodType = 'today' | '7d' | '30d' | 'month'

export default function Dashboard() {
  const { theme, toggleTheme } = useTheme()
  const { timeZoneMode, setTimeZoneMode } = useTimezone()
  const [alerts, setAlerts] = useState<ActiveAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<PeriodType>('today')
  const [metrics, setMetrics] = useState<DashboardData | null>(null)

  // Calcular range de datas baseado no período
  const getDateRange = (periodType: PeriodType): { start: Date; end: Date; label: string } => {
    const { start: today, end: todayEnd } = getTodayRange_LA()

    switch (periodType) {
      case 'today': {
        return { start: today, end: todayEnd, label: 'Hoje' }
      }
      case '7d': {
        const start = new Date(today)
        start.setDate(start.getDate() - 7)
        return { start, end: todayEnd, label: 'Últimos 7 dias' }
      }
      case '30d': {
        const start = new Date(today)
        start.setDate(start.getDate() - 30)
        return { start, end: todayEnd, label: 'Últimos 30 dias' }
      }
      case 'month': {
        const start = new Date(today)
        start.setDate(1)
        const end = new Date(today)
        end.setMonth(end.getMonth() + 1)
        end.setDate(0)
        end.setHours(23, 59, 59, 999)
        return {
          start,
          end,
          label: today.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
        }
      }
      default:
        return { start: today, end: todayEnd, label: 'Hoje' }
    }
  }

  // Carregar dados
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const dateRange = getDateRange(period)

        // Buscar dados do cache
        let orders = await fetchOrdersFromCache(dateRange)
        const campaigns = await fetchMetaFromCache(dateRange)

        // Se não houver dados no cache, gerar mock
        if (orders.length === 0) {
          orders = await generateMockOrders(dateRange.start, dateRange.end)
        }

        // Buscar taxa de câmbio do dia
        const exchangeRate = await getUsdToBrl(new Date())

        // Calcular métricas
        const dashboardMetrics = await calculateDashboardMetrics(
          orders,
          campaigns,
          exchangeRate,
          dateRange
        )

        setMetrics(dashboardMetrics)

        // Carregar alertas
        const result = await checkAlerts()
        setAlerts(result?.alerts || [])
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [period])

  // Botão de período
  const PeriodButton = ({ type, label }: { type: PeriodType; label: string }) => {
    const isActive = period === type
    return (
      <button
        onClick={() => setPeriod(type)}
        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
          isActive
            ? theme === 'dark'
              ? 'bg-blue-600 text-white'
              : 'bg-blue-500 text-white'
            : theme === 'dark'
              ? 'bg-slate-800 text-slate-400 hover:text-slate-300'
              : 'bg-slate-100 text-slate-600 hover:text-slate-900'
        }`}
      >
        {label}
      </button>
    )
  }

  return (
    <div
      className={`min-h-screen ${theme === 'dark' ? 'bg-slate-950 text-slate-50' : 'bg-slate-100 text-slate-900'} transition-colors`}
    >
      {/* Navbar */}
      <nav
        className={`fixed top-0 w-full z-40 ${theme === 'dark' ? 'bg-slate-900/90' : 'bg-white/90'} backdrop-blur-md border-b ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'} transition-colors`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'}`}>
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-lg font-bold">Provincia Real</h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Period Selector */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-200 dark:bg-slate-800 p-1 rounded-lg">
              <PeriodButton type="today" label="Hoje" />
              <PeriodButton type="7d" label="7d" />
              <PeriodButton type="30d" label="30d" />
              <PeriodButton type="month" label="Mês" />
            </div>

            {/* Timezone Toggle */}
            <div
              className={`${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'} p-1 rounded-xl flex items-center border ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}
            >
              <button
                onClick={() => setTimeZoneMode('LA')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${timeZoneMode === 'LA' ? (theme === 'dark' ? 'bg-slate-700 shadow-sm text-blue-300' : 'bg-white shadow-sm text-blue-600') : theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}
              >
                LA
              </button>
              <button
                onClick={() => setTimeZoneMode('BR')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${timeZoneMode === 'BR' ? (theme === 'dark' ? 'bg-slate-700 shadow-sm text-green-300' : 'bg-white shadow-sm text-green-600') : theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}
              >
                BR
              </button>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border transition-colors`}
              title="Alternar tema"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-slate-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {/* Navigation */}
            <div className="flex gap-2">
              <Link
                to="/realtime"
                className={`p-2.5 rounded-xl transition-colors ${theme === 'dark' ? 'bg-slate-900 border-slate-800 hover:bg-slate-800' : 'bg-white border-slate-200 hover:bg-slate-50'} border`}
                title="Modo Realtime"
              >
                <Clock className="w-4 h-4" />
              </Link>
              <Link
                to="/settings"
                className={`p-2.5 rounded-xl transition-colors ${theme === 'dark' ? 'bg-slate-900 border-slate-800 hover:bg-slate-800' : 'bg-white border-slate-200 hover:bg-slate-50'} border`}
                title="Configurações"
              >
                <SettingsIcon className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 space-y-6 pb-10">
        {/* Mobile Period Selector */}
        <div className="sm:hidden flex gap-1 bg-slate-200 dark:bg-slate-800 p-1 rounded-lg">
          <PeriodButton type="today" label="Hoje" />
          <PeriodButton type="7d" label="7d" />
          <PeriodButton type="30d" label="30d" />
          <PeriodButton type="month" label="Mês" />
        </div>

        {/* Alerts Banner */}
        {alerts.length > 0 && !loading && <AlertBanner alerts={alerts} />}

        {/* Loading State */}
        {loading ? (
          <div className={`p-8 text-center rounded-lg ${theme === 'dark' ? 'bg-slate-900/50' : 'bg-white'}`}>
            <p className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>
              Carregando dados...
            </p>
          </div>
        ) : metrics ? (
          <>
            {/* Row 1: Orders & Revenue */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Pedidos Gerados"
                value={metrics.orders.total}
                isCurrency={false}
                icon={<Package className="w-5 h-5" />}
              />
              <MetricCard
                title="Pedidos Pagos"
                value={metrics.orders.paid}
                isCurrency={false}
                icon={<TrendingUp className="w-5 h-5" />}
              />
              <MetricCard
                title="Vendas Pagas"
                value={metrics.revenue.paid}
                icon={<BarChart3 className="w-5 h-5" />}
              />
              <MetricCard
                title="Gasto em Ads"
                value={metrics.costs.adSpend}
                icon={<Zap className="w-5 h-5" />}
              />
            </div>

            {/* Row 2: Costs & Profit */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Custo de Produtos"
                value={metrics.costs.products}
                icon={<Package className="w-5 h-5" />}
              />
              <MetricCard
                title="Custo de Frete"
                value={metrics.costs.shipping}
                icon={<Truck className="w-5 h-5" />}
              />
              <MetricCard
                title="Lucro Bruto"
                value={metrics.profit.gross}
                icon={<TrendingUp className="w-5 h-5" />}
              />
              <MetricCard
                title="Lucro Líquido"
                value={metrics.profit.net}
                icon={<BarChart3 className="w-5 h-5" />}
              />
            </div>

            {/* Row 3: ROAS & ROI */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className={`p-6 rounded-xl border ${theme === 'dark' ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}
              >
                <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-2">
                  ROAS (Geral)
                </h3>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-blue-600">
                    {metrics.roas.toFixed(2)}x
                  </p>
                  <span className="text-sm text-slate-500">Return on Ad Spend</span>
                </div>
              </div>
              <div
                className={`p-6 rounded-xl border ${theme === 'dark' ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}
              >
                <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-2">
                  ROI (Geral)
                </h3>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-emerald-600">
                    {metrics.roi.toFixed(1)}%
                  </p>
                  <span className="text-sm text-slate-500">Return on Investment</span>
                </div>
              </div>
            </div>

            {/* Row 4: Campaign Table */}
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold mb-4">Análise por Campanha</h2>
                <CampaignTable campaigns={metrics.campaigns} />
              </div>
            </div>

            {/* Footer */}
            <div
              className={`p-4 rounded-lg border text-xs ${theme === 'dark' ? 'bg-slate-900/30 border-slate-800 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
            >
              <p>
                Cotação USD/BRL: <strong>{metrics.exchangeRate.toFixed(2)}</strong> |
                Período: <strong>{metrics.period.label}</strong> | Dados do cache NuvemShop + Meta
                Ads
              </p>
            </div>
          </>
        ) : (
          <div
            className={`p-8 text-center rounded-lg ${theme === 'dark' ? 'bg-slate-900/50' : 'bg-white'}`}
          >
            <p className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>
              Nenhum dado disponível
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
