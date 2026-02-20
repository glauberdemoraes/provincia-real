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
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  trend,
  icon,
  isCurrency = true,
  inverseTrend = false,
  subValue,
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

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 flex flex-col justify-between h-full group hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {title}
        </span>
        {icon && <span className="text-slate-300 dark:text-slate-600">{icon}</span>}
      </div>

      <div className="mb-2">
        <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-1">
          {typeof value === 'number' && isCurrency ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value) : value}
        </h3>
        {subValue && <p className="text-[10px] text-slate-400 dark:text-slate-500">{subValue}</p>}
      </div>

      {trend && <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
        <span>vs período anterior</span>
        {getTrendDirection()}
      </div>}
    </div>
  )
}
