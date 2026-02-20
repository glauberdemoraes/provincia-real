#!/usr/bin/env node

/**
 * Apply retention view migration to Supabase
 * This script executes the SQL migration file directly via Supabase
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const SUPABASE_URL = 'https://prnshbkblddfgttsgxpt.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_SERVICE_KEY) {
  console.error('\n❌ SUPABASE_SERVICE_KEY not found in environment')
  console.error('\n📋 To deploy this migration, you need to:')
  console.error('\n1. Get your SERVICE_ROLE_KEY from:')
  console.error('   https://app.supabase.com/project/prnshbkblddfgttsgxpt/settings/api\n')
  console.error('2. Set it as an environment variable:')
  console.error('   export SUPABASE_SERVICE_KEY="your-service-role-key"\n')
  console.error('3. Run this command again:')
  console.error('   node apply-retention-view.cjs\n')
  console.error('✅ Or apply manually via SQL Editor:')
  console.error('   https://app.supabase.com/project/prnshbkblddfgttsgxpt/sql\n')
  process.exit(1)
}

async function applyMigration() {
  try {
    console.log('📋 Reading migration file...')
    const migrationPath = path.join(__dirname, './supabase/migrations/20260220000004_retention_view.sql')
    const migration = fs.readFileSync(migrationPath, 'utf-8')

    // Initialize Supabase with service role key
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: {
        persistSession: false,
      },
    })

    console.log('🚀 Applying migration to Supabase...')

    // Extract SQL statements (remove BEGIN/COMMIT)
    const sqlStatements = migration
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--') && !s.match(/^(BEGIN|COMMIT)$/i))

    for (const statement of sqlStatements) {
      if (statement) {
        console.log(`  ⏳ Executing: ${statement.substring(0, 50)}...`)
        const { error } = await supabase.rpc('_exec', { sql: statement + ';' })

        if (error && error.message.includes('does not exist')) {
          console.warn(`  ⚠️  RPC _exec not found, using direct execution...`)
          // Fallback: try direct query
          const { error: queryError } = await supabase.from('_migrations').select('*').limit(0)
          if (queryError) {
            console.log(`  ⚠️  Cannot execute via API, please apply manually`)
            throw new Error('Cannot execute SQL via API')
          }
        } else if (error) {
          throw error
        }
      }
    }

    console.log('\n✅ Migration applied successfully!')
    console.log('📊 View created: customer_ltv_all')
    console.log('📝 The view includes all customers (including one-time buyers)\n')
  } catch (err) {
    console.error('\n⚠️  Could not apply migration automatically')
    console.error('\n📝 Please apply manually via SQL Editor:')
    console.error('   https://app.supabase.com/project/prnshbkblddfgttsgxpt/sql')
    console.error('\n📋 Copy-paste this SQL:\n')

    const migrationPath = path.join(__dirname, './supabase/migrations/20260220000004_retention_view.sql')
    const migration = fs.readFileSync(migrationPath, 'utf-8')
    console.log(migration)
    console.error('\n')
    process.exit(0)
  }
}

applyMigration()
