#!/usr/bin/env node

/**
 * Aplica migrations direto via Supabase API
 * Usa o token pessoal para fazer operações administrativas
 */

import fetch from 'node-fetch'

const PROJECT_REF = 'prnshbkblddfgttsgxpt'
const SUPABASE_URL = `https://${PROJECT_REF}.supabase.co`
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybnNoYmtibGRkZmd0dHNneHB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MzE1MTAsImV4cCI6MjA4NTMwNzUxMH0.HPUfckX6OfqbWu1MvZIs0bZaYRf58n84MRCrpRk-7og'

// SQL que precisa ser aplicado
const MIGRATION_SQL = `
-- Fix: Criar RPC save_orders_json que estava faltando
CREATE OR REPLACE FUNCTION public.save_orders_json(
    p_orders JSONB
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_order JSONB;
    v_count INTEGER := 0;
    v_landing_url TEXT;
BEGIN
    IF jsonb_typeof(p_orders) != 'array' THEN
        p_orders := jsonb_build_array(p_orders);
    END IF;

    FOR v_order IN SELECT jsonb_array_elements(p_orders)
    LOOP
        v_landing_url := v_order->>'landing_url';

        INSERT INTO public.orders_cache (
            id, total, subtotal, shipping_cost_owner, payment_status, shipping_status,
            billing_name, contact_phone, billing_phone, landing_url,
            utm_source, utm_medium, utm_campaign, utm_content, utm_term,
            products, order_created_at, fetched_at
        ) VALUES (
            (v_order->>'id')::BIGINT,
            COALESCE((v_order->>'total')::NUMERIC, 0),
            COALESCE((v_order->>'subtotal')::NUMERIC, 0),
            COALESCE((v_order->>'shipping_cost_owner')::NUMERIC, 0),
            COALESCE(v_order->>'payment_status', 'unknown'),
            v_order->>'shipping_status',
            v_order->>'billing_name',
            v_order->>'contact_phone',
            v_order->>'billing_phone',
            v_landing_url,
            public.extract_utm_param(v_landing_url, 'utm_source'),
            public.extract_utm_param(v_landing_url, 'utm_medium'),
            public.extract_utm_param(v_landing_url, 'utm_campaign'),
            public.extract_utm_param(v_landing_url, 'utm_content'),
            public.extract_utm_param(v_landing_url, 'utm_term'),
            v_order->'products',
            (v_order->>'created_at')::TIMESTAMPTZ,
            NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            total = EXCLUDED.total, subtotal = EXCLUDED.subtotal,
            shipping_cost_owner = EXCLUDED.shipping_cost_owner,
            payment_status = EXCLUDED.payment_status,
            shipping_status = EXCLUDED.shipping_status,
            billing_name = EXCLUDED.billing_name,
            contact_phone = EXCLUDED.contact_phone,
            billing_phone = EXCLUDED.billing_phone,
            landing_url = EXCLUDED.landing_url,
            utm_source = EXCLUDED.utm_source,
            utm_medium = EXCLUDED.utm_medium,
            utm_campaign = EXCLUDED.utm_campaign,
            utm_content = EXCLUDED.utm_content,
            utm_term = EXCLUDED.utm_term,
            products = EXCLUDED.products,
            fetched_at = EXCLUDED.fetched_at,
            updated_at = NOW();

        v_count := v_count + 1;
    END LOOP;

    RETURN jsonb_build_object('success', TRUE, 'saved', v_count);

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', FALSE, 'error', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION public.save_orders_json(JSONB) TO anon, authenticated;

-- customer_ltv_all view
CREATE OR REPLACE VIEW public.customer_ltv_all AS
SELECT
    COALESCE(billing_name, 'Unknown') AS customer_name,
    COALESCE(contact_phone, '') AS customer_phone,
    COUNT(*) FILTER (WHERE payment_status = 'paid') AS order_count,
    SUM(total) FILTER (WHERE payment_status = 'paid') AS lifetime_revenue,
    AVG(total) FILTER (WHERE payment_status = 'paid') AS avg_order_value,
    MIN(order_created_at) FILTER (WHERE payment_status = 'paid') AS first_order_at,
    MAX(order_created_at) FILTER (WHERE payment_status = 'paid') AS last_order_at,
    CASE
        WHEN COUNT(*) FILTER (WHERE payment_status = 'paid') > 1 THEN 'returning'
        WHEN COUNT(*) FILTER (WHERE payment_status = 'paid') = 1 THEN 'one_time'
        ELSE 'non_converting'
    END AS customer_type
FROM public.orders_cache
WHERE billing_name IS NOT NULL OR contact_phone IS NOT NULL
GROUP BY billing_name, contact_phone
ORDER BY lifetime_revenue DESC NULLS LAST;

GRANT SELECT ON public.customer_ltv_all TO anon, authenticated;

-- Fix exchange_rates RLS
ALTER TABLE public.exchange_rates DISABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Allow public read access" ON public.exchange_rates FOR SELECT USING (true);
`

async function applySql(sql) {
  console.log('🚀 Aplicando SQL direto no banco...')
  console.log('')

  // Dividir em statements individuais
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s && !s.startsWith('--'))

  console.log(`📝 ${statements.length} statements para executar`)
  console.log('')

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i]
    console.log(`[${i + 1}/${statements.length}] ${stmt.substring(0, 50)}...`)

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
        method: 'POST',
        headers: {
          'apikey': ANON_KEY,
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ANON_KEY}`,
        },
        body: JSON.stringify({
          query: stmt,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        console.log(`   ⚠️  Status ${response.status}:`, error?.message || JSON.stringify(error))
      } else {
        console.log(`   ✅ OK`)
      }
    } catch (err) {
      console.log(`   ❌ Erro:`, err.message)
    }
  }

  console.log('')
  console.log('✨ Aplicação concluída!')
}

// Executar
applySql(MIGRATION_SQL).catch(console.error)
