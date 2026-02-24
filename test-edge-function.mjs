import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://prnshbkblddfgttsgxpt.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybnNoYmtibGRkZmd0dHNneHB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MzE1MTAsImV4cCI6MjA4NTMwNzUxMH0.HPUfckX6OfqbWu1MvZIs0bZaYRf58n84MRCrpRk-7og'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

console.log('📡 Testando Edge Function fetch-nuvemshop-orders...\n')

try {
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
  console.log('✅ Edge Function Response:', JSON.stringify(edgeData, null, 2))

  if (!response.ok) {
    console.error('❌ Edge function error:', response.status)
    process.exit(1)
  }

  const edgeOrders = edgeData.result || edgeData.data || edgeData || []
  console.log(`\n📦 Total orders received: ${Array.isArray(edgeOrders) ? edgeOrders.length : 0}`)

  if (Array.isArray(edgeOrders) && edgeOrders.length > 0) {
    console.log(`\n📋 Sample order structure:`)
    console.log(JSON.stringify(edgeOrders[0], null, 2))

    // Agora tentar salvar via RPC
    console.log(`\n💾 Tentando salvar via RPC save_orders_json...`)
    
    const { data: rpcResult, error: rpcError } = await supabase.rpc('save_orders_json', {
      p_orders: edgeOrders,
    })

    if (rpcError) {
      console.error(`\n❌ RPC Error:`, rpcError)
      console.error('Code:', rpcError.code)
      console.error('Message:', rpcError.message)
      
      // Se falhar, tentar transformar os dados
      console.log(`\n🔄 Transformando dados para corresponder à estrutura esperada...`)
      
      const transformedOrders = edgeOrders.map(order => ({
        id: order.id,
        created_at: order.created_at || order.date,
        total: order.total || 0,
        subtotal: order.subtotal || 0,
        shipping_cost_owner: order.shipping_cost_owner || 0,
        payment_status: order.payment_status || 'pending',
        products: order.products || []
      }))
      
      console.log('Transformed sample:', JSON.stringify(transformedOrders[0], null, 2))
      
      const { data: rpcResult2, error: rpcError2 } = await supabase.rpc('save_orders_json', {
        p_orders: transformedOrders,
      })
      
      if (rpcError2) {
        console.error(`\n❌ Transformed RPC still failed:`, rpcError2)
      } else {
        console.log(`\n✅ Transformed RPC succeeded:`, rpcResult2)
      }
    } else {
      console.log(`\n✅ RPC Result:`, rpcResult)
    }
  }
} catch (err) {
  console.error('❌ Exception:', err.message)
}
