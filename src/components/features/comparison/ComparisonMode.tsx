import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface ComparisonMetric {
  label: string
  current: number
  previous: number
  trend: 'up' | 'down' | 'neutral'
  formatAs?: 'currency' | 'percent' | 'number'
}

interface ComparisonModeProps {
  currentPeriod: string
  previousPeriod: string
  metrics: ComparisonMetric[]
}

const formatValue = (
  value: number,
  formatAs: 'currency' | 'percent' | 'number' = 'number',
) => {
  switch (formatAs) {
    case 'currency':
      return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
    case 'percent':
      return `${value.toFixed(2)}%`
    default:
      return value.toLocaleString('en-US')
  }
}

export const ComparisonMode: React.FC<ComparisonModeProps> = ({
  currentPeriod,
  previousPeriod,
  metrics,
}) => {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Period Comparison
        </h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {currentPeriod} vs {previousPeriod}
        </p>
      </div>

      {/* Comparison Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric, idx) => {
          const change = metric.current - metric.previous
          const changePercent =
            metric.previous !== 0
              ? ((change / metric.previous) * 100).toFixed(1)
              : '0'
          const isPositive = metric.trend === 'up'

          return (
            <div
              key={idx}
              className={`rounded-lg border-2 p-4 transition-all ${
                isPositive
                  ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950'
                  : metric.trend === 'down'
                    ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950'
                    : 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900'
              }`}
            >
              {/* Label */}
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {metric.label}
              </p>

              {/* Current Value */}
              <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                {formatValue(metric.current, metric.formatAs)}
              </p>

              {/* Trend indicator and change */}
              <div className="mt-3 flex items-center gap-2">
                {isPositive ? (
                  <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                ) : metric.trend === 'down' ? (
                  <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                ) : (
                  <Minus className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                )}
                <span
                  className={`text-sm font-semibold ${
                    isPositive
                      ? 'text-emerald-700 dark:text-emerald-300'
                      : metric.trend === 'down'
                        ? 'text-red-700 dark:text-red-300'
                        : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {isPositive ? '+' : metric.trend === 'down' ? '-' : ''}
                  {Math.abs(Number(changePercent))}%
                </span>
              </div>

              {/* Previous value */}
              <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                Previous: {formatValue(metric.previous, metric.formatAs)}
              </p>

              {/* Change in absolute terms */}
              {change !== 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {isPositive ? '+' : '-'} {formatValue(Math.abs(change), metric.formatAs)}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
