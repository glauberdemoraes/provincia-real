import type { NuvemshopOrder, MetaCampaign, DashboardData, AdCampaignMetrics } from '@/types'
import { saoPauloToLA, getTodayRange_LA, getTodayRange_BR, toBrazil } from '@/lib/timezone'
import { calculateOrderProductCost } from '@/lib/costCalculator'
import { convertUsdToBrl } from './exchangeRate'

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
