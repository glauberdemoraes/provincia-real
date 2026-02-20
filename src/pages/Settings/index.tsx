import { useTheme } from '@/contexts/ThemeContext'

export default function Settings() {
  const { theme } = useTheme()

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-950 text-slate-50' : 'bg-slate-100 text-slate-900'}`}>
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-4xl font-bold mb-8">Configurações</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Placeholder para futuras configurações */}
          <div
            className={`p-6 rounded-lg border-2 opacity-50 cursor-not-allowed ${
              theme === 'dark'
                ? 'bg-slate-800 border-slate-700'
                : 'bg-white border-gray-200'
            }`}
          >
            <h2 className="text-xl font-bold mb-2">⚠️ Alertas</h2>
            <p className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>
              Configurar alertas de vendas (em breve)
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
