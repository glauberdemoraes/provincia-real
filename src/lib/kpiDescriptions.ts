/**
 * Descrições, fórmulas e utilidades dos KPIs
 */
export const KPI_DESCRIPTIONS = {
  // Análise por Campanha
  campaign: {
    roas: {
      label: 'ROAS',
      description: 'Retorno sobre Gasto em Anúncios',
      formula: 'Vendas / Gasto em Anúncios',
      utility: 'Quanto você ganha para cada real gasto em publicidade. Quanto maior, melhor.',
    },
    roi: {
      label: 'ROI',
      description: 'Retorno sobre Investimento',
      formula: 'Lucro / Custos Totais × 100',
      utility: 'Percentual de lucro gerado pelos custos investidos. Meta: acima de 30%.',
    },
    spend: {
      label: 'Gasto',
      description: 'Investimento em Publicidade',
      formula: 'Soma de gastos da campanha',
      utility: 'Total investido em anúncios. Controle seu orçamento de marketing.',
    },
    profit: {
      label: 'Lucro',
      description: 'Lucro da Campanha',
      formula: 'Vendas - Custos de Produtos - Frete - Gasto em Anúncios',
      utility: 'Lucro real da campanha. Inclui todos os custos operacionais.',
    },
  },

  // Dashboard Principal (Wave 1)
  traction: {
    aov: {
      label: 'Ticket Médio',
      description: 'Valor Médio por Pedido',
      formula: 'Total de Vendas / Número de Pedidos',
      utility: 'Valor médio que cada cliente gasta. Aumentar AOV melhora a rentabilidade.',
    },
    conversionRate: {
      label: 'Taxa de Conversão',
      description: 'Percentual de Visitantes que Compram',
      formula: 'Pedidos Pagos / Pedidos Totais × 100',
      utility: 'Qualidade do seu funil de vendas. Meta: acima de 3%.',
    },
    kitOrdersPct: {
      label: '% Pedidos com Kit',
      description: 'Proporção de Pedidos que Incluem Kits',
      formula: 'Pedidos com Kit / Total de Pedidos × 100',
      utility: 'Produtos em bundle têm maior margem. Aumentar este % melhora lucratividade.',
    },
    organicPct: {
      label: '% Tráfego Orgânico',
      description: 'Percentual de Pedidos sem Campanha UTM',
      formula: 'Pedidos sem utm_campaign / Total de Pedidos × 100',
      utility: 'Tráfego sem publicidade paga. Indica força de marca e SEO.',
    },
  },

  profitability: {
    mcu: {
      label: 'MCU',
      description: 'Margem Contribuição Unitária',
      formula: 'Lucro Bruto / Número de Pedidos',
      utility: 'Quanto cada pedido contribui para cobrir custos fixos.',
    },
    netMarginPct: {
      label: 'Margem Líquida',
      description: 'Percentual de Lucro sobre Vendas',
      formula: 'Lucro Líquido / Vendas Pagas × 100',
      utility: 'Eficiência final de seu negócio. Meta: acima de 25%.',
    },
    productRoi: {
      label: 'ROI Produto',
      description: 'Retorno sobre Custos de Produtos',
      formula: 'Lucro Bruto / Custos de Produtos × 100',
      utility: 'Quanto você ganha para cada real gasto em produtos.',
    },
    breakeven: {
      label: 'Ponto de Equilíbrio',
      description: 'Pedidos Necessários para Cobrir Custos',
      formula: 'Custos Totais / Ticket Médio (arredondado para cima)',
      utility: 'Quantos pedidos você precisa para zerar os custos.',
    },
  },

  marketing: {
    cac: {
      label: 'CAC',
      description: 'Custo de Aquisição de Cliente',
      formula: 'Gasto Total em Publicidade / Número de Clientes Novos',
      utility: 'Quanto você gasta para adquirir cada novo cliente.',
    },
    cpa: {
      label: 'CPA',
      description: 'Custo por Aquisição/Venda',
      formula: 'Gasto em Publicidade / Número de Conversões',
      utility: 'Quanto você gasta para gerar cada venda. Quanto menor, melhor.',
    },
    avgCpc: {
      label: 'CPC Médio',
      description: 'Custo Médio por Clique',
      formula: 'Gasto Total / Total de Cliques',
      utility: 'Quanto você paga em média por cada clique em seus anúncios.',
    },
    avgCpm: {
      label: 'CPM Médio',
      description: 'Custo por Mil Impressões',
      formula: 'Gasto Total / (Impressões / 1000)',
      utility: 'Quanto você paga para mostrar seus anúncios 1000 vezes.',
    },
  },

  retention: {
    avgLtv: {
      label: 'LTV Médio',
      description: 'Valor Vitalício do Cliente',
      formula: 'Soma de todas as compras de clientes recorrentes',
      utility: 'Quanto um cliente gasta em toda sua vida útil. Quanto maior, melhor.',
    },
    retentionRate: {
      label: 'Taxa de Recompra',
      description: 'Percentual de Clientes que Voltam',
      formula: 'Clientes que compraram mais de uma vez / Total de Clientes × 100',
      utility: 'Fidelização. Clientes recorrentes são mais lucrativos.',
    },
    churnRate: {
      label: 'Churn Rate',
      description: 'Taxa de Abandono de Clientes',
      formula: '100% - Taxa de Recompra',
      utility: 'Quanto menor melhor. Indica insatisfação ou falta de fidelidade.',
    },
    avgFrequency: {
      label: 'Frequência de Compra',
      description: 'Quantas Vezes o Cliente Compra',
      formula: 'Soma de compras / Número de clientes únicos',
      utility: 'Clientes que compram mais frequentemente geram mais receita.',
    },
  },

  logistics: {
    freeShippingImpact: {
      label: 'Impacto Frete Grátis',
      description: 'Custo Total de Frete Oferecido',
      formula: 'Soma de custos de frete em pedidos com frete grátis',
      utility: 'Quanto você está gastando com frete grátis. Analise ROI dessa estratégia.',
    },
    freeShippingPct: {
      label: '% Frete Grátis',
      description: 'Proporção de Pedidos com Frete Grátis',
      formula: 'Pedidos com frete grátis / Total de Pedidos × 100',
      utility: 'Frete grátis aumenta conversão, mas custa. Otimize este percentual.',
    },
    gatewayFees: {
      label: 'Taxa Gateway',
      description: 'Custos de Processamento de Pagamento',
      formula: 'Vendas Pagas × 3.3% (taxa média)',
      utility: 'Custos com processadora de pagamento. Negocie para reduzir.',
    },
  },

  cockpit: {
    roas: {
      label: 'ROAS',
      description: 'Retorno sobre Gasto em Anúncios',
      formula: 'Vendas Pagas / Gasto Total em Publicidade',
      utility: 'Meta: 4.0x ou acima. Quanto maior, mais eficiente sua publicidade.',
    },
    aov: {
      label: 'Ticket Médio',
      description: 'Valor Médio por Pedido',
      formula: 'Total de Vendas / Número de Pedidos',
      utility: 'Meta: R$ 100 ou acima. Impacta diretamente na rentabilidade.',
    },
    netMarginPct: {
      label: 'Margem Líquida',
      description: 'Percentual de Lucro sobre Vendas',
      formula: 'Lucro Líquido / Vendas Pagas × 100',
      utility: 'Meta: 25% ou acima. Seu lucro final após todos os custos.',
    },
    ltvCacRatio: {
      label: 'LTV/CAC',
      description: 'Proporção entre Valor Vitalício e Custo de Aquisição',
      formula: 'LTV Médio / CAC',
      utility: 'Meta: 3.0x ou acima. Quanto maior, mais eficiente sua aquisição.',
    },
  },
}

export type KpiKey = keyof typeof KPI_DESCRIPTIONS
export type SubKpiKey<K extends KpiKey> = keyof typeof KPI_DESCRIPTIONS[K]

export function getKpiDescription(
  category: KpiKey,
  metric: string,
): {
  label: string
  description: string
  formula: string
  utility: string
} | null {
  const cat = KPI_DESCRIPTIONS[category]
  if (!cat) return null
  const item = (cat as Record<string, unknown>)[metric]
  if (!item) return null
  return item as {
    label: string
    description: string
    formula: string
    utility: string
  }
}
