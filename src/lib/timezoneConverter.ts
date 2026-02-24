/**
 * Timezone Converter for NuvemShop (BR) and Meta Ads (LA) synchronization
 *
 * NuvemShop: Brasília Time (BRT) = UTC-3 (or BRST = UTC-2)
 * Meta Ads: Los Angeles Time (PST/PDT) = UTC-8 (or UTC-7)
 *
 * Default: Los Angeles timezone (matching Meta Ads analytics)
 */

export type Timezone = 'LA' | 'BR'

interface TimezoneConfig {
  timezone: Timezone
  label: string
  offset: number // Hours from UTC
  abbreviation: string
}

const TIMEZONE_CONFIG: Record<Timezone, TimezoneConfig> = {
  LA: {
    timezone: 'LA',
    label: 'Los Angeles (Padrão)',
    offset: -8, // PST, or -7 PDT
    abbreviation: 'PST/PDT',
  },
  BR: {
    timezone: 'BR',
    label: 'Brasil (Brasília)',
    offset: -3, // BRT, or -2 BRST
    abbreviation: 'BRT/BRST',
  },
}

/**
 * Convert date/time from one timezone to another
 * @param date - ISO string or Date object from NuvemShop/Meta
 * @param fromTimezone - Source timezone ('BR' for NuvemShop, 'LA' for Meta)
 * @param toTimezone - Target timezone for conversion
 * @returns ISO string in target timezone
 */
export function convertTimezone(
  date: string | Date,
  fromTimezone: Timezone,
  toTimezone: Timezone
): string {
  if (fromTimezone === toTimezone) {
    return typeof date === 'string' ? date : date.toISOString()
  }

  const dateObj = typeof date === 'string' ? new Date(date) : date
  const fromConfig = TIMEZONE_CONFIG[fromTimezone]
  const toConfig = TIMEZONE_CONFIG[toTimezone]

  // Calculate offset difference
  const offsetDiff = (toConfig.offset - fromConfig.offset) * 60 * 60 * 1000

  // Apply conversion
  const convertedDate = new Date(dateObj.getTime() + offsetDiff)
  return convertedDate.toISOString()
}

/**
 * Convert NuvemShop order timestamp (BR) to selected timezone
 * @param nuvemshopTimestamp - ISO timestamp from NuvemShop (Brasília time)
 * @param selectedTimezone - User's selected timezone
 * @returns Converted timestamp
 */
export function convertNuvemshopTimestamp(
  nuvemshopTimestamp: string,
  selectedTimezone: Timezone = 'LA'
): string {
  return convertTimezone(nuvemshopTimestamp, 'BR', selectedTimezone)
}

/**
 * Convert Meta Ads timestamp (LA) to selected timezone
 * @param metaTimestamp - ISO timestamp from Meta Ads (Los Angeles time)
 * @param selectedTimezone - User's selected timezone
 * @returns Converted timestamp
 */
export function convertMetaTimestamp(
  metaTimestamp: string,
  selectedTimezone: Timezone = 'LA'
): string {
  return convertTimezone(metaTimestamp, 'LA', selectedTimezone)
}

/**
 * Get hour of day in selected timezone
 * Useful for analyzing sales patterns by hour
 * @param timestamp - ISO timestamp
 * @param timezone - Target timezone
 * @returns Hour (0-23)
 */
export function getHourInTimezone(
  timestamp: string,
  timezone: Timezone = 'LA'
): number {
  const date = new Date(timestamp)
  const config = TIMEZONE_CONFIG[timezone]

  // Adjust for timezone offset
  const utcHours = date.getUTCHours()
  const offsetMinutes = config.offset * 60
  const localHours = (utcHours + Math.round(offsetMinutes / 60) + 24) % 24

  return localHours
}

/**
 * Group orders by hour in selected timezone
 * Used for hourly sales analysis
 */
export function groupOrdersByHour(
  orders: Array<{ order_created_at: string; total: number }>,
  timezone: Timezone = 'LA'
): Record<number, { count: number; total: number }> {
  const grouped: Record<number, { count: number; total: number }> = {}

  // Initialize all hours
  for (let hour = 0; hour < 24; hour++) {
    grouped[hour] = { count: 0, total: 0 }
  }

  // Group orders
  for (const order of orders) {
    const hour = getHourInTimezone(order.order_created_at, timezone)
    grouped[hour].count += 1
    grouped[hour].total += order.total
  }

  return grouped
}

/**
 * Calculate order metrics adjusted for timezone differences
 * This affects ROI/ROAS calculations when comparing spend and sales
 */
export function calculateMetricsWithTimezoneAdjustment(
  orders: Array<{ order_created_at: string; total: number; payment_status: string }>,
  spend: number,
  timezone: Timezone = 'LA'
): {
  roi: number
  roas: number
  adjustedRevenue: number
  timezone: Timezone
} {
  // Filter for paid orders only
  const paidOrders = orders.filter((o) => o.payment_status === 'paid')

  // Calculate total revenue
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0)

  // ROAS = Revenue / Spend
  const roas = spend > 0 ? totalRevenue / spend : 0

  // ROI = (Revenue - Spend) / Spend * 100
  const roi = spend > 0 ? ((totalRevenue - spend) / spend) * 100 : 0

  return {
    roi: Math.round(roi * 100) / 100,
    roas: Math.round(roas * 100) / 100,
    adjustedRevenue: Math.round(totalRevenue * 100) / 100,
    timezone,
  }
}

/**
 * Format timezone label for display
 */
export function getTimezoneLabel(timezone: Timezone): string {
  return TIMEZONE_CONFIG[timezone].label
}

/**
 * Get all available timezones for dropdown selection
 */
export function getAvailableTimezones(): Array<{ value: Timezone; label: string }> {
  return [
    { value: 'LA', label: TIMEZONE_CONFIG.LA.label },
    { value: 'BR', label: TIMEZONE_CONFIG.BR.label },
  ]
}

/**
 * Validate and normalize timezone value
 */
export function normalizeTimezone(value: any): Timezone {
  if (value === 'LA' || value === 'BR') {
    return value as Timezone
  }
  // Default to LA
  return 'LA'
}
