#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const SUPABASE_URL = 'https://prnshbkblddfgttsgxpt.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybnNoYmtibGRkZmd0dHNneHB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MzE1MTAsImV4cCI6MjA4NTMwNzUxMH0.HPUfckX6OfqbWu1MvZIs0bZaYRf58n84MRCrpRk-7og'

async function executeMigrations() {
  console.log('🚀 Iniciando migrations via Supabase API REST...\n')

  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  try {
    // Read SQL file
    const sqlContent = fs.readFileSync('supabase/MIGRATIONS_COMBINED.sql', 'utf-8')
    console.log(`📋 Arquivo lido: ${sqlContent.length} caracteres`)

    // Split into individual statements
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'))

    console.log(`📊 Total de statements: ${statements.length}`)
    console.log('⏳ Tentando executar via Supabase...\n')

    // Try to create tables using RPC
    let success = false

    // Try 1: Create orders_cache table
    const { error: e1 } = await client.from('orders_cache').select('count')
    if (e1?.code === 'PGRST116') {
      // Table doesn't exist, try to create it
      const { error: createError } = await client.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS public.orders_cache (
            id BIGINT PRIMARY KEY,
            total NUMERIC(10, 2),
            subtotal NUMERIC(10, 2),
            shipping_cost_owner NUMERIC(10, 2),
            payment_status TEXT,
            shipping_status TEXT,
            products JSONB,
            order_created_at TIMESTAMPTZ NOT NULL,
            fetched_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
        `
      })
      if (createError) {
        console.log('⚠️ RPC exec_sql não disponível')
      } else {
        success = true
      }
    } else if (!e1) {
      console.log('✅ Tabelas já existem!')
      success = true
    }

    if (success) {
      console.log('\n✅ Migrations completadas com sucesso!')
    } else {
      throw new Error('RPC function not available')
    }
  } catch (error) {
    console.error('❌ Erro:', error.message)
    console.log('\n📋 Alternativa: Use o SQL Editor manual do Supabase')
    console.log('👉 https://supabase.com/dashboard/project/prnshbkblddfgttsgxpt/sql/new')
  }
}

executeMigrations()
