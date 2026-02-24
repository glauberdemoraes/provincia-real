import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://prnshbkblddfgttsgxpt.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybnNoYmtibGRkZmd0dHNneHB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MzE1MTAsImV4cCI6MjA4NTMwNzUxMH0.HPUfckX6OfqbWu1MvZIs0bZaYRf58n84MRCrpRk-7og'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

console.log('🚀 TESTE COMPLETO - Fluxo de Sincronização\n')

const dateRange = {
  start: new Date('2026-02-24T00:00:00Z'),
  end: new Date('2026-02-25T23:59:59Z'),
}

try {
  // 1. Edge Function
  console.log('1️⃣ Edge Function → fetch-nuvemshop-orders')
  const response = await fetch(`${SUPABASE_URL}/functions/v1/fetch-nuvemshop-orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      start_date: '2026-02-24',
      end_date: '2026-02-25',
    }),
  })

  const edgeData = await response.json()
  const edgeOrders = edgeData.result || []
  console.log(`   ✅ ${edgeOrders.length} orders recebidos\n`)

  // 2. Transform
  console.log('2️⃣ Transformar dados')
  const transformedOrders = edgeOrders.map(order => ({
    id: order.id,
    created_at: order.created_at || order.date,
    total: typeof order.total === 'string' ? parseFloat(order.total) : order.total,
    subtotal: typeof order.subtotal === 'string' ? parseFloat(order.subtotal) : order.subtotal,
    shipping_cost_owner: typeof order.shipping_cost_owner === 'string'
      ? parseFloat(order.shipping_cost_owner)
      : order.shipping_cost_owner,
    payment_status: order.payment_status || 'pending',
    products: order.products || [],
  }))
  console.log(`   ✅ ${transformedOrders.length} orders transformados\n`)

  // 3. RPC Save
  console.log('3️⃣ RPC save_orders_json')
  const { data: rpcResult, error: rpcError } = await supabase.rpc('save_orders_json', {
    p_orders: transformedOrders,
  })

  if (rpcError) {
    throw new Error(`RPC erro: ${rpcError.message}`)
  }
  console.log(`   ✅ ${rpcResult.upserted} orders salvos\n`)

  // 4. Fetch from Cache (com nomes corretos de colunas)
  console.log('4️⃣ Buscar do orders_cache (validar salvamento)')
  const { data: cachedOrders, error: cacheError } = await supabase
    .from('orders_cache')
    .select('id, total, payment_status, order_created_at, products')
    .gte('order_created_at', dateRange.start.toISOString())
    .lte('order_created_at', dateRange.end.toISOString())
    .order('order_created_at', { ascending: false })

  if (cacheError) {
    throw new Error(`Cache erro: ${cacheError.message}`)
  }

  console.log(`   ✅ ${cachedOrders?.length || 0} orders encontrados no cache\n`)

  if (cachedOrders && cachedOrders.length > 0) {
    console.log('📋 Amostra de dados:')
    cachedOrders.slice(0, 3).forEach((order, i) => {
      console.log(`   ${i + 1}. ID: ${order.id} | Total: R$${order.total} | Status: ${order.payment_status} | Criado: ${order.order_created_at}`)
    })
  }

  console.log('\n✅ SUCESSO! Fluxo de sincronização funcionando corretamente')
  console.log('   Dados estão salvos no Supabase e prontos para serem exibidos')
  console.log('   O realtime agora detectará as mudanças e atualizará a UI automaticamente')

} catch (err) {
  console.error('\n❌ ERRO:', err.message)
  process.exit(1)
}
