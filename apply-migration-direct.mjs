#!/usr/bin/env node

import fetch from 'node-fetch'
import fs from 'fs'

const SUPABASE_URL = 'https://prnshbkblddfgttsgxpt.supabase.co'
const PROJECT_ID = 'prnshbkblddfgttsgxpt'

async function applyMigration() {
  try {
    // Read the migration SQL
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
ORDER BY lifetime_revenue DESC NULLS LAST;`.trim()

    console.log('📋 Migration SQL prepared')
    console.log('🔌 Attempting to apply via Supabase...\n')

    // Try to use Supabase's SQL Editor via REST API
    // Note: This requires a special endpoint or RPC function
    // Since Supabase doesn't expose direct SQL execution via public API,
    // we'll provide instructions for manual application

    console.log('⚠️  Direct SQL execution via REST API not available')
    console.log('📝 Please apply this migration manually:\n')
    console.log('1️⃣  Open SQL Editor:')
    console.log('   https://app.supabase.com/project/' + PROJECT_ID + '/sql\n')
    console.log('2️⃣  Copy and paste this SQL:\n')
    console.log('------- BEGIN SQL -------')
    console.log(migrationSQL)
    console.log('------- END SQL -------\n')
    console.log('3️⃣  Click "RUN" to execute\n')
    console.log('✅ After applying, the view will be available immediately\n')

    // Alternative: Try using exec command if available
    if (process.env.DATABASE_URL) {
      console.log('🔄 Attempting direct database connection...\n')

      try {
        const { execSync } = await import('child_process')
        execSync(`psql ${process.env.DATABASE_URL} -c "${migrationSQL.replace(/"/g, '\\"')}"`, {
          stdio: 'inherit',
        })
        console.log('✅ Migration applied via direct connection!')
      } catch (err) {
        console.log('⚠️  Direct connection failed, manual application required')
      }
    }
  } catch (err) {
    console.error('❌ Error:', err.message)
    process.exit(1)
  }
}

applyMigration()
