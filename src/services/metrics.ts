import type { NuvemshopOrder, MetaCampaign, DashboardData, AdCampaignMetrics } from '@/types'
import { saoPauloToLA, getTodayRange_LA, getTodayRange_BR, toBrazil } from '@/lib/timezone'
import { calculateOrderProductCost } from '@/lib/costCalculator'
import { convertUsdToBrl } from './exchangeRate'
import { fetchRetentionMetrics } from './api'

/**
 * Limpar UTM removendo ID numérico após barra vertical
 * "Campanha|12345678" → "Campanha"
 * Também decodifica URL-encoded values (ex: %7C para |)
 */
const cleanUtmValue = (raw: string): string => {
  try {
    return decodeURIComponent(raw).split('|')[0].trim()
  } catch {
    return raw.split('|')[0].trim()
  }
}

/**
 * Calcular SKU Mix (receita por categoria: pote, barra, kits)
 */
const calculateSkuMix = (
  paidOrders: NuvemshopOrder[]
): {
  pote680g: { revenue: number; pct: number }
  barra400g: { revenue: number; pct: number }
  kits: { revenue: number; pct: number }
} => {
  let poteRevenue = 0
  let barraRevenue = 0
  let kitsRevenue = 0
  let totalRevenue = 0

  paidOrders.forEach((order) => {
    const orderTotal = Number(order.total)
    if (!order.products) return

    // Calcular proporção de receita por produto
    const productCosts = order.products.map(p => Number(p.price) * Number(p.quantity))
    const productSum = productCosts.reduce((a, b) => a + b, 0)

    order.products.forEach((product) => {
      const productRevenue = (Number(product.price) * Number(product.quantity)) / (productSum || 1) * orderTotal
      const name = product.name.toLowerCase()

      if (name.includes('pote') || name.includes('680')) {
        poteRevenue += productRevenue
      } else if (name.includes('barra') || name.includes('400')) {
        barraRevenue += productRevenue
      } else if (name.includes('kit')) {
        kitsRevenue += productRevenue
      }
    })
    totalRevenue += orderTotal
  })

  return {
    pote680g: {
      revenue: Math.round(poteRevenue * 100) / 100,
      pct: totalRevenue > 0 ? (poteRevenue / totalRevenue) * 100 : 0,
    },
    barra400g: {
      revenue: Math.round(barraRevenue * 100) / 100,
      pct: totalRevenue > 0 ? (barraRevenue / totalRevenue) * 100 : 0,
    },
    kits: {
      revenue: Math.round(kitsRevenue * 100) / 100,
      pct: totalRevenue > 0 ? (kitsRevenue / totalRevenue) * 100 : 0,
    },
  }
}

/**
 * Comparação EXATA de campanha (sem normalização)
 * Usa o nome exatamente como vem: maiúsculas, espaços, hífens, etc.
 */
const getCampaignKey = (name: string): string => {
  return name.trim() // Apenas remove espaços extras nas pontas
}

/**
 * Calcular métricas consolidadas para um período
 * Recebe orders, campanhas Meta Ads, taxa de câmbio e timezone
 */
