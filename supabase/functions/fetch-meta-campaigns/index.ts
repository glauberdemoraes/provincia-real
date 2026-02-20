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
    const ACCESS_TOKEN = 'EAAKH0VidJXQBQqDhCNY0agvymRugNxoWXKZAxSsq6IKcpeQBBsR07YQ9i5VxhqhaCaLjLOvJzXt1Ddjm0D0qc6hJmzOSSL6MfPaSZAfAkkgZBL7bksP5z5rLNwZACSr90i1tZAoFwb79ARc60ubblaUWJb7exbUZC3X6i24Jr23rIZB56Bwz3yoOmOonmKXeQzA'

    // Apenas a conta de anúncios correta
    const ACCOUNT_ID = 'act_2037936660447316'

    // Filtro para trazer apenas campanhas que contêm "doce" no nome
    const filtering = JSON.stringify([
      { field: "campaign.name", operator: "CONTAIN", value: "doce" }
    ])

    // Intervalo de tempo
    const time_range = JSON.stringify({
      since: start_date,
      until: end_date
    })

    const fields = 'account_id,account_name,campaign_id,campaign_name,spend,impressions,clicks,cpc,ctr,actions'

    const url = `https://graph.facebook.com/v19.0/${ACCOUNT_ID}/insights?level=campaign&fields=${fields}&filtering=${encodeURIComponent(filtering)}&time_range=${encodeURIComponent(time_range)}&access_token=${ACCESS_TOKEN}&limit=100`

    console.log(`[Meta] Fetching campaigns from account ${ACCOUNT_ID} (${start_date} to ${end_date})`)

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'SalesDashboardBackend/1.0 (Supabase Edge Function)'
        }
      })

      const json = await response.json()

      if (json.error) {
        console.error(`[Meta] Error fetching account ${ACCOUNT_ID}:`, json.error)
        return new Response(JSON.stringify({
          error: `Meta API Error: ${json.error.message}`,
          details: json.error
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        })
      }

      const campaigns = json.data || []
      console.log(`[Meta] Fetched ${campaigns.length} campaigns`)

      return new Response(JSON.stringify({
        data: campaigns,
        paging: json.paging
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })

    } catch (fetchError) {
      console.error(`[Meta] Network error:`, fetchError)
      throw new Error(`Failed to fetch from Meta API: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`)
    }

  } catch (error) {
    console.error('[Meta] Edge Function Error:', error)
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
