import { useTheme } from '@/contexts/ThemeContext'

export default function Settings() {
  const { theme } = useTheme()

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-950 text-slate-50' : 'bg-slate-100 text-slate-900'}`}>
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Configurações</h1>
          <p className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>
            Ajuste alertas, sincronizações e preferências
          </p>
        </div>
      </div>
    </div>
  )
}
