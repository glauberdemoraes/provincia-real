import React, { useState } from 'react'
import { AlertCircle, Lightbulb, CheckCircle, X } from 'lucide-react'

interface Alert {
  id: string
  type: 'warning' | 'recommendation' | 'success' | 'info'
  title: string
  description: string
  timestamp: Date
  actions?: { label: string; action: string }[]
}

interface AlertsPanelProps {
  alerts: Alert[]
  onDismiss?: (id: string) => void
  onAction?: (alertId: string, action: string) => void
}

const alertStyles = {
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-950',
    border: 'border-amber-200 dark:border-amber-800',
    icon: AlertCircle,
    iconColor: 'text-amber-600 dark:text-amber-400',
    titleColor: 'text-amber-900 dark:text-amber-100',
  },
  recommendation: {
    bg: 'bg-blue-50 dark:bg-blue-950',
    border: 'border-blue-200 dark:border-blue-800',
    icon: Lightbulb,
    iconColor: 'text-blue-600 dark:text-blue-400',
    titleColor: 'text-blue-900 dark:text-blue-100',
  },
  success: {
    bg: 'bg-emerald-50 dark:bg-emerald-950',
    border: 'border-emerald-200 dark:border-emerald-800',
    icon: CheckCircle,
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    titleColor: 'text-emerald-900 dark:text-emerald-100',
  },
  info: {
    bg: 'bg-gray-50 dark:bg-gray-900',
    border: 'border-gray-200 dark:border-gray-800',
    icon: AlertCircle,
    iconColor: 'text-gray-600 dark:text-gray-400',
    titleColor: 'text-gray-900 dark:text-gray-100',
  },
}

export const AlertsPanel: React.FC<AlertsPanelProps> = ({
  alerts,
  onDismiss,
  onAction,
}) => {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())

  const handleDismiss = (id: string) => {
    setDismissedIds((prev) => new Set([...prev, id]))
    onDismiss?.(id)
  }

  const visibleAlerts = alerts.filter((a) => !dismissedIds.has(a.id))

  if (visibleAlerts.length === 0) {
    return null
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
      {/* Header */}
      <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        Alerts & Recommendations
      </h2>

      {/* Alerts List */}
      <div className="space-y-3">
        {visibleAlerts.map((alert) => {
          const style = alertStyles[alert.type]
          const Icon = style.icon

          return (
            <div
              key={alert.id}
              className={`flex gap-4 rounded-lg border-2 p-4 transition-all ${style.bg} ${style.border}`}
            >
              {/* Icon */}
              <div className="flex-shrink-0">
                <Icon className={`h-5 w-5 ${style.iconColor}`} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold ${style.titleColor}`}>
                  {alert.title}
                </h3>
                <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                  {alert.description}
                </p>

                {/* Actions */}
                {alert.actions && alert.actions.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {alert.actions.map((action, idx) => (
                      <button
                        key={idx}
                        className="rounded bg-gray-200 px-3 py-1 text-xs font-medium text-gray-800 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                        onClick={() => onAction?.(alert.id, action.action)}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Timestamp */}
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </p>
              </div>

              {/* Dismiss button */}
              <button
                className="flex-shrink-0 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
                onClick={() => handleDismiss(alert.id)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
