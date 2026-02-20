import { supabase } from '@/lib/supabase'
import type { NuvemshopOrder, MetaCampaign, DateRange } from '@/types'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

/**
 * Fetch orders from NuvemShop via Supabase RPC sync_orders_to_cache
 * This function synchronizes orders from NuvemShop to the cache table
 * and includes utm_campaign extracted from landing_url
 */
export async function fetchOrders(range: DateRange): Promise<NuvemshopOrder[]> {
  try {
    const startStr = range.start.toISOString().split('T')[0]
    const endStr = range.end.toISOString().split('T')[0]

    console.log(`📦 Sincronizando NuvemShop orders from ${startStr} to ${endStr}...`)

    // 1. Sincronizar dados do Supabase via RPC
    const { data: syncResult, error: syncError } = await supabase.rpc('sync_orders_to_cache', {
      p_start_date: startStr,
      p_end_date: endStr,
    })

    if (syncError) {
      console.warn('⚠️ Sync warning:', syncError)
      // Continuar mesmo se sync falhar (fallback para cache)
    } else {
      console.log(`✅ Sync result:`, syncResult)
    }

    // 2. Buscar dados do banco (já com utm_campaign preenchido!)
    const { data: orders, error } = await supabase
      .from('orders_cache')
      .select('*')
      .gte('order_created_at', range.start.toISOString())
      .lte('order_created_at', range.end.toISOString())
      .order('order_created_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching orders from cache:', error)
      return []
    }

    console.log(`✅ Fetched ${orders?.length || 0} orders from cache (with utm_campaign)`)
    return orders || []
  } catch (err) {
    console.error('❌ fetchOrders error:', err)
    return []
  }
}

/**
 * Fetch Meta Ads campaigns via Edge Function
 */
export async function fetchMetaCampaigns(range: DateRange): Promise<MetaCampaign[]> {
  try {
    const startStr = range.start.toISOString().split('T')[0]
    const endStr = range.end.toISOString().split('T')[0]

    console.log(`📊 Fetching Meta campaigns from ${startStr} to ${endStr}...`)

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/fetch-meta-campaigns`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          start_date: startStr,
          end_date: endStr,
        }),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      console.error('❌ Error fetching campaigns:', error)
      return []
    }

    const data = await response.json()
    console.log(`✅ Fetched ${data.data?.length || 0} campaigns from Meta`)

    return data.data || []
  } catch (err) {
    console.error('❌ fetchMetaCampaigns error:', err)
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
