import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Sun,
  Moon,
  Clock,
  Settings as SettingsIcon,
  ShoppingCart,
  CheckCircle,
  TrendingUp,
  Receipt,
  Wallet,
  Package,
  Truck,
  Calculator,
  Megaphone,
  BarChart2,
  Percent,
  RefreshCw,
} from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { useTimezone } from '@/contexts/TimezoneContext'
import { AlertBanner } from '@/components/AlertBanner'
import { MetricCard } from '@/components/ui/MetricCard'
import { CampaignTable } from '@/components/CampaignTable'
import { checkAlerts } from '@/services/alerts'
import { fetchOrders, fetchMetaCampaigns } from '@/services/api'
import { calculateDashboardMetrics } from '@/services/metrics'
import { getTodayRange_LA, getTodayRange_BR } from '@/lib/timezone'
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

  // Calcular range de datas baseado no período e timezone
  const getDateRange = useCallback((periodType: PeriodType): { start: Date; end: Date; label: string } => {
    const { start: today, end: todayEnd } = timeZoneMode === 'BR' ? getTodayRange_BR() : getTodayRange_LA()

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
  }, [timeZoneMode])

  // Carregar dados
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const dateRange = getDateRange(period)

        // Buscar dados reais das Edge Functions
        const orders = await fetchOrders(dateRange)
        const campaigns = await fetchMetaCampaigns(dateRange)

        // Log para debug
        console.log(`Orders recebidos: ${orders.length}`, {
          period: `${dateRange.start.toISOString().split('T')[0]} a ${dateRange.end.toISOString().split('T')[0]}`,
          samples: orders.slice(0, 2).map((o) => ({ id: o.id, created_at: o.created_at, total: o.total })),
        })
        console.log(`Campaigns recebidas: ${campaigns.length}`, {
          samples: campaigns.slice(0, 1).map((c) => ({ id: c.campaign_id, name: c.campaign_name, spend: c.spend })),
        })

        // Buscar taxa de câmbio do dia
        const exchangeRate = await getUsdToBrl(new Date())

        // Calcular métricas
        const dashboardMetrics = await calculateDashboardMetrics(orders, campaigns, exchangeRate, dateRange, timeZoneMode)

        console.log(`Métricas calculadas:`, {
          totalOrders: dashboardMetrics.orders.total,
          paidOrders: dashboardMetrics.orders.paid,
          revenue: dashboardMetrics.revenue.paid,
          adSpend: dashboardMetrics.costs.adSpend,
          campaigns: dashboardMetrics.campaigns.length,
          timezone: timeZoneMode,
        })

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
  }, [period, timeZoneMode, getDateRange])

  // Botão de período
  const PeriodButton = ({ type, label }: { type: PeriodType; label: string }) => {
    const isActive = period === type
    return (
      <button
        onClick={() => setPeriod(type)}
        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
          isActive
            ? 'bg-blue-600 text-white'
            : theme === 'dark'
              ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
        }`}
      >
        {label}
      </button>
    )
  }

  // Calcular métricas auxiliares
  const getProfitColor = (profit: number): 'green' | 'red' | 'default' => {
    if (profit > 0) return 'green'
    if (profit < 0) return 'red'
    return 'default'
  }

  const getRoasColor = (roas: number): 'green' | 'amber' | 'red' => {
    if (roas >= 3) return 'green'
    if (roas >= 1) return 'amber'
    return 'red'
  }

  const getRoiBadge = (roi: number): { label: string; color: 'green' | 'amber' | 'red' } => {
    if (roi > 30) return { label: `+${roi.toFixed(1)}%`, color: 'green' }
    if (roi >= 0) return { label: `+${roi.toFixed(1)}%`, color: 'amber' }
    return { label: `${roi.toFixed(1)}%`, color: 'red' }
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-zinc-950 text-zinc-50' : 'bg-white text-zinc-900'} transition-colors`}>
      {/* Navbar limpa e minimalista */}
      <nav
        className={`fixed top-0 w-full z-40 border-b ${theme === 'dark' ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-zinc-200'} transition-colors`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div
              className={`p-1.5 rounded-lg ${theme === 'dark' ? 'bg-zinc-900 border border-zinc-800' : 'bg-zinc-100 border border-zinc-300'}`}
            >
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Provincia Real</h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Period Selector */}
            <div className="hidden sm:flex items-center gap-1 p-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <PeriodButton type="today" label="Hoje" />
              <PeriodButton type="7d" label="7d" />
              <PeriodButton type="30d" label="30d" />
              <PeriodButton type="month" label="Mês" />
            </div>

            {/* Timezone Toggle */}
            <div
              className={`hidden sm:flex gap-0.5 p-1 rounded-lg border ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-100 border-zinc-200'}`}
            >
              <button
                onClick={() => setTimeZoneMode('LA')}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                  timeZoneMode === 'LA'
                    ? theme === 'dark'
                      ? 'bg-blue-900/60 text-blue-300'
                      : 'bg-blue-100 text-blue-600'
                    : theme === 'dark'
                      ? 'text-zinc-500'
                      : 'text-zinc-500'
                }`}
              >
                LA
              </button>
              <button
                onClick={() => setTimeZoneMode('BR')}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                  timeZoneMode === 'BR'
                    ? theme === 'dark'
                      ? 'bg-emerald-900/60 text-emerald-300'
                      : 'bg-emerald-100 text-emerald-600'
                    : theme === 'dark'
                      ? 'text-zinc-500'
                      : 'text-zinc-500'
                }`}
              >
                BR
              </button>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'bg-zinc-900 border border-zinc-800 hover:bg-zinc-800' : 'bg-zinc-100 border border-zinc-200 hover:bg-zinc-200'}`}
              title="Alternar tema"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-yellow-500" />
              ) : (
                <Moon className="w-4 h-4 text-zinc-700" />
              )}
            </button>

            {/* Navigation */}
            <div className="hidden sm:flex gap-1">
              <Link
                to="/realtime"
                className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'bg-zinc-900 border border-zinc-800 hover:bg-zinc-800' : 'bg-zinc-100 border border-zinc-200 hover:bg-zinc-200'}`}
                title="Modo Realtime"
              >
                <Clock className="w-4 h-4" />
              </Link>
              <Link
                to="/settings"
                className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'bg-zinc-900 border border-zinc-800 hover:bg-zinc-800' : 'bg-zinc-100 border border-zinc-200 hover:bg-zinc-200'}`}
                title="Configurações"
              >
                <SettingsIcon className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 space-y-10">
        {/* Mobile Period Selector */}
        <div className="sm:hidden flex gap-2">
          <PeriodButton type="today" label="Hoje" />
          <PeriodButton type="7d" label="7d" />
          <PeriodButton type="30d" label="30d" />
          <PeriodButton type="month" label="Mês" />
        </div>

        {/* Alerts Banner */}
        {alerts.length > 0 && !loading && <AlertBanner alerts={alerts} />}

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-1">Visão Geral</h2>
            <p
              className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}
            >
              {metrics?.period.label} • {timeZoneMode === 'LA' ? 'Los Angeles • UTC-8' : 'São Paulo • UTC-3'}
            </p>
          </div>
          {lastUpdate && (
            <div className={`text-right text-xs font-mono ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-600'}`}>
              <p className="uppercase tracking-widest text-zinc-500 text-xs mb-1">Atualizado</p>
              <p className={`text-lg font-bold ${theme === 'dark' ? 'text-zinc-300' : 'text-zinc-800'}`}>
                {lastUpdate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div
            className={`flex items-center justify-center h-64 rounded-xl border ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}
          >
            <div className="flex flex-col items-center gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
              <p className={theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}>Carregando métricas...</p>
            </div>
          </div>
        ) : metrics ? (
          <>
            {/* Seção 1: Vendas */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                Vendas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  title="Pedidos Gerados"
                  value={metrics.orders.total}
                  icon={<ShoppingCart className="w-5 h-5" />}
                  isCurrency={false}
                  subValue={`${metrics.orders.paid} pagos`}
                />
                <MetricCard
                  title="Pedidos Pagos"
                  value={metrics.orders.paid}
                  icon={<CheckCircle className="w-5 h-5" />}
                  isCurrency={false}
                  subValue={metrics.orders.total > 0 ? `${((metrics.orders.paid / metrics.orders.total) * 100).toFixed(0)}% conversão` : '-'}
                />
                <MetricCard
                  title="Receita Paga"
                  value={metrics.revenue.paid}
                  icon={<TrendingUp className="w-5 h-5" />}
                  valueColor="blue"
                  subValue={`Bruto R$${metrics.revenue.gross.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`}
                />
                <MetricCard
                  title="Ticket Médio"
                  value={metrics.orders.paid > 0 ? metrics.revenue.paid / metrics.orders.paid : 0}
                  icon={<Receipt className="w-5 h-5" />}
                  subValue={`${metrics.orders.paid} pedidos pagos`}
                />
              </div>
            </div>

            {/* Seção 2: Lucratividade (Hero Card + Linha de custos) */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                Lucratividade
              </h3>

              {/* Hero Card: Lucro Líquido com ROI e ROAS */}
              <div className="grid lg:grid-cols-2 gap-4">
                <MetricCard
                  title="Lucro Líquido"
                  value={metrics.profit.net}
                  icon={<Wallet className="w-5 h-5" />}
                  variant="hero"
                  valueColor={getProfitColor(metrics.profit.net)}
                  badge={{
                    label: `ROI ${getRoiBadge(metrics.roi).label}`,
                    color: getRoiBadge(metrics.roi).color,
                  }}
                  subValue={`ROAS ${metrics.roas.toFixed(2)}x`}
                />
                <MetricCard
                  title="Lucro Bruto"
                  value={metrics.profit.gross}
                  icon={<TrendingUp className="w-5 h-5" />}
                  valueColor={getProfitColor(metrics.profit.gross)}
                  subValue={`Margem ${metrics.orders.paid > 0 ? ((metrics.profit.gross / metrics.revenue.paid) * 100).toFixed(1) : 0}%`}
                />
              </div>

              {/* Linha de custos em variante muted */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricCard
                  title="Custo de Produtos"
                  value={metrics.costs.products}
                  icon={<Package className="w-5 h-5" />}
                  variant="muted"
                  inverseTrend={true}
                />
                <MetricCard
                  title="Custo de Frete"
                  value={metrics.costs.shipping}
                  icon={<Truck className="w-5 h-5" />}
                  variant="muted"
                  inverseTrend={true}
                />
                <MetricCard
                  title="Total de Custos"
                  value={metrics.costs.total}
                  icon={<Calculator className="w-5 h-5" />}
                  variant="muted"
                  inverseTrend={true}
                />
              </div>
            </div>

            {/* Seção 3: Marketing */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                Marketing
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricCard
                  title="Gasto em Ads"
                  value={metrics.costs.adSpend}
                  icon={<Megaphone className="w-5 h-5" />}
                  variant="muted"
                  inverseTrend={true}
                />
                <MetricCard
                  title="ROAS Geral"
                  value={`${metrics.roas.toFixed(2)}x`}
                  icon={<BarChart2 className="w-5 h-5" />}
                  isCurrency={false}
                  valueColor={getRoasColor(metrics.roas)}
                  badge={{ label: 'Return on Ad Spend', color: getRoasColor(metrics.roas) }}
                />
                <MetricCard
                  title="ROI Geral"
                  value={`${metrics.roi.toFixed(1)}%`}
                  icon={<Percent className="w-5 h-5" />}
                  isCurrency={false}
                  valueColor={getProfitColor(metrics.roi)}
                  badge={getRoiBadge(metrics.roi)}
                />
              </div>
            </div>

            {/* Seção 4: Campanhas */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                Análise por Campanha
              </h3>
              <div
                className={`rounded-xl border p-6 ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}
              >
                <CampaignTable campaigns={metrics.campaigns} />
              </div>
            </div>

            {/* Footer */}
            <div
              className={`mt-8 p-4 rounded-lg border text-xs ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-zinc-50 border-zinc-200 text-zinc-600'}`}
            >
              <p className="flex items-center justify-between flex-wrap gap-4">
                <span>
                  Cotação: <strong>R$ {metrics.exchangeRate.toFixed(2)}/USD</strong> • Período:{' '}
                  <strong>{metrics.period.label}</strong>
                </span>
                <span className={theme === 'dark' ? 'text-zinc-500' : 'text-zinc-500'}>
                  Dados sincronizados • NuvemShop + Meta Ads
                </span>
              </p>
            </div>
          </>
        ) : (
          <div
            className={`p-8 text-center rounded-lg border ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}
          >
            <p className={theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}>Nenhum dado disponível para este período</p>
          </div>
        )}
      </main>
    </div>
  )
}
