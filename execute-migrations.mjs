#!/usr/bin/env node

/**
 * Execute all Supabase migrations
 * Reads MIGRATIONS_COMBINED.sql and executes via Supabase API
 */

import fs from 'fs'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://prnshbkblddfgttsgxpt.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybnNoYmtibGRkZmd0dHNneHB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MzE1MTAsImV4cCI6MjA4NTMwNzUxMH0.HPUfckX6OfqbWu1MvZIs0bZaYRf58n84MRCrpRk-7og'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || ''

async function executeMigrations() {
  console.log('🚀 Iniciando execução de migrations no Supabase...')

  if (!SUPABASE_SERVICE_KEY) {
    console.warn(
      '⚠️  SUPABASE_SERVICE_KEY não configurada. Use o SQL Editor manual: https://supabase.com/dashboard/project/prnshbkblddfgttsgxpt/sql/new'
    )
    console.log('\n📋 Instruções:')
    console.log('1. Abra: https://supabase.com/dashboard/project/prnshbkblddfgttsgxpt/sql/new')
    console.log('2. Copie todo o conteúdo de: supabase/MIGRATIONS_COMBINED.sql')
    console.log('3. Cole no SQL Editor')
    console.log('4. Clique em RUN')
    console.log('5. Aguarde 10-20 segundos até completar')
    return
  }

  try {
    // Create Supabase client with service key
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    // Read migrations file
    const migrationsSQL = fs.readFileSync('supabase/MIGRATIONS_COMBINED.sql', 'utf-8')

    console.log('✅ Arquivo de migrations lido')
    console.log(`📏 Total de linhas: ${migrationsSQL.split('\n').length}`)

    // Execute migrations via RPC (requires service key)
    console.log('\n⏳ Executando migrations...')

    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: migrationsSQL,
    })

    if (error) {
      console.error('❌ Erro ao executar migrations:', error)
      process.exit(1)
    }

    console.log('✅ Migrations executadas com sucesso!')
    console.log('📊 Resultado:', data)
  } catch (error) {
    console.error('❌ Erro:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

executeMigrations()
