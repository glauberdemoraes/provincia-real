import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://prnshbkblddfgttsgxpt.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybnNoYmtibGRkZmd0dHNneHB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MzE1MTAsImV4cCI6MjA4NTMwNzUxMH0.HPUfckX6OfqbWu1MvZIs0bZaYRf58n84MRCrpRk-7og'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

console.log('📊 Verificando colunas da tabela orders_cache...\n')

// Tentar fazer um select sem colunas específicas para ver quais existem
const { data, error } = await supabase
  .from('orders_cache')
  .select('*')
  .limit(1)

if (error) {
  console.error('❌ Erro:', error)
} else if (data && data.length > 0) {
  console.log('✅ Colunas encontradas:')
  const cols = Object.keys(data[0])
  cols.forEach(col => {
    console.log(`   - ${col}: ${typeof data[0][col]} (valor: ${JSON.stringify(data[0][col]).substring(0, 50)})`)
  })
} else {
  console.log('ℹ️ Tabela vazia, tentando descobrir schema via REST API...')
  
  // Usar REST API para descobrir
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/orders_cache?limit=0`,
      {
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY,
        }
      }
    )
    console.log('REST API response headers:', response.headers.get('content-range'))
  } catch (err) {
    console.error('Erro:', err)
  }
}
