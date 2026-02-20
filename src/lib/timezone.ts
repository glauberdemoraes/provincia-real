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
export const getTodayRange_LA = (): { start: Date; end: Date; label: string } => {
  const now = new Date()

  // Get date string in LA timezone (YYYY-MM-DD)
  const laFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })

  const dateStr = laFormatter.format(now) // e.g., "2026-02-20"
  const [year, month, day] = dateStr.split('-').map(Number)

  // LA is UTC-8, so:
  // 2026-02-20 00:00:00 LA = 2026-02-20 08:00:00 UTC
  // 2026-02-20 23:59:59 LA = 2026-02-21 07:59:59 UTC
  const start = new Date(Date.UTC(year, month - 1, day, 8, 0, 0, 0))
  const end = new Date(Date.UTC(year, month - 1, day + 1, 7, 59, 59, 999))

  return { start, end, label: 'Hoje (LA)' }
}

/** Retornar início e fim do dia atual em São Paulo */
export const getTodayRange_BR = (): { start: Date; end: Date; label: string } => {
  const now = new Date()

  // Get date string in BR timezone (YYYY-MM-DD)
  const brFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })

  const dateStr = brFormatter.format(now) // e.g., "2026-02-20"
  const [year, month, day] = dateStr.split('-').map(Number)

  // BR (São Paulo) is UTC-3, so:
  // 2026-02-20 00:00:00 BR = 2026-02-20 03:00:00 UTC
  // 2026-02-20 23:59:59 BR = 2026-02-21 02:59:59 UTC
  const start = new Date(Date.UTC(year, month - 1, day, 3, 0, 0, 0))
  const end = new Date(Date.UTC(year, month - 1, day + 1, 2, 59, 59, 999))

  return { start, end, label: 'Hoje (BR)' }
}

/** Formatar data para exibição (timezone LA) */
export const formatLA = (date: Date): string => {
  const laString = date.toLocaleString('pt-BR', { timeZone: 'America/Los_Angeles' })
  return laString
}

/**
 * Offset de horas entre BR e LA
 * BRT = UTC-3, LAT = UTC-8
 * Diferença = 5 horas
 */
export const BR_LA_OFFSET_HOURS = 5

/**
 * Calcular pesos proporcionais para distribuir spend Meta entre dias BR
 * Quando modo BR: o "dia BR" cruza dois dias LA
 * - Dia LA D-1: últimas 5 horas (5/24 ≈ 20.8%)
 * - Dia LA D: primeiras 19 horas (19/24 ≈ 79.2%)
 */
export const getProportionalWeights = (): { prevDay: number; curDay: number } => {
  return {
    prevDay: BR_LA_OFFSET_HOURS / 24, // 5/24 ≈ 0.208
    curDay: (24 - BR_LA_OFFSET_HOURS) / 24, // 19/24 ≈ 0.792
  }
}

/**
 * Obter range de dois dias LA que correspondem a um dia BR
 * Para um dia BR (ex: 2026-02-20), retorna os dois dias LA que precisam ser consultados
 */
export const getDateRange_LA_forBR = (brDate: Date): { prev: Date; cur: Date } => {
  // brDate é um dia em timezone BR (ex: 2026-02-20)
  // Convertemos para duas datas em UTC para consultar os dois dias LA

  const year = brDate.getFullYear()
  const month = brDate.getMonth()
  const day = brDate.getDate()

  // Dia LA anterior: aquele cujas últimas 5 horas caem no dia BR
  // "dia BR 2026-02-20" começa às 03:00 UTC (= 19:00 LA 2026-02-19)
  const prevLaDate = new Date(Date.UTC(year, month, day - 1))

  // Dia LA atual: aquele cujas primeiras 19 horas caem no dia BR
  // "dia BR 2026-02-20" termina às 02:59 UTC (= 18:59 LA 2026-02-20)
  const curLaDate = new Date(Date.UTC(year, month, day))

  return { prev: prevLaDate, cur: curLaDate }
}
