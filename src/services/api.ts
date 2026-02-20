import { supabase } from '@/lib/supabase'
import type { NuvemshopOrder, MetaCampaign, DateRange } from '@/types'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

/**
 * Extract UTM parameter from URL
 * landing_url example: "https://provinciadores.com.br?utm_source=...&utm_campaign=..."
 */
function extractUtmParam(url: string | null, paramName: string): string | null {
  if (!url) return null
  try {
    const urlObj = new URL(url)
    return urlObj.searchParams.get(paramName)
  } catch {
    return null
  }
}

/**
 * Sync and save orders: Edge Function → Database
 * Calls the real edge function, then saves results to orders_cache
 */
async function syncAndSaveOrders(range: DateRange): Promise<NuvemshopOrder[]> {
  try {
    const startStr = range.start.toISOString().split('T')[0]
    const endStr = range.end.toISOString().split('T')[0]

    console.log(`📦 Fetching from Edge Function (fetch-nuvemshop-orders)...`)

    // 1. Call edge function to get REAL data from NuvemShop API
    const response = await fetch(`${SUPABASE_URL}/functions/v1/fetch-nuvemshop-orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        start_date: startStr,
        end_date: endStr,
      }),
    })

    if (!response.ok) {
      throw new Error(`Edge function error: ${response.status}`)
    }

    const edgeData = await response.json()
    const edgeOrders = edgeData.result || []

    console.log(`📥 Edge function returned ${edgeOrders.length} orders`)

    if (edgeOrders.length === 0) {
      console.warn('⚠️ No orders returned from edge function')
      return []
    }

    // 2. Insert/upsert each order into orders_cache with UTM extracted
    const savedOrders: NuvemshopOrder[] = []

    for (const order of edgeOrders) {
      const utm_campaign = extractUtmParam(order.landing_url, 'utm_campaign')

      const { data: inserted, error: insertError } = await supabase
        .from('orders_cache')
        .upsert(
          {
            id: order.id,
            total: order.total,
            subtotal: order.subtotal,
            shipping_cost_owner: order.shipping_cost_owner,
            payment_status: order.payment_status,
            shipping_status: order.shipping_status,
            billing_name: order.billing_name,
            contact_phone: order.contact_phone,
            billing_phone: order.billing_phone,
            landing_url: order.landing_url,
            utm_source: extractUtmParam(order.landing_url, 'utm_source'),
            utm_medium: extractUtmParam(order.landing_url, 'utm_medium'),
            utm_campaign,
            utm_content: extractUtmParam(order.landing_url, 'utm_content'),
            utm_term: extractUtmParam(order.landing_url, 'utm_term'),
            products: order.products,
            order_created_at: order.created_at,
            fetched_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        )
        .select()

      if (insertError) {
        console.error(`❌ Error saving order ${order.id}:`, insertError)
      } else if (inserted && inserted.length > 0) {
        savedOrders.push(inserted[0])
      }
    }

    console.log(`✅ Saved ${savedOrders.length} orders to orders_cache`)
    return savedOrders
  } catch (err) {
    console.error('❌ syncAndSaveOrders error:', err)
    return []
  }
}

/**
 * Fetch orders from NuvemShop via Edge Function → Database
 * Performs real-time sync and returns data from cache
 */
export async function fetchOrders(range: DateRange): Promise<NuvemshopOrder[]> {
  try {
    const startStr = range.start.toISOString().split('T')[0]
    const endStr = range.end.toISOString().split('T')[0]

    console.log(`📦 Sincronizando NuvemShop orders from ${startStr} to ${endStr}...`)

    // 1. Sync and save orders from edge function
    const syncedOrders = await syncAndSaveOrders(range)

    // 2. If sync worked, return synced data
    if (syncedOrders.length > 0) {
      console.log(`✅ Returning ${syncedOrders.length} synced orders`)
      return syncedOrders
    }

    // 3. Fallback: query from cache if sync returned empty
    console.log(`⚠️ Sync returned empty, trying cache...`)
    const { data: cachedOrders, error } = await supabase
      .from('orders_cache')
      .select('*')
      .gte('order_created_at', range.start.toISOString())
      .lte('order_created_at', range.end.toISOString())
      .order('order_created_at', { ascending: false })

    if (error) {
      console.error('❌ Cache query error:', error)
      return []
    }

    console.log(`✅ Fetched ${cachedOrders?.length || 0} orders from cache`)
    return cachedOrders || []
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
