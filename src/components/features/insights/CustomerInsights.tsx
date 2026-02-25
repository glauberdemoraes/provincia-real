import React from 'react'
import { Users, TrendingUp, PieChart } from 'lucide-react'

interface Segment {
  name: string
  count: number
  percentage: number
  avgLTV: number
  color: string
}

interface CustomerInsightsProps {
  totalCustomers: number
  repeatRate: number
  avgLTV: number
  segments: Segment[]
  retentionRate?: number
}

export const CustomerInsights: React.FC<CustomerInsightsProps> = ({
  totalCustomers,
  repeatRate,
  avgLTV,
  segments,
  retentionRate = 0,
}) => {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Customer Insights
        </h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Customer behavior and LTV analysis
        </p>
      </div>

      {/* Key Metrics */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MetricBox label="Total Customers" value={totalCustomers.toLocaleString()} icon={Users} />
        <MetricBox
          label="Repeat Rate"
          value={`${(repeatRate * 100).toFixed(1)}%`}
          icon={TrendingUp}
        />
        <MetricBox
          label="Avg LTV"
          value={`$${avgLTV.toFixed(0)}`}
          icon={Users}
        />
        {retentionRate > 0 && (
          <MetricBox
            label="Retention"
            value={`${(retentionRate * 100).toFixed(1)}%`}
            icon={TrendingUp}
          />
        )}
      </div>

      {/* Segments Distribution */}
      <div className="mb-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
        <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
          <PieChart className="h-4 w-4" />
          Customer Segments
        </h3>

        <div className="space-y-3">
          {segments.map((segment, idx) => (
            <div key={idx}>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {segment.name}
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {segment.percentage.toFixed(1)}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="flex items-center gap-2">
                <div className="h-2 flex-1 rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${segment.percentage}%`,
                      backgroundColor: segment.color,
                    }}
                  />
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {segment.count} ({`$${segment.avgLTV.toFixed(0)} LTV`})
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insights Summary */}
      <div className="border-t border-gray-200 pt-4 dark:border-gray-800">
        <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">
          Key Insights
        </h3>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li>
            • <strong>{(repeatRate * 100).toFixed(1)}%</strong> of customers made repeat purchases
          </li>
          <li>
            • Average customer lifetime value is <strong>${avgLTV.toFixed(0)}</strong>
          </li>
          {segments.length > 0 && (
            <li>
              • Largest segment: <strong>{segments[0].name}</strong> ({segments[0].percentage.toFixed(1)}%)
            </li>
          )}
        </ul>
      </div>
    </div>
  )
}

interface MetricBoxProps {
  label: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
}

const MetricBox: React.FC<MetricBoxProps> = ({ label, value, icon: Icon }) => (
  <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
    <div className="mb-2 flex items-center gap-1">
      <Icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
      <span className="text-xs text-gray-600 dark:text-gray-400">{label}</span>
    </div>
    <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
  </div>
)
