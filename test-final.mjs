import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://prnshbkblddfgttsgxpt.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybnNoYmtibGRkZmd0dHNneHB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MzE1MTAsImV4cCI6MjA4NTMwNzUxMH0.HPUfckX6OfqbWu1MvZIs0bZaYRf58n84MRCrpRk-7og'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

console.log('🚀 Teste Final - Fluxo Completo\n')

try {
  // 1. Chamar Edge Function
  console.log('1️⃣ Buscando dados da Edge Function...')
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
  console.log(`   ✅ Recebidos ${edgeOrders.length} orders\n`)

  if (edgeOrders.length === 0) {
    console.log('⚠️ Nenhum order recebido')
    process.exit(0)
  }

  // 2. Transformar dados (CORREÇÃO PRINCIPAL)
  console.log('2️⃣ Transformando dados para RPC...')
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
  console.log(`   ✅ Transformados ${transformedOrders.length} orders\n`)

  // 3. Salvar via RPC
  console.log('3️⃣ Salvando via RPC save_orders_json...')
  const { data: rpcResult, error: rpcError } = await supabase.rpc('save_orders_json', {
    p_orders: transformedOrders,
  })

  if (rpcError) {
    console.error(`   ❌ RPC Error: ${rpcError.message}`)
    process.exit(1)
  }

  console.log(`   ✅ RPC sucesso: ${JSON.stringify(rpcResult)}\n`)

  // 4. Verificar dados salvos
  console.log('4️⃣ Verificando dados salvos no cache...')
  const { data: savedOrders, error: selectError } = await supabase
    .from('orders_cache')
    .select('id, order_created_at, order_total, order_payment_status')
    .gte('order_created_at', '2026-02-24T00:00:00Z')
    .lte('order_created_at', '2026-02-26T00:00:00Z')
    .limit(5)

  if (selectError) {
    console.error(`   ❌ Select Error: ${selectError.message}`)
  } else {
    console.log(`   ✅ Encontrados ${savedOrders?.length || 0} orders no cache`)
    if (savedOrders && savedOrders.length > 0) {
      console.log('\n📋 Amostra de dados salvos:')
      savedOrders.slice(0, 2).forEach((order, i) => {
        console.log(`   ${i + 1}. ID: ${order.id}, Created: ${order.order_created_at}, Total: R$${order.order_total}, Status: ${order.order_payment_status}`)
      })
    }
  }

  console.log('\n✅ TESTE COMPLETO COM SUCESSO!')
  console.log('   Os dados agora estarão disponíveis no frontend!')

} catch (err) {
  console.error('❌ Exception:', err.message)
  process.exit(1)
}
