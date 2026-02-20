// NuvemShop Order Types
export interface NuvemshopProduct {
  id: number
  name: string
  price: string | number
  quantity: number
  sku?: string
}

export interface NuvemshopOrder {
  id: number
  total: string | number
  subtotal: string | number
  shipping_cost_owner: string | number
  payment_status: 'paid' | 'pending' | 'voided' | 'refunded' | 'authorized'
  shipping_status?: 'fulfilled' | 'unfulfilled' | 'partial' | null
  created_at: string
  landing_url?: string
  billing_name?: string
  contact_phone?: string
  billing_phone?: string
  products?: NuvemshopProduct[]
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
}

// Meta Ads Types
export interface MetaAction {
  action_type: string
  value: string | number
}

export interface MetaCampaign {
  campaign_id: string
  campaign_name: string
  account_id: string
  account_name?: string
  spend: string | number
  impressions: string | number
  clicks: string | number
  cpc: string | number
  ctr: string | number
  cpm?: string | number
  actions?: MetaAction[]
  date_start?: string
  date_stop?: string
}

// Dashboard Metrics
export interface MetricTrend {
  value: number
  previousValue: number
  percentage: number
  direction: 'up' | 'down' | 'neutral'
}

export interface DashboardMetrics {
  totalSales: number
  totalSalesTrend: MetricTrend
  totalPaid: number
  totalPaidTrend: MetricTrend
  totalNetPaid: number
  totalNetPaidTrend: MetricTrend
  totalProductionCost: number
  totalProductionCostTrend: MetricTrend
  totalGrossProfit: number
  totalGrossProfitTrend: MetricTrend
  totalAdSpend: number
  totalAdSpendTrend: MetricTrend
  totalNetProfit: number
  totalNetProfitTrend: MetricTrend
  totalUnpaid: number
  totalUnpaidTrend: MetricTrend
  totalShippingCost: number
  totalShippingCostTrend: MetricTrend
  totalOrders: number
  totalOrdersTrend: MetricTrend
  paidOrdersCount: number
  paidOrdersCountTrend: MetricTrend
  averageTicket: number
  averageTicketTrend: MetricTrend
}

export interface UnitMetrics {
  potes: number
  barras: number
  total: number
  cost: number
}

// Alerts
export interface ActiveAlert {
  config_id: string
  name: string
  metric: string
  current_value: number
  threshold: number
  severity: 'info' | 'warning' | 'critical'
  message: string
  fired_at: string
}

export interface AlertConfig {
  id: string
  name: string
  metric: string
  condition: 'less_than' | 'greater_than' | 'equals'
  threshold: number
  severity: 'info' | 'warning' | 'critical'
  enabled: boolean
  message_template?: string
}

// Sync Results
export interface SyncResult {
  success: boolean
  fetched?: number
  upserted?: number
  log_id?: number
  error?: string
}

// Chart Data
export interface ChartData {
  label: string
  originalDate: string
  totalSales: number
  prevTotalSales: number
  paidSales: number
  prevPaidSales: number
  orders?: number
  hour?: number
}

// UTM Analysis
export interface UtmMetric {
  name: string
  count: number
  value: number
  paidCount: number
  paidValue: number
}

export interface UtmAnalysis {
  sources: UtmMetric[]
  campaigns: UtmMetric[]
  products: UtmMetric[]
  mediums: UtmMetric[]
  contents: UtmMetric[]
  terms: UtmMetric[]
}

// Date Range
export interface DateRange {
  start: Date
  end: Date
  label?: string
}

// Payment Status Data
export interface PaymentStatusData {
  label: string
  value: number
  color: string
}

// Target Metrics
export interface TargetMetric {
  totalTarget: number
  currentVal: number
  percentage: number
  isMet: boolean
  remaining: number
  pacePct?: number
  paceValue?: number
}
