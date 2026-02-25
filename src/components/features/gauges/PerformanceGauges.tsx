import React from 'react'
import { GaugeChart } from './GaugeChart'

interface DashboardMetrics {
  roi: number
  roas: number
  conversionRate: number
  revenue: number
  cost: number
  orders: number
}

interface PerformanceGaugesProps {
  metrics: DashboardMetrics
}

const getStatus = (
  metricType: 'roi' | 'roas' | 'conversionRate',
  value: number,
) => {
  switch (metricType) {
    case 'roi':
      return value > 25 ? 'good' : value > 15 ? 'warning' : 'critical'
    case 'roas':
      return value > 3.0 ? 'good' : value > 2.0 ? 'warning' : 'critical'
    case 'conversionRate':
      return value > 3 ? 'good' : value > 1 ? 'warning' : 'critical'
  }
}

export const PerformanceGauges: React.FC<PerformanceGaugesProps> = ({ metrics }) => {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Performance Metrics
        </h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Key performance indicators at a glance
        </p>
      </div>

      {/* Gauges Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* ROI Gauge */}
        <GaugeChart
          label="ROI"
          value={metrics.roi}
          target={30}
          min={-50}
          max={100}
          status={getStatus('roi', metrics.roi)}
          unit="%"
          breakdown={[
            { label: 'Revenue', value: metrics.revenue },
            { label: 'Cost', value: metrics.cost },
          ]}
        />

        {/* ROAS Gauge */}
        <GaugeChart
          label="ROAS"
          value={metrics.roas}
          target={3.5}
          min={0}
          max={6}
          status={getStatus('roas', metrics.roas)}
          unit="x"
          breakdown={[
            { label: 'Total Revenue', value: metrics.revenue },
            { label: 'Ad Spend', value: metrics.cost },
          ]}
        />

        {/* Conversion Rate Gauge */}
        <GaugeChart
          label="Conversion Rate"
          value={metrics.conversionRate}
          target={3.5}
          min={0}
          max={10}
          status={getStatus('conversionRate', metrics.conversionRate)}
          unit="%"
          breakdown={[
            { label: 'Orders', value: metrics.orders },
            { label: 'Cost/Order', value: metrics.cost / Math.max(metrics.orders, 1) },
          ]}
        />
      </div>

      {/* Additional Context */}
      <div className="mt-6 border-t border-gray-200 pt-4 dark:border-gray-800">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Total Revenue</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              ${metrics.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Ad Spend</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              ${metrics.cost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Orders</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {metrics.orders.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
