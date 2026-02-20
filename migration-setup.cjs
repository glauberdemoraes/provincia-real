#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

console.log('\n╔════════════════════════════════════════════════════════════╗')
console.log('║  Provincia Real: Customer LTV All View Migration           ║')
console.log('╚════════════════════════════════════════════════════════════╝\n')

// Read the migration SQL
const migrationPath = path.join(__dirname, './supabase/migrations/20260220000004_retention_view.sql')
const migrationSQL = fs.readFileSync(migrationPath, 'utf-8')

// Extract just the CREATE VIEW statement
const viewSQL = migrationSQL
  .split('\n')
  .filter(line => !line.startsWith('--') && !line.match(/^(BEGIN|COMMIT|CREATE OR REPLACE VIEW|;)$/))
  .join('\n')
  .trim()

const createViewSQL = `CREATE OR REPLACE VIEW public.customer_ltv_all AS
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
ORDER BY lifetime_revenue DESC NULLS LAST;`

console.log('✅ What this migration does:')
console.log('   • Creates view customer_ltv_all')
console.log('   • Includes ALL customers (one-time + repeat)')
console.log('   • Enables retention metrics calculation\n')

console.log('📋 Three ways to apply this migration:\n')

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('Option 1️⃣  : Web SQL Editor (Easiest - 1 minute)')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
console.log('1. Open: https://app.supabase.com/project/prnshbkblddfgttsgxpt/sql')
console.log('2. Click "New Query" button')
console.log('3. Paste this SQL:\n')
console.log('┌────────────────────────────────────────────────────────────┐')
console.log('│' + ' '.repeat(58) + '│')

const lines = createViewSQL.split('\n')
lines.forEach(line => {
  const paddedLine = line.padEnd(58)
  console.log('│ ' + paddedLine + ' │')
})

console.log('│' + ' '.repeat(58) + '│')
console.log('└────────────────────────────────────────────────────────────┘')

console.log('\n4. Click "RUN" button')
console.log('5. ✅ Done! View is created\n')

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('Option 2️⃣  : Command Line (requires psql)')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
console.log('Run this in your terminal:')
console.log('  bash apply-migration-psql.sh\n')
console.log('Then enter your Supabase database password when prompted\n')

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('Option 3️⃣  : Save SQL to File')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
console.log('SQL has been saved to: migration.sql')
console.log('  psql -h prnshbkblddfgttsgxpt.supabase.co \\')
console.log('       -U postgres \\')
console.log('       -d postgres \\')
console.log('       -f migration.sql\n')

// Save the SQL to file
fs.writeFileSync('migration.sql', createViewSQL)
console.log('📁 SQL file created: migration.sql\n')

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
console.log('❓ Questions?\n')
console.log('• If connection fails: Check your database password')
console.log('• View already exists? That\'s OK, this will update it\n')

console.log('📌 After applying migration:')
console.log('   • Restart the app: npm run dev')
console.log('   • Dashboard will show retention metrics')
console.log('   • All 25 KPIs will be available\n')
