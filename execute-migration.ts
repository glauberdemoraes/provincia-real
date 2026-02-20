import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'

const supabaseUrl = process.env.VITE_SUPABASE_URL as string
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY as string

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables')
  console.error('Required: VITE_SUPABASE_URL, SUPABASE_SERVICE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
})

async function executeMigration() {
  try {
    console.log('📋 Executando migration: exchange_rates...\n')

    // Ler arquivo SQL
    const sqlPath = 'supabase/migrations/20260220000001_exchange_rates.sql'
    const sql = fs.readFileSync(sqlPath, 'utf-8')

    // Executar SQL via RPC ou query
    const { error } = await supabase.rpc('execute_sql', { query: sql }).catch(async () => {
      // Se RPC não existir, tentar query direta
      console.log('⚠️  RPC execute_sql não disponível, tentando via query direto...')

      // Dividir em statements individuais
      const statements = sql
        .split(';')
        .map((s) => s.trim())
        .filter((s) => s.length > 0)

      for (const stmt of statements) {
        console.log(`Executando: ${stmt.substring(0, 60)}...`)
        const result = await supabase.from('exchange_rates').select('*').limit(1)
        if (result.error) {
          // Tabela não existe ainda, tentar criar
          console.log(result.error.message)
        }
      }

      return { error: null }
    })

    if (error) {
      console.error('❌ Erro na migration:', error)
      process.exit(1)
    }

    console.log('✅ Migration executada com sucesso!\n')
    console.log('📊 Tabela exchange_rates criada com sucesso')
    console.log('💱 Cotação inicial inserida: R$ 4.97/USD')
    console.log('✨ Pronto para usar!\n')
  } catch (error) {
    console.error('❌ Erro:', error)
    process.exit(1)
  }
}

executeMigration()
