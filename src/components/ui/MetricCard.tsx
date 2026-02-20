import type { ReactNode } from 'react'
import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { MetricTrend } from '@/types'

interface MetricCardProps {
  title: string
  value: string | number
  trend?: MetricTrend
  icon?: ReactNode
  isCurrency?: boolean
  inverseTrend?: boolean
  subValue?: string
  // Novos props para redesign
  variant?: 'default' | 'hero' | 'muted'
  badge?: { label: string; color: 'green' | 'amber' | 'red' | 'blue' }
  valueColor?: 'default' | 'green' | 'red' | 'amber' | 'blue'
  placeholder?: string
}

const getValueColorClass = (color?: string): string => {
  switch (color) {
    case 'green':
      return 'text-emerald-600 dark:text-emerald-400'
    case 'red':
      return 'text-red-600 dark:text-red-400'
    case 'amber':
      return 'text-amber-600 dark:text-amber-400'
    case 'blue':
      return 'text-blue-600 dark:text-blue-400'
    default:
      return 'text-zinc-900 dark:text-zinc-50'
  }
}

const getBadgeColorClass = (color: string): string => {
  switch (color) {
    case 'green':
      return 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
    case 'amber':
      return 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
    case 'red':
      return 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
    case 'blue':
      return 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
    default:
      return 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300'
  }
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  trend,
  icon,
  isCurrency = true,
  inverseTrend = false,
  subValue,
  variant = 'default',
  badge,
  valueColor = 'default',
  placeholder,
}) => {
  const getTrendDirection = () => {
    if (!trend) return null

    const direction = inverseTrend ? (trend.direction === 'up' ? 'down' : trend.direction === 'down' ? 'up' : 'neutral') : trend.direction

    const isPositive = direction === 'up'
    const iconClass = isPositive ? 'text-emerald-500' : direction === 'down' ? 'text-rose-500' : 'text-slate-400'

    return (
      <div className="flex items-center gap-1">
        {isPositive ? (
          <TrendingUp className={`w-4 h-4 ${iconClass}`} />
        ) : direction === 'down' ? (
          <TrendingDown className={`w-4 h-4 ${iconClass}`} />
        ) : (
          <Minus className={`w-4 h-4 ${iconClass}`} />
        )}
        <span className={`text-xs font-bold ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : direction === 'down' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500'}`}>
          {Math.abs(trend.percentage).toFixed(1)}%
        </span>
      </div>
    )
  }

  // Variante hero: borda esquerda grossa para destaque
  const isHero = variant === 'hero'
  const isMuted = variant === 'muted'

  const borderClass = isHero ? 'border-l-4 border-l-emerald-500' : ''
  const bgClass = isMuted
    ? 'bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800'
    : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
  const valueTextClass = isMuted ? 'text-zinc-500 dark:text-zinc-400' : getValueColorClass(valueColor)

  return (
    <div
      className={`rounded-xl border shadow-sm p-5 flex flex-col justify-between h-full group hover:border-zinc-300 dark:hover:border-zinc-700 transition-all ${borderClass} ${bgClass}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          {title}
        </span>
        {icon && <span className="text-zinc-400 dark:text-zinc-600">{icon}</span>}
      </div>

      <div className="mb-2">
        <h3 className={`text-3xl font-bold mb-1 ${
          !value || value === 0 ? 'text-zinc-400 dark:text-zinc-600' : valueTextClass
        }`}>
          {!value || value === 0
            ? placeholder || '–'
            : typeof value === 'number' && isCurrency
              ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
              : value}
        </h3>
        <div className="flex items-center gap-2">
          {subValue && <p className="text-xs text-zinc-500 dark:text-zinc-400">{subValue}</p>}
          {badge && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getBadgeColorClass(badge.color)}`}>
              {badge.label}
            </span>
          )}
        </div>
      </div>

      {trend && (
        <div className="flex items-center justify-between text-xs font-medium text-zinc-500 dark:text-zinc-400">
          <span>vs período anterior</span>
          {getTrendDirection()}
        </div>
      )}
    </div>
  )
}
