/**
 * Hook for timezone conversion in React components
 * Automatically converts order timestamps and metrics based on selected timezone
 */

import { useState, useCallback, useMemo } from 'react'
import {
  type Timezone,
  convertNuvemshopTimestamp,
  getHourInTimezone,
  calculateMetricsWithTimezoneAdjustment,
  normalizeTimezone,
} from '@/lib/timezoneConverter'

interface Order {
  id: string | number
  order_created_at: string
  total: number
  payment_status: string
}

interface UseTimezoneConversionReturn {
  timezone: Timezone
  setTimezone: (tz: Timezone) => void
  convertOrderTimestamp: (timestamp: string) => string
  getOrderHour: (timestamp: string) => number
  convertedOrders: Order[]
  metrics: {
    roi: number
    roas: number
    adjustedRevenue: number
    timezone: Timezone
  }
}

/**
 * Hook to manage timezone conversion for orders and metrics
 * @param orders - Array of orders from Supabase
 * @param spend - Total advertising spend
 * @param defaultTimezone - Default timezone (LA or BR)
 * @returns Object with timezone state and conversion functions
 */
export function useTimezoneConversion(
  orders: Order[] = [],
  spend: number = 0,
  defaultTimezone: Timezone = 'LA'
): UseTimezoneConversionReturn {
  const [timezone, setTimezone] = useState<Timezone>(normalizeTimezone(defaultTimezone))

  // Convert order timestamps to selected timezone
  const convertedOrders = useMemo(() => {
    if (!orders || orders.length === 0) return []

    return orders.map((order) => ({
      ...order,
      order_created_at: convertNuvemshopTimestamp(order.order_created_at, timezone),
    }))
  }, [orders, timezone])

  // Calculate metrics in selected timezone
  const metrics = useMemo(() => {
    return calculateMetricsWithTimezoneAdjustment(orders, spend, timezone)
  }, [orders, spend, timezone])

  // Function to convert individual timestamps
  const convertOrderTimestamp = useCallback(
    (timestamp: string): string => {
      return convertNuvemshopTimestamp(timestamp, timezone)
    },
    [timezone]
  )

  // Function to get hour in selected timezone
  const getOrderHour = useCallback(
    (timestamp: string): number => {
      return getHourInTimezone(timestamp, timezone)
    },
    [timezone]
  )

  return {
    timezone,
    setTimezone,
    convertOrderTimestamp,
    getOrderHour,
    convertedOrders,
    metrics,
  }
}

/**
 * Hook to sync timezone selection with localStorage
 * Persists user's timezone preference across sessions
 */
export function useTimezoneStorage(key: string = 'provincia-timezone'): {
  timezone: Timezone
  setTimezone: (tz: Timezone) => void
} {
  const [timezone, setTimezoneState] = useState<Timezone>(() => {
    if (typeof window === 'undefined') return 'LA'

    const stored = localStorage.getItem(key)
    return normalizeTimezone(stored) || 'LA'
  })

  const setTimezone = useCallback(
    (tz: Timezone) => {
      setTimezoneState(tz)
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, tz)
      }
    },
    [key]
  )

  return { timezone, setTimezone }
}

/**
 * Hook to listen for timezone changes and trigger data refresh
 * Useful for live updating metrics when user changes timezone
 */
export function useTimezoneListener(
  onTimezoneChange?: (timezone: Timezone) => void
): {
  timezone: Timezone
  setTimezone: (tz: Timezone) => void
} {
  const [timezone, setTimezoneState] = useState<Timezone>('LA')

  const setTimezone = useCallback(
    (tz: Timezone) => {
      setTimezoneState(tz)
      onTimezoneChange?.(tz)
    },
    [onTimezoneChange]
  )

  return { timezone, setTimezone }
}