export const calculateDashboardMetrics = async (
  orders: NuvemshopOrder[],
  metaCampaigns: MetaCampaign[],
  exchangeRate: number,
  period?: { start: Date; end: Date; label: string },
  timezone: 'LA' | 'BR' = 'LA'
): Promise<DashboardData> => {
  // Usar período padrão baseado no timezone se não fornecido
  if (!period) {
    if (timezone === 'BR') {
      const { start, end } = getTodayRange_BR()
      period = { start, end, label: 'Hoje (BR)' }
    } else {
      const { start, end } = getTodayRange_LA()
      period = { start, end, label: 'Hoje (LA)' }
    }
  }

  // Converter datas NuvemShop de São Paulo para o timezone correto e filtrar pelo período
  const convertOrderDate = (isoString: string) => {
    return timezone === 'BR' ? toBrazil(isoString) : saoPauloToLA(isoString)
  }

  console.log(`[Metrics] Filtrando ${orders.length} orders para período (${timezone}):`, {
    periodStart: period!.start.toISOString(),
    periodEnd: period!.end.toISOString(),
    sampleOrders: orders.slice(0, 3).map(o => ({
      id: o.id,
      created_at: o.created_at,
      utm_campaign: o.utm_campaign,
      tzDate: convertOrderDate(o.created_at).toISOString()
    }))
  })

  const filteredOrders = orders.filter((order) => {
    const orderDate = convertOrderDate(order.created_at)
    const isInRange = orderDate >= period!.start && orderDate <= period!.end
    return isInRange
  })

  console.log(`[Metrics] Resultado: ${filteredOrders.length} orders dentro do período`)

  // Separar pedidos pagos
  const paidOrders = filteredOrders.filter((o) => o.payment_status === 'paid')

  // Calcular receita bruta e paga
  const grossRevenue = filteredOrders.reduce((sum, o) => sum + Number(o.total), 0)
  const paidRevenue = paidOrders.reduce((sum, o) => sum + Number(o.total), 0)

  // Calcular custos de produto e frete
  let productCost = 0
  let shippingCost = 0

  paidOrders.forEach((order) => {
    productCost += calculateOrderProductCost(order.products)
    shippingCost += Number(order.shipping_cost_owner || 0)
  })

  // Lucro bruto (vendas pagas - custos de produto - frete)
  const grossProfit = paidRevenue - productCost - shippingCost

  // Converter spend Meta Ads de USD para BRL
  let totalAdSpend = 0
  const spendMap = new Map<string, number>()

  for (const campaign of metaCampaigns) {
    const spend = await convertUsdToBrl(Number(campaign.spend), period.start)
    totalAdSpend += spend
    // Usar nome EXATO da campanha (sem normalização)
    spendMap.set(getCampaignKey(campaign.campaign_name), spend)
  }

  // Lucro líquido (lucro bruto - spend de ads)
  const netProfit = grossProfit - totalAdSpend

  // ROAS geral (receita paga / spend total)
  const roas = totalAdSpend > 0 ? paidRevenue / totalAdSpend : 0

  // ROI geral (lucro líquido / custos totais × 100)
  const totalCosts = productCost + shippingCost + totalAdSpend
  const roi = totalCosts > 0 ? (netProfit / totalCosts) * 100 : 0

  // Calcular métricas por campanha
  const campaigns = calculateCampaignMetrics(paidOrders, metaCampaigns, spendMap)

  // ===== Wave 1: 25 KPIs em 5 categorias =====

  // 1. TRAÇÃO E VENDAS
  const aov = paidOrders.length > 0 ? paidRevenue / paidOrders.length : 0
  const conversionRate = filteredOrders.length > 0 ? (paidOrders.length / filteredOrders.length) * 100 : 0

  // SKU Mix (pote, barra, kits)
  const skuMix = calculateSkuMix(paidOrders)
  const kitOrders = paidOrders.filter(o => {
    const hasKit = o.products?.some(p => p.name.toLowerCase().includes('kit'))
    return hasKit
  })
  const kitOrdersPct = paidOrders.length > 0 ? (kitOrders.length / paidOrders.length) * 100 : 0

  // Taxa de tráfego orgânico (sem utm_campaign)
  const organicOrders = paidOrders.filter(o => !o.utm_campaign)
  const organicPct = paidOrders.length > 0 ? (organicOrders.length / paidOrders.length) * 100 : 0

  // 2. LUCRATIVIDADE
  const mcu = paidOrders.length > 0 ? grossProfit / paidOrders.length : 0
  const netMarginPct = paidRevenue > 0 ? (netProfit / paidRevenue) * 100 : 0
  const productRoi = productCost > 0 ? (grossProfit / productCost) * 100 : 0
  const breakeven = aov > 0 ? Math.ceil(totalCosts / aov) : 0

  // 3. MARKETING & ADS
  let totalClicks = 0
  let totalImpressions = 0
  const cpcValues: number[] = []
  const cpmValues: number[] = []

  for (const campaign of metaCampaigns) {
    totalClicks += Number(campaign.clicks)
    totalImpressions += Number(campaign.impressions)
    const cpc = Number(campaign.cpc) || 0
    const cpm = Number(campaign.cpm) || 0
    if (cpc > 0) cpcValues.push(cpc)
    if (cpm > 0) cpmValues.push(cpm)
  }

  const cac = paidOrders.length > 0 ? totalAdSpend / paidOrders.length : 0
  const cpa = totalClicks > 0 ? totalAdSpend / totalClicks : 0
  const avgCpcUsd = cpcValues.length > 0 ? cpcValues.reduce((a, b) => a + b, 0) / cpcValues.length : 0
  const avgCpmUsd = cpmValues.length > 0 ? cpmValues.reduce((a, b) => a + b, 0) / cpmValues.length : 0
  const avgCpcBrl = await convertUsdToBrl(avgCpcUsd, period.start)
  const avgCpmBrl = await convertUsdToBrl(avgCpmUsd, period.start)

  // 4. RETENÇÃO
  const retention = await fetchRetentionMetrics()

  // 5. LOGÍSTICO-FINANCEIRO
  const freeShippingImpact = paidOrders.reduce((sum, o) => sum + Number(o.shipping_cost_owner || 0), 0)
  const freeShippingPct = paidOrders.length > 0 ? (paidOrders.filter(o => Number(o.shipping_cost_owner) > 0).length / paidOrders.length) * 100 : 0
  const gatewayFees = paidRevenue * 0.033

  // 6. COCKPIT ESTRATÉGICO
  const ltvCacRatio = cac > 0 ? retention.avgLtv / cac : 0
  const COCKPIT_METAS = {
    roas: 4.0,
    aov: 100.0,
    netMarginPct: 25,
    ltvCacRatio: 3.0,
  }

  const cockpitItems: Array<{
    metric: string
    value: number
    formatted: string
    meta: number
    metaFormatted: string
    status: 'green' | 'amber' | 'red'
  }> = [
    {
      metric: 'ROAS',
      value: roas,
      formatted: `${roas.toFixed(2)}x`,
      meta: COCKPIT_METAS.roas,
      metaFormatted: `${COCKPIT_METAS.roas.toFixed(2)}x`,
      status: roas >= COCKPIT_METAS.roas ? 'green' : roas >= 1 ? 'amber' : 'red',
    },
    {
      metric: 'Ticket Médio',
      value: aov,
      formatted: `R$ ${aov.toFixed(2)}`,
      meta: COCKPIT_METAS.aov,
      metaFormatted: `R$ ${COCKPIT_METAS.aov.toFixed(2)}`,
      status: aov >= COCKPIT_METAS.aov ? 'green' : aov >= 80 ? 'amber' : 'red',
    },
    {
      metric: 'Margem Líquida',
      value: netMarginPct,
      formatted: `${netMarginPct.toFixed(1)}%`,
      meta: COCKPIT_METAS.netMarginPct,
      metaFormatted: `${COCKPIT_METAS.netMarginPct}%`,
      status: netMarginPct >= COCKPIT_METAS.netMarginPct ? 'green' : netMarginPct >= 15 ? 'amber' : 'red',
    },
    {
      metric: 'LTV/CAC',
      value: ltvCacRatio,
      formatted: `${ltvCacRatio.toFixed(2)}x`,
      meta: COCKPIT_METAS.ltvCacRatio,
      metaFormatted: `${COCKPIT_METAS.ltvCacRatio.toFixed(2)}x`,
      status: ltvCacRatio >= COCKPIT_METAS.ltvCacRatio ? 'green' : ltvCacRatio >= 1.5 ? 'amber' : 'red',
    },
  ]

  return {
    period,
    exchangeRate,
    orders: {
      total: filteredOrders.length,
      paid: paidOrders.length,
    },
    revenue: {
      gross: grossRevenue,
      paid: paidRevenue,
    },
    costs: {
      products: productCost,
      shipping: shippingCost,
      adSpend: totalAdSpend,
      total: totalCosts,
    },
    profit: {
      gross: grossProfit,
      net: netProfit,
    },
    roas: Math.round(roas * 100) / 100,
    roi: Math.round(roi * 100) / 100,
    campaigns,

    // Wave 1: 25 KPIs
    traction: {
      aov: Math.round(aov * 100) / 100,
      conversionRate: Math.round(conversionRate * 100) / 100,
      skuMix,
      kitOrdersPct: Math.round(kitOrdersPct * 100) / 100,
      organicPct: Math.round(organicPct * 100) / 100,
    },

    profitability: {
      mcu: Math.round(mcu * 100) / 100,
      netMarginPct: Math.round(netMarginPct * 100) / 100,
      productRoi: Math.round(productRoi * 100) / 100,
      breakeven,
    },

    marketing: {
      cac: Math.round(cac * 100) / 100,
      cpa: Math.round(cpa * 100) / 100,
      totalClicks,
      totalImpressions,
      avgCpcBrl: Math.round(avgCpcBrl * 100) / 100,
      avgCpmBrl: Math.round(avgCpmBrl * 100) / 100,
    },

    retention: {
      avgLtv: Math.round(retention.avgLtv * 100) / 100,
      retentionRate: Math.round(retention.retentionRate * 100) / 100,
      churnRate: Math.round(retention.churnRate * 100) / 100,
      avgFrequency: Math.round(retention.avgFrequency * 100) / 100,
      avgRecencyDays: Math.round(retention.avgRecencyDays * 100) / 100,
    },

    logistics: {
      freeShippingImpact: Math.round(freeShippingImpact * 100) / 100,
      freeShippingPct: Math.round(freeShippingPct * 100) / 100,
      gatewayFees: Math.round(gatewayFees * 100) / 100,
    },

    cockpit: {
      ltvCacRatio: Math.round(ltvCacRatio * 100) / 100,
      items: cockpitItems,
    },
  }
}

