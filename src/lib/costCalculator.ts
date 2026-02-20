import { POTE_UNIT_COST, BARRA_UNIT_COST } from './constants'

export interface ProductCostBreakdown {
  potes: number
  barras: number
  totalCost: number
}

/**
 * Calcula o custo de produção analisando o nome do produto
 * Busca por padrões como:
 * - "Kit 2 Potes" → 2 × POTE_UNIT_COST
 * - "Kit 3 Barras" → 3 × BARRA_UNIT_COST
 * - "Kit 2 Potes + 1 Barra" → (2 × POTE_UNIT_COST) + (1 × BARRA_UNIT_COST)
 * - "Pote 500g" → 1 × POTE_UNIT_COST
 * - "Barra Proteica" → 1 × BARRA_UNIT_COST
 */
export const calculateProductCost = (productName: string): ProductCostBreakdown => {
  if (!productName || typeof productName !== 'string') {
    return { potes: 0, barras: 0, totalCost: 0 }
  }

  const name = productName.toLowerCase().trim()
  let potes = 0
  let barras = 0

  // Regex para detectar "X Potes" ou "X Pote"
  const potesMatch = name.match(/(\d+)\s*potes?/i)
  if (potesMatch) {
    potes = parseInt(potesMatch[1], 10)
  } else if (/potes?|pot(?![a-z])/i.test(name) && !potesMatch) {
    // Se menciona "pote" mas sem número, conta como 1
    potes = 1
  }

  // Regex para detectar "X Barras" ou "X Barra"
  const barrasMatch = name.match(/(\d+)\s*barras?/i)
  if (barrasMatch) {
    barras = parseInt(barrasMatch[1], 10)
  } else if (/barras?|barra\s/i.test(name) && !barrasMatch) {
    // Se menciona "barra" mas sem número, conta como 1
    barras = 1
  }

  const totalCost = potes * POTE_UNIT_COST + barras * BARRA_UNIT_COST

  return { potes, barras, totalCost }
}

/**
 * Calcular custo total para um array de produtos
 */
export const calculateOrderProductCost = (products?: Array<{ name: string }>): number => {
  if (!products || products.length === 0) return 0

  return products.reduce((sum, product) => {
    const cost = calculateProductCost(product.name)
    return sum + cost.totalCost
  }, 0)
}
