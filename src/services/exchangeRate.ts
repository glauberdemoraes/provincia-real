import { supabase } from '@/lib/supabase'

/**
 * Busca cotação USD → BRL do dia especificado
 * Primeiro verifica Supabase (tabela exchange_rates)
 * Se não encontrar, busca AwesomeAPI e salva
 */
export const getUsdToBrl = async (date: Date): Promise<number> => {
  try {
    // Formatar data para string YYYY-MM-DD
    const dateStr = date.toISOString().split('T')[0]

    // Tentar buscar do Supabase
    const { data, error } = await supabase
      .from('exchange_rates')
      .select('usd_brl')
      .eq('date', dateStr)
      .single()

    // Se encontrou, retornar
    if (!error && data) {
      return Number(data.usd_brl)
    }

    // Senão, buscar da API
    console.log(`Buscando cotação USD/BRL para ${dateStr}...`)
    const response = await fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL')
    const apiData = await response.json()

    if (!apiData.USDBRL) {
      throw new Error('Resposta inválida da AwesomeAPI')
    }

    const rate = Number(apiData.USDBRL.bid)

    // Salvar no Supabase para futuras queries
    try {
      await supabase.from('exchange_rates').insert({
        date: dateStr,
        usd_brl: rate,
        source: 'awesomeapi',
      })
    } catch (insertError) {
      console.warn('Erro ao salvar cotação no Supabase:', insertError)
      // Não falha a operação se não conseguir salvar
    }

    return rate
  } catch (error) {
    console.error('Erro ao obter cotação USD/BRL:', error)
    // Retornar cotação padrão de fallback
    return 4.97
  }
}

/**
 * Buscar cotações para um intervalo de datas
 */
export const getUsdToBrlRange = async (startDate: Date, endDate: Date): Promise<Map<string, number>> => {
  const rates = new Map<string, number>()

  // Gerar lista de datas
  const current = new Date(startDate)
  while (current <= endDate) {
    const rate = await getUsdToBrl(current)
    const dateStr = current.toISOString().split('T')[0]
    rates.set(dateStr, rate)

    // Próximo dia
    current.setDate(current.getDate() + 1)
  }

  return rates
}

/**
 * Converte USD para BRL usando cotação do dia
 */
export const convertUsdToBrl = async (usdAmount: number, date: Date = new Date()): Promise<number> => {
  const rate = await getUsdToBrl(date)
  return usdAmount * rate
}
