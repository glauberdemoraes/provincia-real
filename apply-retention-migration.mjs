#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const SUPABASE_URL = 'https://prnshbkblddfgttsgxpt.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_KEY environment variable not set')
  console.error('Get it from https://app.supabase.com/project/prnshbkblddfgttsgxpt/settings/api')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function applyMigration() {
  try {
    console.log('📋 Reading migration file...')
    const migration = fs.readFileSync('./supabase/migrations/20260220000004_retention_view.sql', 'utf-8')

    console.log('🚀 Applying migration to Supabase...')
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migration,
    })

    if (error) {
      console.error('❌ Migration failed:', error)
      process.exit(1)
    }

    console.log('✅ Migration applied successfully!')
    console.log('📊 Created view: customer_ltv_all')
  } catch (err) {
    console.error('❌ Error:', err.message)
    process.exit(1)
  }
}

applyMigration()
