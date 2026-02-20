import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

interface CockpitItem {
  metric: string
  value: number
  formatted: string
  meta: number
  metaFormatted: string
  status: 'green' | 'amber' | 'red'
}

interface CockpitTableProps {
  items: CockpitItem[]
}

export const CockpitTable: React.FC<CockpitTableProps> = ({ items }) => {
  const { theme } = useTheme()

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'green':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
      case 'amber':
        return <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
      case 'red':
        return <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
      default:
        return null
    }
  }

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'green':
        return theme === 'dark' ? 'bg-emerald-950' : 'bg-emerald-50'
      case 'amber':
        return theme === 'dark' ? 'bg-amber-950' : 'bg-amber-50'
      case 'red':
        return theme === 'dark' ? 'bg-red-950' : 'bg-red-50'
      default:
        return ''
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className={`border-b ${theme === 'dark' ? 'border-zinc-800 bg-zinc-950' : 'border-zinc-200 bg-zinc-50'}`}>
            <th className="text-left px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300">
              Métrica
            </th>
            <th className="text-right px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300">
              Período Atual
            </th>
            <th className="text-right px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300">
              Meta/Referência
            </th>
            <th className="text-center px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr
              key={idx}
              className={`border-b transition-colors ${
                theme === 'dark'
                  ? `border-zinc-800 hover:bg-zinc-900 ${getStatusBg(item.status)}`
                  : `border-zinc-200 hover:bg-zinc-50 ${getStatusBg(item.status)}`
              }`}
            >
              <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                {item.metric}
              </td>
              <td className="text-right px-4 py-3 text-zinc-900 dark:text-zinc-100 font-semibold">
                {item.formatted}
              </td>
              <td className="text-right px-4 py-3 text-zinc-600 dark:text-zinc-400">
                {item.metaFormatted}
              </td>
              <td className="text-center px-4 py-3">
                {getStatusIcon(item.status)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
