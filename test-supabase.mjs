import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://prnshbkblddfgttsgxpt.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybnNoYmtibGRkZmd0dHNneHB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MzE1MTAsImV4cCI6MjA4NTMwNzUxMH0.HPUfckX6OfqbWu1MvZIs0bZaYRf58n84MRCrpRk-7og'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

console.log('🔍 Testando RPC save_orders_json...\n')

// Teste com dados simples
const testOrders = [
  {
    id: 1001,
    created_at: '2026-02-24T10:00:00Z',
    total: 250.00,
    subtotal: 250.00,
    shipping_cost_owner: 0,
    payment_status: 'paid',
    products: [
      { id: 1, name: 'Pote 680g', price: 250, quantity: 1 }
    ]
  }
]

try {
  console.log('📤 Tentando chamar RPC save_orders_json com:', JSON.stringify(testOrders[0], null, 2))
  
  const { data, error } = await supabase.rpc('save_orders_json', {
    p_orders: testOrders,
  })
  
  if (error) {
    console.error('\n❌ Erro na RPC:', error)
    console.error('Code:', error.code)
    console.error('Message:', error.message)
    console.error('Details:', error.details)
  } else {
    console.log('\n✅ RPC sucesso:', data)
  }
} catch (err) {
  console.error('❌ Exceção:', err.message)
}

// Agora vamos tentar INSERT direto
console.log('\n\n🔍 Tentando INSERT direto na tabela orders_cache...\n')

try {
  const { data, error } = await supabase
    .from('orders_cache')
    .insert([
      {
        id: 1002,
        order_created_at: '2026-02-24T11:00:00Z',
        order_total: 300.00,
        order_subtotal: 300.00,
        order_shipping_cost: 0,
        order_payment_status: 'paid',
        order_products_count: 1
      }
    ])
    .select()
  
  if (error) {
    console.error('❌ Erro no INSERT:', error)
  } else {
    console.log('✅ INSERT direto sucesso:', data)
  }
} catch (err) {
  console.error('❌ Exceção:', err.message)
}

// Verificar estrutura das tabelas
console.log('\n\n📊 Verificando estrutura das tabelas...\n')

try {
  const { data: tableInfo, error } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .in('table_name', ['orders_cache', 'meta_campaigns_cache'])
  
  if (error) {
    console.error('❌ Erro ao listar tabelas:', error)
  } else {
    console.log('✅ Tabelas encontradas:', tableInfo)
  }
} catch (err) {
  console.error('❌ Exceção:', err.message)
}

// Listar colunas da tabela orders_cache
console.log('\n\n🔍 Colunas da tabela orders_cache...\n')

try {
  const { data: columns, error } = await supabase
    .from('information_schema.columns')
    .select('column_name, data_type')
    .eq('table_schema', 'public')
    .eq('table_name', 'orders_cache')
  
  if (error) {
    console.error('❌ Erro ao listar colunas:', error)
  } else {
    console.log('✅ Colunas:', columns)
  }
} catch (err) {
  console.error('❌ Exceção:', err.message)
}

// Listar RPCs disponíveis
console.log('\n\n🔍 RPCs disponíveis...\n')

try {
  const { data: routines, error } = await supabase
    .from('information_schema.routines')
    .select('routine_name')
    .eq('routine_schema', 'public')
    .in('routine_name', ['save_orders_json', 'sync_orders_to_cache'])
  
  if (error) {
    console.error('❌ Erro ao listar RPCs:', error)
  } else {
    console.log('✅ RPCs encontradas:', routines)
  }
} catch (err) {
  console.error('❌ Exceção:', err.message)
}
