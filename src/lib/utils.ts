export const formatCurrency = (val: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(isNaN(val) ? 0 : val)
}

export const formatNumber = (val: number, decimals = 2): string => {
  return Number(val).toFixed(decimals)
}

export const formatPercent = (val: number, decimals = 1): string => {
  return formatNumber(val, decimals) + '%'
}

export const isDateInRange = (targetDate: Date, start: Date, end: Date): boolean => {
  return targetDate.getTime() >= start.getTime() && targetDate.getTime() <= end.getTime()
}

export const extractUTMParam = (url: string, paramName: string): string | null => {
  try {
    if (!url) return null
    const urlObj = new URL(url)
    return urlObj.searchParams.get(paramName)
  } catch {
    return null
  }
}

export const getDaysBetween = (start: Date, end: Date): number => {
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24))
}

export const getStartOfDay = (date: Date): Date => {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export const getEndOfDay = (date: Date): Date => {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

export const formatDateTime = (date: Date, timeZone = 'America/Sao_Paulo'): string => {
  return date.toLocaleString('pt-BR', {
    timeZone,
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const getDateLabel = (date: Date): string => {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  })
}
