import type { FC } from 'react'
import { AlertTriangle, AlertCircle, Info } from 'lucide-react'
import type { ActiveAlert } from '@/types'

interface AlertBannerProps {
  alerts: ActiveAlert[]
}

// Interpolar {value} na mensagem do alerta
const interpolateAlert = (msg: string, alert: ActiveAlert): string => {
  return msg.replaceAll('{value}', alert.current_value.toFixed(1))
}

export const AlertBanner: FC<AlertBannerProps> = ({ alerts }) => {
  if (!alerts || alerts.length === 0) return null

  const criticalAlerts = alerts.filter(a => a.severity === 'critical')
  const warningAlerts = alerts.filter(a => a.severity === 'warning')

  const displayAlert = criticalAlerts[0] || warningAlerts[0] || alerts[0]

  if (!displayAlert) return null

  const bgColor = {
    critical: 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800',
    warning: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
  }[displayAlert.severity]

  const textColor = {
    critical: 'text-rose-800 dark:text-rose-400',
    warning: 'text-amber-800 dark:text-amber-400',
    info: 'text-blue-800 dark:text-blue-400',
  }[displayAlert.severity]

  const IconComponent = {
    critical: AlertTriangle,
    warning: AlertCircle,
    info: Info,
  }[displayAlert.severity]

  return (
    <div className={`border rounded-lg px-4 py-3 flex items-center gap-3 ${bgColor}`}>
      <IconComponent className={`w-5 h-5 flex-shrink-0 ${textColor}`} />
      <div className="flex-1">
        <p className={`text-sm font-bold ${textColor}`}>{interpolateAlert(displayAlert.message, displayAlert)}</p>
        {alerts.length > 1 && (
          <p className={`text-xs ${textColor} opacity-75 mt-1`}>
            +{alerts.length - 1} alerta{alerts.length > 2 ? 's' : ''} ativo{alerts.length > 2 ? 's' : ''}
          </p>
        )}
      </div>
    </div>
  )
}
