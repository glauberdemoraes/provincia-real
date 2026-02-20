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

    return new Response(JSON.stringify({ result: Array.isArray(data) ? data : data.result || [] }), {
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
