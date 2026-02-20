import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Sun, Moon, BarChart3, TrendingUp, Clock, Settings as SettingsIcon } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { useTimezone } from '@/contexts/TimezoneContext'
import { AlertBanner } from '@/components/AlertBanner'
import { MetricCard } from '@/components/ui/MetricCard'
import { checkAlerts } from '@/services/alerts'
import type { ActiveAlert } from '@/types'

export default function Dashboard() {
  const { theme, toggleTheme } = useTheme()
  const { timeZoneMode, setTimeZoneMode } = useTimezone()
  const [alerts, setAlerts] = useState<ActiveAlert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAlerts = async () => {
      const result = await checkAlerts()
      setAlerts(result?.alerts || [])
      setLoading(false)
    }

    loadAlerts()
    const interval = setInterval(loadAlerts, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-950 text-slate-50' : 'bg-slate-100 text-slate-900'} transition-colors`}>
      {/* Navbar */}
      <nav className={`fixed top-0 w-full z-40 ${theme === 'dark' ? 'bg-slate-900/90' : 'bg-white/90'} backdrop-blur-md border-b ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'} transition-colors`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'}`}>
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-lg font-bold">Província Real</h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Timezone Toggle */}
            <div className={`${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'} p-1 rounded-xl flex items-center border ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
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
        {/* Alerts Banner */}
        {alerts.length > 0 && !loading && <AlertBanner alerts={alerts} />}

        {/* Welcome Message */}
        <div className={`p-6 rounded-xl border ${theme === 'dark' ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
          <h2 className="text-2xl font-bold mb-2">Bem-vindo ao Cockpit</h2>
          <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
            Sistema integrado de métricas de vendas, anúncios e produção.
          </p>
          <p className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'} mt-2`}>
            Modo timezone: <strong>{timeZoneMode === 'LA' ? 'Los Angeles (GMT-8)' : 'Brasília (GMT-3)'}</strong>
          </p>
        </div>

        {/* Sample Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Vendas Brutas"
            value={15234.50}
            icon={<BarChart3 className="w-5 h-5" />}
            trend={{ value: 2341, previousValue: 12893.50, percentage: 18.1, direction: 'up' }}
          />
          <MetricCard
            title="Pedidos Pagos"
            value={24}
            isCurrency={false}
            icon={<TrendingUp className="w-5 h-5" />}
            trend={{ value: 8, previousValue: 16, percentage: 50, direction: 'up' }}
          />
          <MetricCard
            title="Tick Médio"
            value={635.15}
            icon={<BarChart3 className="w-5 h-5" />}
            trend={{ value: -50, previousValue: 685.15, percentage: -7.3, direction: 'down' }}
          />
          <MetricCard
            title="Potes Vendidos"
            value={48}
            isCurrency={false}
            trend={{ value: 12, previousValue: 36, percentage: 33.3, direction: 'up' }}
          />
        </div>

        {/* Status Messages */}
        <div className={`p-6 rounded-xl border ${theme === 'dark' ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
          <h3 className="font-bold mb-4">Status do Sistema</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>Banco de dados de cache</span>
              <span className="text-emerald-500 font-bold">✓ Conectado</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>API NuvemShop</span>
              <span className="text-emerald-500 font-bold">✓ Pronto</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>API Meta Ads</span>
              <span className="text-emerald-500 font-bold">✓ Pronto</span>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className={`p-6 rounded-xl border ${theme === 'dark' ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'}`}>
          <h3 className="font-bold mb-2 text-blue-600 dark:text-blue-400">Próximos Passos</h3>
          <ol className={`list-decimal list-inside space-y-1 text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
            <li>Criar as migrações SQL no Supabase</li>
            <li>Executar seed de alertas padrão</li>
            <li>Integrar dashboard existente (App.tsx original)</li>
            <li>Implementar tela realtime para monitor</li>
            <li>Criar histórico de tendências</li>
          </ol>
        </div>
      </main>
    </div>
  )
}
