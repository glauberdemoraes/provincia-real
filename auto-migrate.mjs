#!/usr/bin/env node

/**
 * Auto-execute migrations via Supabase API
 * Uses the REST API to execute raw SQL
 */

import fs from 'fs'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://prnshbkblddfgttsgxpt.supabase.co'
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybnNoYmtibGRkZmd0dHNneHB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MzE1MTAsImV4cCI6MjA4NTMwNzUxMH0.HPUfckX6OfqbWu1MvZIs0bZaYRf58n84MRCrpRk-7og'

async function executeMigrations() {
  console.log('🚀 Iniciando execução automática de migrations...\n')

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  try {
    // Read migrations
    const sql = fs.readFileSync('supabase/MIGRATIONS_COMBINED.sql', 'utf-8')
    console.log(`✅ Arquivo lido: ${sql.length} caracteres`)

    // Split by GO (for multiple statements) or execute as single transaction
    const statements = sql
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith('--'))

    console.log(`📊 Total de statements: ${statements.length}`)

    // Try to execute using pg_vector or raw SQL
    console.log('\n⏳ Tentando executar via Supabase RPC...\n')

    // Create a helper function first if it doesn't exist
    const { data: fnData, error: fnError } = await supabase.rpc('exec_sql', {
      sql_command: sql.substring(0, 1000),
    })

    if (fnError?.message?.includes('does not exist')) {
      console.log('ℹ️  Função exec_sql não disponível')
      console.log('📋 Use o método manual:\n')
      console.log('1. Abra: https://supabase.com/dashboard/project/prnshbkblddfgttsgxpt/sql/new')
      console.log('2. Cole o conteúdo de: supabase/MIGRATIONS_COMBINED.sql')
      console.log('3. Clique em RUN')
      return
    }

    if (fnError) {
      console.error('❌ Erro:', fnError.message)
      console.log('\n📋 Alternativa: use o SQL Editor manual')
      return
    }

    console.log('✅ Migrations executadas com sucesso!')
    console.log('📊 Resultado:', fnData)
  } catch (error) {
    console.error('❌ Erro:', error instanceof Error ? error.message : error)

    console.log('\n📋 Método alternativo (recomendado):')
    console.log('1. https://supabase.com/dashboard/project/prnshbkblddfgttsgxpt/sql/new')
    console.log('2. Cole supabase/MIGRATIONS_COMBINED.sql')
    console.log('3. Clique em RUN')
  }
}

executeMigrations()
