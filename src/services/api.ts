import { supabase } from '@/lib/supabase'
import type { NuvemshopOrder, MetaCampaign, DateRange } from '@/types'

export async function fetchOrders(range: DateRange): Promise<NuvemshopOrder[]> {
  try {
    // Fazer requisições dia a dia para evitar limite de tamanho de resposta
    const allOrders: NuvemshopOrder[] = []
    const current = new Date(range.start)

    while (current <= range.end) {
      const dayStart = new Date(current)
      dayStart.setHours(0, 0, 0, 0)

      const dayEnd = new Date(current)
      dayEnd.setHours(23, 59, 59, 999)

      const startStr = dayStart.toISOString().split('T')[0]
      const endStr = dayEnd.toISOString().split('T')[0]

      console.log(`Fetching orders for ${startStr}...`)

      const { data, error } = await supabase.rpc('fetch_nuvemshop_orders', {
        start_date: startStr,
        end_date: endStr,
      })

      if (error) {
        console.warn(`Failed to fetch orders for ${startStr}:`, error.message)
      } else if (Array.isArray(data)) {
        allOrders.push(...data)
      }

      // Incrementar um dia
      current.setDate(current.getDate() + 1)

      // Pequeno delay para não sobrecarregar a API
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    return allOrders
  } catch (err) {
    console.error('fetchOrders error:', err)
    return []
  }
}

export async function fetchMetaCampaigns(range: DateRange): Promise<MetaCampaign[]> {
  try {
    // Fazer requisições dia a dia se necessário
    const allCampaigns: MetaCampaign[] = []
    const current = new Date(range.start)

    while (current <= range.end) {
      const dayStart = new Date(current)
      dayStart.setHours(0, 0, 0, 0)

      const dayEnd = new Date(current)
      dayEnd.setHours(23, 59, 59, 999)

      const startStr = dayStart.toISOString().split('T')[0]
      const endStr = dayEnd.toISOString().split('T')[0]

      console.log(`Fetching Meta campaigns for ${startStr}...`)

      const { data, error } = await supabase.rpc('fetch_meta_campaigns', {
        start_date: startStr,
        end_date: endStr,
      })

      if (error) {
        console.warn(`Failed to fetch campaigns for ${startStr}:`, error.message)
      } else if (Array.isArray(data)) {
        allCampaigns.push(...data)
      }

      // Incrementar um dia
      current.setDate(current.getDate() + 1)

      // Pequeno delay para não sobrecarregar a API
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    return allCampaigns
  } catch (err) {
    console.error('fetchMetaCampaigns error:', err)
    return []
  }
}

export async function fetchOrdersFromCache(range: DateRange): Promise<NuvemshopOrder[]> {
  try {
    const { data, error } = await supabase
      .from('orders_cache')
      .select('*')
      .gte('order_created_at', range.start.toISOString())
      .lte('order_created_at', range.end.toISOString())
      .order('order_created_at', { ascending: false })

    if (error) throw new Error(`Cache read failed: ${error.message}`)
    return data || []
  } catch (err) {
    console.error('fetchOrdersFromCache error:', err)
    return []
  }
}

export async function fetchMetaFromCache(range: DateRange): Promise<MetaCampaign[]> {
  try {
    const { data, error } = await supabase
      .from('meta_campaigns_cache')
      .select('*')
      .gte('date_start', range.start.toISOString().split('T')[0])
      .lte('date_stop', range.end.toISOString().split('T')[0])
      .order('date_start', { ascending: false })

    if (error) throw new Error(`Cache read failed: ${error.message}`)
    return data || []
  } catch (err) {
    console.error('fetchMetaFromCache error:', err)
    return []
  }
}

export async function generateMockOrders(start: Date, end: Date): Promise<NuvemshopOrder[]> {
  const orders: NuvemshopOrder[] = []
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24))

  for (let i = 0; i < days * 3; i++) {
    const date = new Date(start)
    date.setDate(date.getDate() + Math.floor(i / 3))
    date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), 0, 0)

    orders.push({
      id: 1000 + i,
      total: Math.floor(Math.random() * 1000) + 100,
      subtotal: Math.floor(Math.random() * 900) + 100,
      shipping_cost_owner: Math.floor(Math.random() * 50) + 10,
      payment_status: Math.random() > 0.2 ? 'paid' : 'pending',
      created_at: date.toISOString(),
      products: [
        {
          id: 1,
          name: Math.random() > 0.5 ? 'Pote 500g' : 'Barra 200g',
          price: Math.random() > 0.5 ? 45 : 35,
          quantity: Math.floor(Math.random() * 3) + 1,
        },
      ],
    })
  }

  return orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}
