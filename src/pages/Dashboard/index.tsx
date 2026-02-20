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
  Megaphone,
  BarChart2,
  Percent,
  RefreshCw,
  Users,
  Heart,
  TrendingDown,
  DollarSign,
  Activity,
  Zap,
} from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { useTimezone } from '@/contexts/TimezoneContext'
import { AlertBanner } from '@/components/AlertBanner'
import { MetricCard } from '@/components/ui/MetricCard'
import { CampaignTable } from '@/components/CampaignTable'
import { CockpitTable } from '@/components/CockpitTable'
import { RefreshButton } from '@/components/RefreshButton'
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

            {/* Refresh Button */}
            <div className="hidden sm:block">
              <RefreshButton
                timeZoneMode={timeZoneMode}
                onRefreshComplete={() => {
                  // Recarregar dados após refresh manual
                  const dateRange = getDateRange(period)
                  setLoading(true)
                  const loadData = async () => {
                    try {
                      const orders = await fetchOrders(dateRange)
                      const campaigns = await fetchMetaCampaigns(dateRange)
                      const exchangeRate = await getUsdToBrl(new Date())
                      const dashboardMetrics = await calculateDashboardMetrics(
                        orders,
                        campaigns,
                        exchangeRate,
                        dateRange,
                        timeZoneMode
                      )
                      setMetrics(dashboardMetrics)
                      setLastUpdate(new Date())
                      const result = await checkAlerts()
                      setAlerts(result?.alerts || [])
                    } catch (error) {
                      console.error('Erro ao recarregar dados:', error)
                    } finally {
                      setLoading(false)
                    }
                  }
                  loadData()
                }}
              />
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
            {/* Seção 1: Resumo Executivo */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                Resumo Executivo
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  title="Receita Paga"
                  value={metrics.revenue.paid}
                  icon={<TrendingUp className="w-5 h-5" />}
                  variant="hero"
                  valueColor="green"
                  placeholder="Nenhuma venda"
                  subValue={`Bruto R$${metrics.revenue.gross.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`}
                />
                <MetricCard
                  title="Lucro Líquido"
                  value={metrics.profit.net}
                  icon={<Wallet className="w-5 h-5" />}
                  variant="hero"
                  valueColor={getProfitColor(metrics.profit.net)}
                  placeholder="Sem lucro"
                  badge={{
                    label: `ROI ${getRoiBadge(metrics.roi).label}`,
                    color: getRoiBadge(metrics.roi).color,
                  }}
                />
                <MetricCard
                  title="ROAS Geral"
                  value={`${metrics.roas.toFixed(2)}x`}
                  icon={<BarChart2 className="w-5 h-5" />}
                  isCurrency={false}
                  valueColor={getRoasColor(metrics.roas)}
                  placeholder="Sem dados"
                  badge={{ label: 'Return on Ad Spend', color: getRoasColor(metrics.roas) }}
                />
                <MetricCard
                  title="ROI Geral"
                  value={`${metrics.roi.toFixed(1)}%`}
                  icon={<Percent className="w-5 h-5" />}
                  isCurrency={false}
                  valueColor={getProfitColor(metrics.roi)}
                  placeholder="–"
                  badge={getRoiBadge(metrics.roi)}
                />
              </div>
            </div>

            {/* Seção 2: Vendas */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                Vendas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <MetricCard
                  title="Pedidos Gerados"
                  value={metrics.orders.total}
                  icon={<ShoppingCart className="w-5 h-5" />}
                  isCurrency={false}
                  placeholder="Nenhum pedido"
                  subValue={`${metrics.orders.paid} pagos`}
                />
                <MetricCard
                  title="Pedidos Pagos"
                  value={metrics.orders.paid}
                  icon={<CheckCircle className="w-5 h-5" />}
                  isCurrency={false}
                  placeholder="Nenhum pago"
                  subValue={metrics.orders.total > 0 ? `${((metrics.orders.paid / metrics.orders.total) * 100).toFixed(0)}% conversão` : '-'}
                />
                <MetricCard
                  title="Ticket Médio"
                  value={metrics.orders.paid > 0 ? metrics.revenue.paid / metrics.orders.paid : 0}
                  icon={<Receipt className="w-5 h-5" />}
                  placeholder="Sem vendas"
                  subValue={`${metrics.orders.paid} pedidos pagos`}
                />
              </div>
            </div>

            {/* Seção 3: Custos & Ads */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                Custos & Publicidade
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <MetricCard
                  title="Gasto em Ads"
                  value={metrics.costs.adSpend}
                  icon={<Megaphone className="w-5 h-5" />}
                  variant="muted"
                  placeholder="Sem gasto"
                  inverseTrend={true}
                  subValue="Meta Ads"
                />
                <MetricCard
                  title="Custo de Produtos"
                  value={metrics.costs.products}
                  icon={<Package className="w-5 h-5" />}
                  variant="muted"
                  placeholder="Sem produtos"
                  inverseTrend={true}
                  subValue="COGS"
                />
                <MetricCard
                  title="Custo de Frete"
                  value={metrics.costs.shipping}
                  icon={<Truck className="w-5 h-5" />}
                  variant="muted"
                  placeholder="Sem frete"
                  inverseTrend={true}
                  subValue="Shipping"
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

            {/* Seção 5: Tração e Vendas */}
            {metrics.traction && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                  Tração e Vendas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <MetricCard
                    title="Ticket Médio"
                    value={metrics.traction.aov}
                    icon={<DollarSign className="w-5 h-5" />}
                    placeholder="Sem vendas"
                    subValue={`${metrics.orders.paid} pedidos`}
                  />
                  <MetricCard
                    title="Taxa de Conversão"
                    value={`${metrics.traction.conversionRate.toFixed(1)}%`}
                    icon={<TrendingUp className="w-5 h-5" />}
                    isCurrency={false}
                    placeholder="Nenhuma venda"
                    subValue="checkout → paid"
                  />
                  <MetricCard
                    title="% Pedidos com Kits"
                    value={`${metrics.traction.kitOrdersPct.toFixed(1)}%`}
                    icon={<Package className="w-5 h-5" />}
                    isCurrency={false}
                    placeholder="Sem kits"
                    subValue="Mix de produtos"
                  />
                  <MetricCard
                    title="Tráfego Orgânico"
                    value={`${metrics.traction.organicPct.toFixed(1)}%`}
                    icon={<TrendingUp className="w-5 h-5" />}
                    isCurrency={false}
                    placeholder="Nenhum direto"
                    subValue="Sem utm_campaign"
                  />
                </div>

                {/* SKU Mix */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <MetricCard
                    title="Pote 680g"
                    value={metrics.traction.skuMix.pote680g.revenue}
                    icon={<Package className="w-5 h-5" />}
                    placeholder="Sem vendas"
                    subValue={`${metrics.traction.skuMix.pote680g.pct.toFixed(1)}% do total`}
                  />
                  <MetricCard
                    title="Barra 400g"
                    value={metrics.traction.skuMix.barra400g.revenue}
                    icon={<Package className="w-5 h-5" />}
                    placeholder="Sem vendas"
                    subValue={`${metrics.traction.skuMix.barra400g.pct.toFixed(1)}% do total`}
                  />
                  <MetricCard
                    title="Kits"
                    value={metrics.traction.skuMix.kits.revenue}
                    icon={<Package className="w-5 h-5" />}
                    placeholder="Sem vendas"
                    subValue={`${metrics.traction.skuMix.kits.pct.toFixed(1)}% do total`}
                  />
                </div>
              </div>
            )}

            {/* Seção 6: Lucratividade */}
            {metrics.profitability && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                  Lucratividade
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <MetricCard
                    title="MCU"
                    value={metrics.profitability.mcu}
                    icon={<Wallet className="w-5 h-5" />}
                    placeholder="Sem lucro"
                    subValue="Margem Contrib. Unitária"
                  />
                  <MetricCard
                    title="Margem Líquida %"
                    value={`${metrics.profitability.netMarginPct.toFixed(1)}%`}
                    icon={<Percent className="w-5 h-5" />}
                    isCurrency={false}
                    placeholder="Sem lucro"
                    subValue="% da receita paga"
                  />
                  <MetricCard
                    title="ROI Produto"
                    value={`${metrics.profitability.productRoi.toFixed(1)}%`}
                    icon={<BarChart2 className="w-5 h-5" />}
                    isCurrency={false}
                    placeholder="Sem dados"
                    subValue="Retorno sobre COGS"
                  />
                  <MetricCard
                    title="Breakeven"
                    value={metrics.profitability.breakeven}
                    icon={<TrendingUp className="w-5 h-5" />}
                    isCurrency={false}
                    placeholder="–"
                    subValue="pedidos"
                  />
                </div>
              </div>
            )}

            {/* Seção 7: Marketing & Ads Expandida */}
            {metrics.marketing && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                  Marketing & Publicidade (Expandido)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <MetricCard
                    title="CAC"
                    value={metrics.marketing.cac}
                    icon={<DollarSign className="w-5 h-5" />}
                    placeholder="Sem gasto"
                    subValue="Custo por Aquisição"
                  />
                  <MetricCard
                    title="CPA"
                    value={metrics.marketing.cpa}
                    icon={<DollarSign className="w-5 h-5" />}
                    placeholder="Sem dados"
                    subValue="Custo por Click"
                  />
                  <MetricCard
                    title="CPC Médio"
                    value={metrics.marketing.avgCpcBrl}
                    icon={<Megaphone className="w-5 h-5" />}
                    placeholder="Sem dados de CPC"
                    subValue="em BRL (Meta Ads)"
                  />
                  <MetricCard
                    title="CPM Médio"
                    value={metrics.marketing.avgCpmBrl}
                    icon={<Megaphone className="w-5 h-5" />}
                    placeholder="Calculado dinamicamente"
                    subValue="em BRL (R$/1000 impressões)"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <MetricCard
                    title="Total de Clicks"
                    value={metrics.marketing.totalClicks}
                    icon={<Activity className="w-5 h-5" />}
                    isCurrency={false}
                    placeholder="Nenhum click registrado"
                    subValue="clicks da Meta Ads"
                  />
                  <MetricCard
                    title="Total de Impressões"
                    value={metrics.marketing.totalImpressions}
                    icon={<Activity className="w-5 h-5" />}
                    isCurrency={false}
                    placeholder="Nenhuma impressão registrada"
                    subValue="impressões da Meta Ads"
                  />
                </div>
              </div>
            )}

            {/* Seção 8: Retenção de Clientes */}
            {metrics.retention && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                  Retenção de Clientes
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <MetricCard
                    title="LTV Médio"
                    value={metrics.retention.avgLtv}
                    icon={<Heart className="w-5 h-5" />}
                    placeholder="Sem dados"
                    subValue="Lifetime Value"
                  />
                  <MetricCard
                    title="Taxa de Recompra"
                    value={`${metrics.retention.retentionRate.toFixed(1)}%`}
                    icon={<Users className="w-5 h-5" />}
                    isCurrency={false}
                    placeholder="Sem dados"
                    subValue="2+ pedidos"
                  />
                  <MetricCard
                    title="Churn %"
                    value={`${metrics.retention.churnRate.toFixed(1)}%`}
                    icon={<TrendingDown className="w-5 h-5" />}
                    isCurrency={false}
                    placeholder="–"
                    subValue="1 pedido apenas"
                    valueColor="red"
                  />
                  <MetricCard
                    title="Frequência Compra"
                    value={metrics.retention.avgFrequency.toFixed(2)}
                    icon={<TrendingUp className="w-5 h-5" />}
                    isCurrency={false}
                    placeholder="–"
                    subValue="recorrentes"
                  />
                </div>

                <MetricCard
                  title="Recência Média"
                  value={`${metrics.retention.avgRecencyDays.toFixed(0)} dias`}
                  icon={<Clock className="w-5 h-5" />}
                  isCurrency={false}
                  placeholder="–"
                  subValue="desde última compra"
                />
              </div>
            )}

            {/* Seção 9: Logístico-Financeiro */}
            {metrics.logistics && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                  Logístico-Financeiro
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <MetricCard
                    title="Impacto Frete Grátis"
                    value={metrics.logistics.freeShippingImpact}
                    icon={<Truck className="w-5 h-5" />}
                    placeholder="Sem frete"
                    subValue="R$ absorvido loja"
                    variant="muted"
                  />
                  <MetricCard
                    title="% Frete Grátis"
                    value={`${metrics.logistics.freeShippingPct.toFixed(1)}%`}
                    icon={<Truck className="w-5 h-5" />}
                    isCurrency={false}
                    placeholder="–"
                    subValue="pedidos"
                  />
                  <MetricCard
                    title="Taxa Gateway"
                    value={metrics.logistics.gatewayFees}
                    icon={<DollarSign className="w-5 h-5" />}
                    placeholder="Sem vendas"
                    subValue="3.3% da receita"
                    variant="muted"
                  />
                </div>
              </div>
            )}

            {/* Seção 10: Cockpit Estratégico */}
            {metrics.cockpit && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                  Cockpit Estratégico
                </h3>
                <div
                  className={`rounded-xl border p-6 ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}
                >
                  <CockpitTable items={metrics.cockpit.items} />
                </div>

                <MetricCard
                  title="LTV/CAC Ratio"
                  value={`${metrics.cockpit.ltvCacRatio.toFixed(2)}x`}
                  icon={<Zap className="w-5 h-5" />}
                  isCurrency={false}
                  placeholder="–"
                  subValue="Meta: 3.0x"
                  badge={{
                    label: metrics.cockpit.ltvCacRatio >= 3.0 ? 'Saudável' : 'Monitorar',
                    color: metrics.cockpit.ltvCacRatio >= 3.0 ? 'green' : metrics.cockpit.ltvCacRatio >= 1.5 ? 'amber' : 'red',
                  }}
                />
              </div>
            )}

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