/**
 * Calcular métricas por campanha
 * Cruza utm_campaign dos pedidos com campaign_name das campanhas Meta Ads
 */
const calculateCampaignMetrics = (
  paidOrders: NuvemshopOrder[],
  metaCampaigns: MetaCampaign[],
  spendMap: Map<string, number>
): AdCampaignMetrics[] => {
  const campaignMap = new Map<string, AdCampaignMetrics>()

  // Debug: Analisar utm_campaign dos primeiros pedidos
  if (paidOrders.length > 0) {
    console.log('[Metrics] Amostra de utm_campaign recebidos:')
    paidOrders.slice(0, 3).forEach((order, i) => {
      console.log(`  [${i}] utm_campaign="${order.utm_campaign}" (tipo: ${typeof order.utm_campaign})`)
      const cleanedUtm = cleanUtmValue(order.utm_campaign || 'Direto')
      console.log(`      → cleanUtmValue: "${cleanedUtm}"`)
    })
  }

  // Processar cada pedido pago
  paidOrders.forEach((order) => {
    // Usar nome EXATO (sem normalização)
    const cleanedUtm = cleanUtmValue(order.utm_campaign || 'Direto')
    const campaignKey = getCampaignKey(cleanedUtm)

    if (!campaignMap.has(campaignKey)) {
      campaignMap.set(campaignKey, {
        campaign_id: campaignKey,
        campaign_name: cleanedUtm,
        orders: 0,
        sales: 0,
        spend: 0,
        productCost: 0,
        shippingCost: 0,
        profit: 0,
        roas: 0,
        roi: 0,
      })
    }

    const metrics = campaignMap.get(campaignKey)!
    metrics.orders += 1
    metrics.sales += Number(order.total)
    metrics.productCost += calculateOrderProductCost(order.products)
    metrics.shippingCost += Number(order.shipping_cost_owner || 0)
  })

  // Debug: Matching entre utm_campaign e meta campaigns
  console.log('[Metrics] Campanhas Meta Ads recebidas:')
  metaCampaigns.slice(0, 3).forEach((campaign) => {
    const key = getCampaignKey(campaign.campaign_name)
    console.log(`  Meta: "${campaign.campaign_name}" → key: "${key}"`)
  })

  // Debug: Campanhas do mapa antes de adicionar spend
  console.log('[Metrics] Campanhas UTM encontradas nos orders:')
  Array.from(campaignMap.keys()).slice(0, 5).forEach((key) => {
    console.log(`  UTM: "${key}"`)
  })

  // Adicionar spend Meta Ads
  metaCampaigns.forEach((campaign) => {
    const key = getCampaignKey(campaign.campaign_name)
    const spend = spendMap.get(key) || 0
    const hasMatch = campaignMap.has(key)

    if (spend > 0 && !hasMatch) {
      console.log(`[Metrics] ⚠️  Meta campaign sem match nos orders: "${campaign.campaign_name}"`)
    }

    if (!campaignMap.has(key)) {
      campaignMap.set(key, {
        campaign_id: campaign.campaign_id,
        campaign_name: campaign.campaign_name,
        orders: 0,
        sales: 0,
        spend,
        productCost: 0,
        shippingCost: 0,
        profit: 0,
        roas: 0,
        roi: 0,
      })
    } else {
      const metrics = campaignMap.get(key)!
      metrics.spend = spend
      if (spend > 0) {
        console.log(`[Metrics] ✅ Match encontrado: "${campaign.campaign_name}" = "${metrics.campaign_name}" (orders: ${metrics.orders}, spend: R$ ${spend})`)
      }
    }
  })

  // Calcular ROAS e ROI por campanha
  campaignMap.forEach((metrics) => {
    metrics.profit = metrics.sales - metrics.productCost - metrics.shippingCost - metrics.spend
    metrics.roas = metrics.spend > 0 ? Math.round((metrics.sales / metrics.spend) * 100) / 100 : 0
    const totalCosts = metrics.spend + metrics.productCost + metrics.shippingCost
    metrics.roi =
      totalCosts > 0 ? Math.round((metrics.profit / totalCosts) * 100 * 100) / 100 : 0
  })

  // Ordenar por spend (decrescente)
  return Array.from(campaignMap.values()).sort((a, b) => b.spend - a.spend)
}
