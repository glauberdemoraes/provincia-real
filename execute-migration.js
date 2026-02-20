#!/usr/bin/env node

/**
 * Execute migration using Supabase Management API
 * Requires SUPABASE_ACCESS_TOKEN environment variable
 */

const https = require('https')
const fs = require('fs')

const PROJECT_ID = 'prnshbkblddfgttsgxpt'
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN

if (!ACCESS_TOKEN) {
  console.error('\n❌ SUPABASE_ACCESS_TOKEN not set')
  console.error('\n📋 To get your access token:')
  console.error('1. Go to: https://app.supabase.com/account/tokens')
  console.error('2. Create a new token (if you don\'t have one)')
  console.error('3. Copy it and set it:')
  console.error('\n   export SUPABASE_ACCESS_TOKEN="your-token-here"\n')
  console.error('4. Then run this script again:')
  console.error('   node execute-migration.js\n')
  process.exit(1)
}

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
`.trim()

function executeQuery() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.supabase.com',
      port: 443,
      path: `/v1/projects/${PROJECT_ID}/database/query`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    }

    console.log('🚀 Executing migration via Supabase Management API...\n')

    const req = https.request(options, (res) => {
      let data = ''

      res.on('data', (chunk) => {
        data += chunk
      })

      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          console.log('✅ Migration executed successfully!')
          console.log('📊 View created: customer_ltv_all\n')
          resolve()
        } else {
          console.error('❌ Error:', res.statusCode)
          console.error(data)
          reject(new Error(`HTTP ${res.statusCode}`))
        }
      })
    })

    req.on('error', reject)

    req.write(JSON.stringify({
      query: migrationSQL,
    }))
    req.end()
  })
}

executeQuery().catch((err) => {
  console.error('\n⚠️  Management API request failed')
  console.error('📝 Possible reasons:')
  console.error('1. Invalid or expired access token')
  console.error('2. Token doesn\'t have required permissions')
  console.error('3. Network error\n')
  console.error('🔧 Alternative: Apply manually via SQL Editor')
  console.error('   https://app.supabase.com/project/' + PROJECT_ID + '/sql\n')
  process.exit(1)
})
