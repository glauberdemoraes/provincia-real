export const DAILY_REVENUE_TARGET = Number(import.meta.env.VITE_DAILY_REVENUE_TARGET) || 5000
export const POTE_UNIT_COST = Number(import.meta.env.VITE_POTE_UNIT_COST) || 16
export const BARRA_UNIT_COST = Number(import.meta.env.VITE_BARRA_UNIT_COST) || 8
export const DAILY_PROFIT_TARGET = 1000

export const ITEMS_PER_PAGE = 10
export const DEFAULT_EMPTY_UTM = '(Direto / Sem UTM)'
export const US_ACCOUNT_ID = '2037936660447316'

// Timezone helpers
export const toLATime = (isoString: string): Date => {
  if (!isoString) return new Date()
  try {
    const date = new Date(isoString)
    if (isNaN(date.getTime())) return new Date()
    const laString = date.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })
    return new Date(laString)
  } catch (e) {
    console.warn('Date parsing error (LA)', e)
    return new Date()
  }
}

export const toBrazilTime = (isoString: string): Date => {
  if (!isoString) return new Date()
  try {
    const date = new Date(isoString)
    if (isNaN(date.getTime())) return new Date()
    const brString = date.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' })
    return new Date(brString)
  } catch (e) {
    console.warn('Date parsing error (BR)', e)
    return new Date()
  }
}
