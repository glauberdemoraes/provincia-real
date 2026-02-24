/**
 * Edge Function: Sincronização automática de Nuvem Shop e Meta Ads
 * Chamada:
 * - Via cron a cada 30 minutos (pg_cron)
 * - Ou via API POST /functions/v1/sync-nuvemshop-meta
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.97.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Configuração
const STORE_ID = '7230282'
const NUVEMSHOP_TOKEN = '470c8121c30cfac9bf853c45181132eeb9d69799'
const META_ACCESS_TOKEN = 'EAAKH0VidJXQBQqDhCNY0agvymRugNxoWXKZAxSsq6IKcpeQBBsR07YQ9i5VxhqhaCaLjLOvJzXt1Ddjm0D0qc6hJmzOSSL6MfPaSZAfAkkgZBL7bksP5z5rLNwZACSr90i1tZAoFwb79ARc60ubblaUWJb7exbUZC3X6i24Jr23rIZB56Bwz3yoOmOonmKXeQzA'
const META_ACCOUNT_ID = 'act_2037936660447316'

interface SyncResult {
  success: boolean
  timestamp: string
  orders: {
    count: number
    saved: number
    error?: string
  }
  campaigns: {
    count: number
    error?: string
  }
  duration_ms: number
}

/**
 * Buscar pedidos da Nuvem Shop
 */
async function fetchNuvemshopOrders(startDate: string, endDate: string) {
  try {
    const API_URL = `https://api.tiendanube.com/v1/${STORE_ID}/orders`
    const params = new URLSearchParams({
      created_at_min: startDate,
      created_at_max: endDate,
      per_page: '200',
    })

    console.log(`[SYNC] Fetching Nuvem Shop orders: ${startDate} to ${endDate}`)

    const response = await fetch(`${API_URL}?${params}`, {
      method: 'GET',
      headers: {
        'Authentication': `bearer ${NUVEMSHOP_TOKEN}`,
        'Content-Type': 'application/json',
      }
    })

    if (!response.ok) {
      throw new Error(`Nuvem Shop API error: ${response.status}`)
    }

    const data = await response.json()
    const orders = Array.isArray(data) ? data : data.result || []

    console.log(`[SYNC] ✅ Fetched ${orders.length} orders from Nuvem Shop`)

    return orders.map((order: Record<string, unknown>) => ({
      id: order.id,
      total: order.total,
      subtotal: order.subtotal,
      shipping_cost_owner: order.shipping_cost_owner,
      payment_status: order.payment_status,
      shipping_status: order.shipping_status,
      created_at: order.created_at,
      landing_url: order.landing_url,
      billing_name: order.billing_name,
      contact_phone: order.contact_phone,
      billing_phone: order.billing_phone,
      products: order.products || order.product_lines || [],
      utm_source: order.utm_source,
      utm_medium: order.utm_medium,
      utm_campaign: order.utm_campaign || order.utm_campaign_name,
      utm_content: order.utm_content,
      utm_term: order.utm_term,
    }))
  } catch (error) {
    console.error('[SYNC] ❌ Nuvem Shop fetch error:', error)
    throw error
  }
}

/**
 * Buscar campanhas Meta
 */
async function fetchMetaCampaigns(startDate: string, endDate: string) {
  try {
    const filtering = JSON.stringify([
      { field: "campaign.name", operator: "CONTAIN", value: "doce" }
    ])

    const time_range = JSON.stringify({
      since: startDate,
      until: endDate
    })

    const fields = 'account_id,account_name,campaign_id,campaign_name,spend,impressions,clicks,cpc,ctr,actions'
    const url = `https://graph.facebook.com/v19.0/${META_ACCOUNT_ID}/insights?level=campaign&fields=${fields}&filtering=${encodeURIComponent(filtering)}&time_range=${encodeURIComponent(time_range)}&access_token=${META_ACCESS_TOKEN}&limit=100`

    console.log(`[SYNC] Fetching Meta campaigns: ${startDate} to ${endDate}`)

    const response = await fetch(url)
    const json = await response.json()

    if (json.error) {
      throw new Error(`Meta API: ${json.error.message}`)
    }

    console.log(`[SYNC] ✅ Fetched ${(json.data || []).length} campaigns from Meta`)

    return json.data || []
  } catch (error) {
    console.error('[SYNC] ❌ Meta fetch error:', error)
    throw error
  }
}

/**
 * Salvar pedidos no Supabase via RPC
 */
async function saveOrdersToSupabase(supabase: { rpc: (name: string, params: { p_orders: unknown[] }) => Promise<{ data: unknown; error: { message: string } | null }> }, orders: unknown[]) {
  try {
    if (orders.length === 0) {
      console.log('[SYNC] No orders to save')
      return { saved: 0, error: null }
    }

    console.log(`[SYNC] Saving ${orders.length} orders to Supabase...`)

    const { error } = await supabase.rpc('save_orders_json', {
      p_orders: orders,
    })

    if (error) {
      console.error('[SYNC] ⚠️  RPC error:', error)
      return { saved: 0, error: error.message }
    }

    console.log(`[SYNC] ✅ Orders saved to Supabase`)
    return { saved: orders.length, error: null }
  } catch (error) {
    console.error('[SYNC] ❌ Save error:', error)
    return { saved: 0, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Handler principal
 */
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const startTime = Date.now()

  try {
    // Inicializar Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Calcular range de datas (último dia)
    const now = new Date()
    const startDate = new Date(now)
    startDate.setDate(startDate.getDate() - 1)
    startDate.setHours(0, 0, 0, 0)

    const endDate = new Date(now)
    endDate.setHours(23, 59, 59, 999)

    const startDateStr = startDate.toISOString().split('T')[0]
    const endDateStr = endDate.toISOString().split('T')[0]

    console.log(`[SYNC] 🔄 Starting sync for ${startDateStr} to ${endDateStr}`)

    // Buscar dados
    const [orders, campaigns] = await Promise.all([
      fetchNuvemshopOrders(startDateStr, endDateStr).catch(e => {
        console.error('[SYNC] Orders fetch failed:', e)
        return []
      }),
      fetchMetaCampaigns(startDateStr, endDateStr).catch(e => {
        console.error('[SYNC] Campaigns fetch failed:', e)
        return []
      }),
    ])

    // Salvar pedidos
    const ordersSaveResult = await saveOrdersToSupabase(supabase, orders)

    const duration = Date.now() - startTime
    const result: SyncResult = {
      success: true,
      timestamp: new Date().toISOString(),
      orders: {
        count: orders.length,
        saved: ordersSaveResult.saved,
        ...(ordersSaveResult.error && { error: ordersSaveResult.error }),
      },
      campaigns: {
        count: campaigns.length,
      },
      duration_ms: duration,
    }

    console.log(`[SYNC] ✅ Sync completed in ${duration}ms`)

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    const duration = Date.now() - startTime
    console.error('[SYNC] ❌ Error:', error)

    return new Response(JSON.stringify({
      success: false,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      duration_ms: duration,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
