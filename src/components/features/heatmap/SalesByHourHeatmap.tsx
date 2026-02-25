import React, { useState, useMemo } from 'react'

interface HeatmapCell {
  day: string
  hour: number
  salesCount: number
  revenue: number
}

interface SalesByHourHeatmapProps {
  data: HeatmapCell[]
  timezone: 'LA' | 'BR'
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const getColorIntensity = (value: number, min: number, max: number) => {
  if (max === 0) return 'rgba(5, 150, 105, 0)'
  const normalized = (value - min) / (max - min)

  // Emerald gradient
  if (normalized < 0.2) return '#F0FDF4' // emerald-50
  if (normalized < 0.4) return '#CCFBF1' // emerald-100
  if (normalized < 0.6) return '#99F6E4' // emerald-200
  if (normalized < 0.8) return '#6EE7B7' // emerald-300
  if (normalized < 0.9) return '#34D399' // emerald-400
  return '#10B981' // emerald-500
}

const getDarkColorIntensity = (value: number, min: number, max: number) => {
  if (max === 0) return 'rgba(5, 150, 105, 0)'
  const normalized = (value - min) / (max - min)

  // Dark emerald gradient
  if (normalized < 0.2) return '#064E3B' // emerald-900
  if (normalized < 0.4) return '#047857' // emerald-700
  if (normalized < 0.6) return '#059669' // emerald-600
  if (normalized < 0.8) return '#10B981' // emerald-500
  if (normalized < 0.9) return '#34D399' // emerald-400
  return '#6EE7B7' // emerald-300
}

export const SalesByHourHeatmap: React.FC<SalesByHourHeatmapProps> = ({
  data,
  timezone,
}) => {
  const [hoveredCell, setHoveredCell] = useState<{ day: string; hour: number } | null>(null)

  // Calculate min/max for color scaling
  const stats = useMemo(() => {
    const revenues = data.map((d) => d.revenue)
    const max = Math.max(...revenues)
    const min = Math.min(...revenues)

    return { max, min }
  }, [data])

  // Create a map for quick data lookup
  const dataMap = useMemo(() => {
    const map = new Map<string, HeatmapCell>()
    data.forEach((cell) => {
      map.set(`${cell.day}-${cell.hour}`, cell)
    })
    return map
  }, [data])

  // Find hovered cell data
  const hoveredData = useMemo(() => {
    if (!hoveredCell) return null
    return dataMap.get(`${hoveredCell.day}-${hoveredCell.hour}`)
  }, [hoveredCell, dataMap])

  const isDark = false // You'll get this from theme context

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Sales by Hour ({timezone === 'LA' ? 'Los Angeles' : 'São Paulo'})
        </h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Peak sales hours for the week (hover for details)
        </p>
      </div>

      {/* Legend */}
      <div className="mb-6 flex items-center gap-4 text-xs">
        <span className="font-medium text-gray-700 dark:text-gray-300">Low</span>
        <div className="flex gap-1">
          {[0, 0.2, 0.4, 0.6, 0.8, 1].map((val) => (
            <div
              key={val}
              className="h-4 w-4 rounded"
              style={{
                backgroundColor: isDark
                  ? getDarkColorIntensity(val, 0, 1)
                  : getColorIntensity(val, 0, 1),
              }}
            />
          ))}
        </div>
        <span className="font-medium text-gray-700 dark:text-gray-300">High</span>
        <span className="ml-4 text-gray-600 dark:text-gray-400">Timezone: {timezone}</span>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-full">
          {/* Hour headers */}
          <div className="mb-2 flex gap-1">
            <div className="w-12 flex-shrink-0" />
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-400"
              >
                {String(hour).padStart(2, '0')}
              </div>
            ))}
          </div>

          {/* Day rows */}
          {DAYS.map((day) => (
            <div key={day} className="mb-1 flex gap-1">
              {/* Day label */}
              <div className="flex w-12 flex-shrink-0 items-center text-xs font-medium text-gray-700 dark:text-gray-300">
                {day}
              </div>

              {/* Cells */}
              {HOURS.map((hour) => {
                const cell = dataMap.get(`${day}-${hour}`)
                const isHovered =
                  hoveredCell?.day === day && hoveredCell?.hour === hour
                const bgColor = cell
                  ? isDark
                    ? getDarkColorIntensity(cell.revenue, stats.min, stats.max)
                    : getColorIntensity(cell.revenue, stats.min, stats.max)
                  : '#F3F4F6'

                return (
                  <div key={`${day}-${hour}`} className="relative">
                    <button
                      className={`h-8 w-8 flex-shrink-0 rounded border-2 transition-all ${
                        isHovered
                          ? 'border-gray-900 shadow-lg dark:border-white'
                          : 'border-gray-300 dark:border-gray-700'
                      }`}
                      style={{ backgroundColor: bgColor }}
                      onMouseEnter={() => setHoveredCell({ day, hour })}
                      onMouseLeave={() => setHoveredCell(null)}
                      title={
                        cell
                          ? `${day} ${String(hour).padStart(2, '0')}:00 - ${cell.salesCount} sales, $${cell.revenue.toFixed(2)}`
                          : undefined
                      }
                    />

                    {/* Tooltip */}
                    {isHovered && cell && (
                      <div className="absolute left-12 top-0 z-50 rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-900">
                        <div className="whitespace-nowrap">
                          <p className="text-xs font-medium text-gray-900 dark:text-white">
                            {day} {String(hour).padStart(2, '0')}:00
                          </p>
                          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                            Sales: {cell.salesCount}
                          </p>
                          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            ${cell.revenue.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Footer stats */}
      {hoveredData && (
        <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-semibold text-gray-900 dark:text-white">
              {hoveredData.day} {String(hoveredData.hour).padStart(2, '0')}:00
            </span>
            {' — '}
            {hoveredData.salesCount} sales, ${hoveredData.revenue.toFixed(2)} revenue
          </p>
        </div>
      )}
    </div>
  )
}
