import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { start_date, end_date } = await req.json()

    if (!start_date || !end_date) {
      throw new Error("start_date and end_date required")
    }

    const ACCESS_TOKEN = 'EAAKH0VidJXQBQqDhCNY0agvymRugNxoWXKZAxSsq6IKcpeQBBsR07YQ9i5VxhqhaCaLjLOvJzXt1Ddjm0D0qc6hJmzOSSL6MfPaSZAfAkkgZBL7bksP5z5rLNwZACSr90i1tZAoFwb79ARc60ubblaUWJb7exbUZC3X6i24Jr23rIZB56Bwz3yoOmOonmKXeQzA'
    const ACCOUNT_ID = 'act_2037936660447316'

    const filtering = JSON.stringify([
      { field: "campaign.name", operator: "CONTAIN", value: "doce" }
    ])

    const time_range = JSON.stringify({
      since: start_date,
      until: end_date
    })

    const fields = 'account_id,account_name,campaign_id,campaign_name,spend,impressions,clicks,cpc,ctr,actions'

    const url = `https://graph.facebook.com/v19.0/${ACCOUNT_ID}/insights?level=campaign&fields=${fields}&filtering=${encodeURIComponent(filtering)}&time_range=${encodeURIComponent(time_range)}&access_token=${ACCESS_TOKEN}&limit=100`

    console.log(`[Meta] Fetching campaigns: ${start_date} to ${end_date}`)

    const response = await fetch(url)
    const json = await response.json()

    if (json.error) {
      throw new Error(`Meta API: ${json.error.message}`)
    }

    return new Response(JSON.stringify({ data: json.data || [], paging: json.paging }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('[Meta] Error:', error)
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
