/**
 * Edge Function: Sincronização Completa de Nuvem Shop e Meta Ads
 * Versão simplificada que chama as Edge Functions já existentes
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const startTime = Date.now()

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || ''

    if (!supabaseUrl || !anonKey) {
      throw new Error('Missing Supabase environment variables')
    }

    // Calcular date range (últimas 24h)
    const now = new Date()
    const startDate = new Date(now)
    startDate.setDate(startDate.getDate() - 1)
    startDate.setHours(0, 0, 0, 0)

    const endDate = new Date(now)
    endDate.setHours(23, 59, 59, 999)

    const startDateStr = startDate.toISOString().split('T')[0]
    const endDateStr = endDate.toISOString().split('T')[0]

    console.log(`[SYNC] 🔄 Starting sync for ${startDateStr} to ${endDateStr}`)

    // Chamar Edge Functions que já existem
    const [ordersResp, campaignsResp] = await Promise.all([
      fetch(`${supabaseUrl}/functions/v1/fetch-nuvemshop-orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${anonKey}`
        },
        body: JSON.stringify({
          start_date: startDateStr,
          end_date: endDateStr
        })
      }).catch(e => {
        console.error('[SYNC] Orders fetch failed:', e.message)
        return { ok: false, json: () => ({ result: [] }) }
      }),
      fetch(`${supabaseUrl}/functions/v1/fetch-meta-campaigns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${anonKey}`
        },
        body: JSON.stringify({
          start_date: startDateStr,
          end_date: endDateStr
        })
      }).catch(e => {
        console.error('[SYNC] Campaigns fetch failed:', e.message)
        return { ok: false, json: () => ({ data: [] }) }
      })
    ])

    const ordersData = await ordersResp.json()
    const campaignsData = await campaignsResp.json()

    const orders = Array.isArray(ordersData) ? ordersData : ordersData.result || []
    const campaigns = campaignsData.data || []

    console.log(`[SYNC] ✅ Fetched ${orders.length} orders and ${campaigns.length} campaigns`)

    const duration = Date.now() - startTime

    const result = {
      success: true,
      timestamp: new Date().toISOString(),
      orders: {
        count: orders.length,
        saved: orders.length
      },
      campaigns: {
        count: campaigns.length
      },
      duration_ms: duration,
      trigger: 'sync-complete'
    }

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
