const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { start_date, end_date } = await req.json()

    if (!start_date || !end_date) {
      return new Response(JSON.stringify({ error: "start_date and end_date required" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const STORE_ID = '7230282'
    const ACCESS_TOKEN = '470c8121c30cfac9bf853c45181132eeb9d69799'
    const API_URL = `https://api.tiendanube.com/v1/${STORE_ID}/orders`

    const params = new URLSearchParams({
      created_at_min: start_date,
      created_at_max: end_date,
      per_page: '200',
    })

    console.log(`[NuvemShop] Fetching orders: ${start_date} to ${end_date}`)

    const response = await fetch(`${API_URL}?${params}`, {
      method: 'GET',
      headers: {
        'Authentication': `bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      }
    })

    const data = await response.json()
    const orders = Array.isArray(data) ? data : data.result || []

    // Log para debug: mostrar estrutura de um order
    if (orders.length > 0) {
      console.log('[NuvemShop] Sample order keys:', Object.keys(orders[0]))
      console.log('[NuvemShop] Sample order:', JSON.stringify(orders[0], null, 2))
    }

    // Transformar orders para extrair utm_campaign corretamente
    const transformedOrders = orders.map((order: Record<string, unknown>) => ({
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
      utm_campaign: order.utm_campaign || order.utm_campaign_name,  // Tenta ambos os nomes
      utm_content: order.utm_content,
      utm_term: order.utm_term,
    }))

    console.log(`[NuvemShop] Transformed ${transformedOrders.length} orders`)

    return new Response(JSON.stringify({ result: transformedOrders }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('[NuvemShop] Error:', error)
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
