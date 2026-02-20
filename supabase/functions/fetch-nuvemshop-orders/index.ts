import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { start_date, end_date } = await req.json()

    if (!start_date || !end_date) {
      throw new Error("start_date and end_date are required (Format: YYYY-MM-DD)")
    }

    // Credenciais (Hardcoded conforme solicitado)
    const STORE_ID = '7230282'
    const ACCESS_TOKEN = '470c8121c30cfac9bf853c45181132eeb9d69799'
    const API_URL = `https://api.tiendanube.com/v1/${STORE_ID}/orders`

    // Mapeamento de campos necessários para o Dashboard
    const fields = [
      'id',
      'token',
      'total',
      'subtotal',
      'shipping_cost_owner',
      'payment_status',
      'shipping_status',
      'created_at',
      'landing_url',     // Essencial para UTM
      'products',        // Essencial para contagem de potes/barras
      'billing_name',
      'contact_phone',   // WhatsApp
      'billing_phone',   // Fallback WhatsApp
      'client_details'   // IP e User Agent
    ].join(',')

    const params = new URLSearchParams({
      created_at_min: start_date,
      created_at_max: end_date,
      per_page: '200', // Máximo permitido pela API
      fields: fields
    })

    console.log(`[NuvemShop] Fetching orders from ${start_date} to ${end_date}`)

    const response = await fetch(`${API_URL}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authentication': `bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'SalesDashboardBackend/1.0 (Supabase Edge Function)'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[NuvemShop] API Error:', errorText)
      return new Response(JSON.stringify({
        error: `NuvemShop Error ${response.status}`,
        details: errorText
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const data = await response.json()
    console.log(`[NuvemShop] Fetched ${data.result?.length || 0} orders`)

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('[NuvemShop] Edge Function Error:', error)
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
