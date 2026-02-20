/**
 * Timezone utilities for NuvemShop (São Paulo UTC-3) and Meta Ads (Los Angeles UTC-8)
 */

/** Converter timestamp ISO para horário de Los Angeles */
export const toLA = (isoString: string): Date => {
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

/** Converter timestamp ISO para horário de São Paulo (NuvemShop) */
export const toBrazil = (isoString: string): Date => {
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

/** Converter horário de São Paulo para Los Angeles */
export const saoPauloToLA = (isoString: string): Date => {
  return toLA(isoString)
}

/** Verificar se uma data é "hoje" no fuso de Los Angeles */
export const isToday_LA = (date: Date): boolean => {
  const now = new Date()
  const laString = now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })
  const laToday = new Date(laString)

  const dateString = date.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })
  const dateLA = new Date(dateString)

  return laToday.toDateString() === dateLA.toDateString()
}

/** Retornar início e fim do dia atual em Los Angeles */
export const getTodayRange_LA = (): { start: Date; end: Date } => {
  const now = new Date()
  const laString = now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })
  const laToday = new Date(laString)

  const start = new Date(laToday)
  start.setHours(0, 0, 0, 0)

  const end = new Date(laToday)
  end.setHours(23, 59, 59, 999)

  return { start, end }
}

/** Formatar data para exibição (timezone LA) */
export const formatLA = (date: Date): string => {
  const laString = date.toLocaleString('pt-BR', { timeZone: 'America/Los_Angeles' })
  return laString
}
