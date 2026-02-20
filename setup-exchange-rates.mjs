import { createClient } from '@supabase/supabase-js'

const url = 'https://prnshbkblddfgttsgxpt.supabase.co'
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybnNoYmtibGRkZmd0dHNneHB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MzE1MTAsImV4cCI6MjA4NTMwNzUxMH0.HPUfckX6OfqbWu1MvZIs0bZaYRf58n84MRCrpRk-7og'

const supabase = createClient(url, anonKey)

async function setup() {
  try {
    console.log('🔍 Verificando se tabela exchange_rates existe...')
    
    const { data, error } = await supabase
      .from('exchange_rates')
      .select('*')
      .limit(1)
    
    if (error && error.code === 'PGRST103') {
      console.log('⚠️  Tabela não existe ainda. Você precisa executar a migration manualmente.')
      console.log('\n📋 Siga os passos:')
      console.log('1. Abra: https://supabase.com/dashboard/project/prnshbkblddfgttsgxpt/sql/new')
      console.log('2. Cole o arquivo: supabase/migrations/20260220000001_exchange_rates.sql')
      console.log('3. Clique em RUN')
      console.log('4. Execute este script novamente\n')
      process.exit(1)
    }
    
    if (error) {
      throw error
    }
    
    console.log('✅ Tabela exchange_rates já existe!')
    console.log(`📊 Total de registros: ${data?.length || 0}`)
    
    // Tentar inserir cotação do dia se não existir
    const today = new Date().toISOString().split('T')[0]
    const { data: existing } = await supabase
      .from('exchange_rates')
      .select('*')
      .eq('date', today)
      .single()
    
    if (!existing) {
      console.log(`\n💱 Inserindo cotação inicial para ${today}...`)
      const { error: insertError } = await supabase
        .from('exchange_rates')
        .insert({ date: today, usd_brl: 4.97, source: 'awesomeapi' })
      
      if (insertError) {
        throw insertError
      }
      console.log('✅ Cotação inserida com sucesso!')
    } else {
      console.log(`\n💱 Cotação para ${today}: R$ ${existing.usd_brl}/USD`)
    }
    
  } catch (err) {
    console.error('❌ Erro:', err.message)
    process.exit(1)
  }
}

setup()
