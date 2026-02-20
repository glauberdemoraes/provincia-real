import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Sun,
  Moon,
  TrendingUp,
  TrendingDown,
  Clock,
  Settings as SettingsIcon,
  DollarSign,
  ShoppingCart,
  Target,
  Zap,
  RefreshCw,
} from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { useTimezone } from '@/contexts/TimezoneContext'
import { AlertBanner } from '@/components/AlertBanner'
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
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

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
        setLastUpdate(new Date())

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
        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
          isActive
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
            : theme === 'dark'
              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
        }`}
      >
        {label}
      </button>
    )
  }

  // Render métrica com seta de tendência
  const MetricBox = ({
    label,
    value,
    icon: Icon,
    isCurrency = true,
    trend,
  }: {
    label: string
    value: number
    icon: React.ComponentType<{ className: string }>
    isCurrency?: boolean
    trend?: number
  }) => {
    const formatted = isCurrency
      ? new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(value)
      : value.toLocaleString('pt-BR')

    const trendColor =
      trend !== undefined && trend > 0
        ? 'text-emerald-500'
        : trend !== undefined && trend < 0
          ? 'text-red-500'
          : 'text-slate-500'

    return (
      <div
        className={`p-6 rounded-xl border backdrop-blur ${theme === 'dark' ? 'bg-slate-900/40 border-slate-800/50 hover:bg-slate-900/60' : 'bg-white/50 border-slate-200/50 hover:bg-white/70'} transition-all`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-100'}`}>
            <Icon className="w-5 h-5 text-blue-500" />
          </div>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 ${trendColor}`}>
              {trend > 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : trend < 0 ? (
                <TrendingDown className="w-4 h-4" />
              ) : null}
              {trend !== 0 && <span className="text-xs font-bold">{Math.abs(trend)}%</span>}
            </div>
          )}
        </div>
        <p className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
          {label}
        </p>
        <p className="text-2xl font-bold text-blue-600">{formatted}</p>
      </div>
    )
  }

  return (
    <div
      className={`min-h-screen ${theme === 'dark' ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50' : 'bg-gradient-to-br from-slate-50 via-white to-slate-50 text-slate-900'} transition-colors`}
    >
      {/* Navbar */}
      <nav
        className={`fixed top-0 w-full z-40 ${theme === 'dark' ? 'bg-slate-900/80' : 'bg-white/80'} backdrop-blur-xl border-b ${theme === 'dark' ? 'border-slate-800/50' : 'border-slate-200/50'} transition-colors`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-lg ${theme === 'dark' ? 'bg-blue-900/30 border border-blue-800/50' : 'bg-blue-50 border border-blue-200'}`}
            >
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-black">Provincia Real</h1>
              <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                Cockpit de Vendas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Period Selector */}
            <div className="hidden sm:flex items-center gap-2 p-1 rounded-lg">
              <PeriodButton type="today" label="Hoje" />
              <PeriodButton type="7d" label="7d" />
              <PeriodButton type="30d" label="30d" />
              <PeriodButton type="month" label="Mês" />
            </div>

            {/* Timezone Toggle */}
            <div
              className={`flex gap-0.5 p-1 rounded-lg ${theme === 'dark' ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-slate-100 border border-slate-200'}`}
            >
              <button
                onClick={() => setTimeZoneMode('LA')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  timeZoneMode === 'LA'
                    ? theme === 'dark'
                      ? 'bg-blue-900/50 text-blue-300'
                      : 'bg-blue-100 text-blue-600'
                    : theme === 'dark'
                      ? 'text-slate-500'
                      : 'text-slate-500'
                }`}
              >
                🗽 LA
              </button>
              <button
                onClick={() => setTimeZoneMode('BR')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  timeZoneMode === 'BR'
                    ? theme === 'dark'
                      ? 'bg-emerald-900/50 text-emerald-300'
                      : 'bg-emerald-100 text-emerald-600'
                    : theme === 'dark'
                      ? 'text-slate-500'
                      : 'text-slate-500'
                }`}
              >
                🇧🇷 BR
              </button>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-lg transition-colors ${theme === 'dark' ? 'bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50' : 'bg-slate-100 border border-slate-200 hover:bg-slate-200'}`}
              title="Alternar tema"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-700" />
              )}
            </button>

            {/* Navigation */}
            <div className="flex gap-2">
              <Link
                to="/realtime"
                className={`p-2.5 rounded-lg transition-colors ${theme === 'dark' ? 'bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50' : 'bg-slate-100 border border-slate-200 hover:bg-slate-200'}`}
                title="Modo Realtime"
              >
                <Clock className="w-5 h-5" />
              </Link>
              <Link
                to="/settings"
                className={`p-2.5 rounded-lg transition-colors ${theme === 'dark' ? 'bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50' : 'bg-slate-100 border border-slate-200 hover:bg-slate-200'}`}
                title="Configurações"
              >
                <SettingsIcon className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16 space-y-8">
        {/* Mobile Period Selector */}
        <div className="sm:hidden flex gap-2">
          <PeriodButton type="today" label="Hoje" />
          <PeriodButton type="7d" label="7d" />
          <PeriodButton type="30d" label="30d" />
          <PeriodButton type="month" label="Mês" />
        </div>

        {/* Alerts Banner */}
        {alerts.length > 0 && !loading && <AlertBanner alerts={alerts} />}

        {/* Header com status */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black mb-2">Dashboard</h2>
            <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              {metrics?.period.label} • {timeZoneMode} • Fuso Los Angeles (UTC-8)
            </p>
          </div>
          {lastUpdate && (
            <div className={`text-right text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-600'}`}>
              <p>Atualizado em</p>
              <p className="font-mono">
                {lastUpdate.toLocaleTimeString('pt-BR')}
              </p>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className={`flex items-center justify-center h-64 rounded-xl border ${theme === 'dark' ? 'bg-slate-900/40 border-slate-800/50' : 'bg-white/50 border-slate-200/50'}`}>
            <div className="flex flex-col items-center gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
              <p className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>
                Carregando métricas...
              </p>
            </div>
          </div>
        ) : metrics ? (
          <>
            {/* Row 1: Orders & Revenue */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                📊 Vendas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricBox
                  label="Pedidos Gerados"
                  value={metrics.orders.total}
                  icon={ShoppingCart}
                  isCurrency={false}
                />
                <MetricBox
                  label="Pedidos Pagos"
                  value={metrics.orders.paid}
                  icon={DollarSign}
                  isCurrency={false}
                />
                <MetricBox
                  label="Vendas Pagas"
                  value={metrics.revenue.paid}
                  icon={TrendingUp}
                />
                <MetricBox
                  label="Ticket Médio"
                  value={
                    metrics.orders.paid > 0
                      ? metrics.revenue.paid / metrics.orders.paid
                      : 0
                  }
                  icon={Target}
                />
              </div>
            </div>

            {/* Row 2: Costs & Profit */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                💰 Lucratividade
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricBox
                  label="Custo de Produtos"
                  value={metrics.costs.products}
                  icon={ShoppingCart}
                />
                <MetricBox
                  label="Custo de Frete"
                  value={metrics.costs.shipping}
                  icon={Zap}
                />
                <MetricBox
                  label="Lucro Bruto"
                  value={metrics.profit.gross}
                  icon={TrendingUp}
                />
                <MetricBox
                  label="Lucro Líquido"
                  value={metrics.profit.net}
                  icon={Target}
                />
              </div>
            </div>

            {/* Row 3: Marketing & ROI */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                📢 Marketing & ROI
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricBox
                  label="Gasto em Ads"
                  value={metrics.costs.adSpend}
                  icon={Zap}
                />
                <div
                  className={`p-6 rounded-xl border backdrop-blur ${theme === 'dark' ? 'bg-slate-900/40 border-slate-800/50 hover:bg-slate-900/60' : 'bg-white/50 border-slate-200/50 hover:bg-white/70'} transition-all`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-100'}`}
                    >
                      <TrendingUp className="w-5 h-5 text-emerald-500" />
                    </div>
                  </div>
                  <p
                    className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}
                  >
                    ROAS (Geral)
                  </p>
                  <p className="text-2xl font-bold">
                    <span className="text-emerald-500">{metrics.roas.toFixed(2)}x</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-2">Return on Ad Spend</p>
                </div>
                <div
                  className={`p-6 rounded-xl border backdrop-blur ${theme === 'dark' ? 'bg-slate-900/40 border-slate-800/50 hover:bg-slate-900/60' : 'bg-white/50 border-slate-200/50 hover:bg-white/70'} transition-all`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-100'}`}
                    >
                      <Target className="w-5 h-5 text-purple-500" />
                    </div>
                  </div>
                  <p
                    className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}
                  >
                    ROI (Geral)
                  </p>
                  <p className="text-2xl font-bold">
                    <span className={metrics.roi > 0 ? 'text-purple-500' : 'text-red-500'}>
                      {metrics.roi.toFixed(1)}%
                    </span>
                  </p>
                  <p className="text-xs text-slate-500 mt-2">Return on Investment</p>
                </div>
                <MetricBox
                  label="Total de Custos"
                  value={metrics.costs.total}
                  icon={DollarSign}
                />
              </div>
            </div>

            {/* Row 4: Campaign Table */}
            <div className="space-y-4 mt-8">
              <div>
                <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
                  📊 Análise por Campanha
                </h3>
                <div
                  className={`rounded-xl border backdrop-blur p-6 ${theme === 'dark' ? 'bg-slate-900/40 border-slate-800/50' : 'bg-white/50 border-slate-200/50'}`}
                >
                  <CampaignTable campaigns={metrics.campaigns} />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              className={`mt-8 p-4 rounded-lg border text-xs ${theme === 'dark' ? 'bg-slate-900/40 border-slate-800/50 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
            >
              <p className="flex items-center justify-between flex-wrap gap-4">
                <span>
                  💱 Cotação: <strong>R$ {metrics.exchangeRate.toFixed(2)}/USD</strong> •
                  Período: <strong>{metrics.period.label}</strong>
                </span>
                <span className="text-slate-500 dark:text-slate-500">
                  Dados sincronizados • NuvemShop + Meta Ads
                </span>
              </p>
            </div>
          </>
        ) : (
          <div
            className={`p-8 text-center rounded-lg border ${theme === 'dark' ? 'bg-slate-900/40 border-slate-800/50' : 'bg-white/50 border-slate-200/50'}`}
          >
            <p className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>
              Nenhum dado disponível para este período
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
