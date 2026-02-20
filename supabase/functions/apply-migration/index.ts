/// <reference types="https://esm.sh/@supabase/functions-js@2.1.0" />

Deno.serve(async (req) => {
  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Get database URL from environment
    const dbUrl = Deno.env.get('DATABASE_URL')
    if (!dbUrl) {
      return new Response(
        JSON.stringify({ error: 'DATABASE_URL not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // SQL migration to apply
    const migrationSQL = `
      CREATE OR REPLACE VIEW public.customer_ltv_all AS
      SELECT
          COALESCE(billing_name, 'Unknown') AS customer_name,
          COALESCE(contact_phone, '') AS customer_phone,
          COUNT(*) FILTER (WHERE payment_status = 'paid') AS order_count,
          SUM(total) FILTER (WHERE payment_status = 'paid') AS lifetime_revenue,
          AVG(total) FILTER (WHERE payment_status = 'paid') AS avg_order_value,
          MIN(order_created_at) FILTER (WHERE payment_status = 'paid') AS first_order_at,
          MAX(order_created_at) FILTER (WHERE payment_status = 'paid') AS last_order_at,
          CASE
              WHEN COUNT(*) FILTER (WHERE payment_status = 'paid') > 1 THEN 'returning'
              WHEN COUNT(*) FILTER (WHERE payment_status = 'paid') = 1 THEN 'one_time'
              ELSE 'non_converting'
          END AS customer_type
      FROM public.orders_cache
      WHERE billing_name IS NOT NULL OR contact_phone IS NOT NULL
      GROUP BY billing_name, contact_phone
      ORDER BY lifetime_revenue DESC NULLS LAST;
    `

    // Use postgres package to connect and execute
    const { Client } = await import('https://deno.land/x/postgres@v0.17.0/mod.ts')
    const client = new Client(dbUrl)

    try {
      await client.connect()
      console.log('Connected to database')

      // Execute migration
      await client.queryArray(migrationSQL)
      console.log('Migration executed successfully')

      await client.end()

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Migration applied successfully',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    } catch (error) {
      console.error('Database error:', error)
      await client.end()

      return new Response(
        JSON.stringify({
          error: 'Failed to execute migration',
          details: error.message,
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
