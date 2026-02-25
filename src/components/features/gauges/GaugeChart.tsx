import React from 'react'
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react'

interface GaugeChartProps {
  label: string
  value: number
  target: number
  min: number
  max: number
  status: 'good' | 'warning' | 'critical'
  unit?: string
  breakdown?: {
    label: string
    value: number
  }[]
}

const statusColors = {
  good: {
    bg: 'bg-emerald-50 dark:bg-emerald-950',
    border: 'border-emerald-200 dark:border-emerald-800',
    text: 'text-emerald-700 dark:text-emerald-300',
    gauge: 'from-emerald-100 to-emerald-500',
    icon: TrendingUp,
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-950',
    border: 'border-amber-200 dark:border-amber-800',
    text: 'text-amber-700 dark:text-amber-300',
    gauge: 'from-amber-100 to-amber-500',
    icon: AlertCircle,
  },
  critical: {
    bg: 'bg-red-50 dark:bg-red-950',
    border: 'border-red-200 dark:border-red-800',
    text: 'text-red-700 dark:text-red-300',
    gauge: 'from-red-100 to-red-500',
    icon: TrendingDown,
  },
}

export const GaugeChart: React.FC<GaugeChartProps> = ({
  label,
  value,
  target,
  min,
  max,
  status,
  unit = '%',
  breakdown,
}) => {
  const colors = statusColors[status]
  const Icon = colors.icon

  // Calculate needle rotation (0-180 degrees for semicircle gauge)
  const range = max - min
  const normalizedValue = Math.min(Math.max(value - min, 0), range)
  const percentage = (normalizedValue / range) * 100
  const rotation = (percentage / 100) * 180 - 90

  // Calculate target indicator position (for future use with visual target marker)
  // const normalizedTarget = Math.min(Math.max(target - min, 0), range)
  // const targetPercentage = (normalizedTarget / range) * 100
  // const targetRotation = (targetPercentage / 100) * 180 - 90

  return (
    <div
      className={`rounded-lg border-2 p-6 transition-all ${colors.bg} ${colors.border}`}
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {label}
        </h3>
        <Icon className={`h-4 w-4 ${colors.text}`} />
      </div>

      {/* Gauge Container */}
      <div className="mb-4 flex items-end justify-center">
        <div className="relative h-32 w-32">
          {/* SVG Semicircle Gauge */}
          <svg
            className="h-full w-full"
            viewBox="0 0 200 120"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Background arc */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              className="text-gray-200 dark:text-gray-700"
            />

            {/* Status arc (filled portion) */}
            <path
              d={`M 20 100 A 80 80 0 0 1 ${Math.cos((rotation * Math.PI) / 180) * 80 + 100} ${
                100 - Math.sin((rotation * Math.PI) / 180) * 80
              }`}
              fill="none"
              stroke="url(#gaugeGradient)"
              strokeWidth="6"
              strokeLinecap="round"
            />

            {/* Gradient definition */}
            <defs>
              <linearGradient
                id="gaugeGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor={status === 'good' ? '#10B981' : status === 'warning' ? '#F59E0B' : '#EF4444'} />
                <stop offset="100%" stopColor={status === 'good' ? '#059669' : status === 'warning' ? '#D97706' : '#DC2626'} />
              </linearGradient>
            </defs>

            {/* Needle */}
            <g transform={`rotate(${rotation} 100 100)`}>
              <line
                x1="100"
                y1="100"
                x2="100"
                y2="25"
                stroke="currentColor"
                strokeWidth="3"
                className="text-gray-900 dark:text-white"
              />
              <circle
                cx="100"
                cy="100"
                r="5"
                fill="currentColor"
                className="text-gray-900 dark:text-white"
              />
            </g>

            {/* Center circle */}
            <circle cx="100" cy="100" r="4" fill="currentColor" className="text-gray-900 dark:text-white" />
          </svg>

          {/* Value overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {value.toFixed(1)}
            </span>
            <span className="text-xs text-gray-600 dark:text-gray-400">{unit}</span>
          </div>
        </div>
      </div>

      {/* Status label and stats */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className={`text-xs font-semibold ${colors.text}`}>
            {status === 'good' ? '✓ Good' : status === 'warning' ? '⚠ Warning' : '✗ Critical'}
          </span>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Target: {target}{unit}
          </span>
        </div>

        {/* Breakdown if provided */}
        {breakdown && breakdown.length > 0 && (
          <div className="space-y-1 border-t border-gray-200 pt-2 dark:border-gray-700">
            {breakdown.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400"
              >
                <span>{item.label}</span>
                <span className="font-medium">${item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
