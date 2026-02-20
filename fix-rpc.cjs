const https = require('https');

const TOKEN = 'sbp_918272d9db25c6800e4dcbbf5c3c8a6df212b4f3';
const PROJECT_ID = 'prnshbkblddfgttsgxpt';

// Nova RPC que aceita JSON direto (sem depender de fetch_nuvemshop_orders)
const newRPC = `
CREATE OR REPLACE FUNCTION public.save_orders_json(p_orders JSONB)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_order JSONB;
    v_upserted INTEGER := 0;
    v_landing_url TEXT;
BEGIN
    IF p_orders IS NULL THEN
        RETURN jsonb_build_object('success', FALSE, 'error', 'No orders provided');
    END IF;

    FOR v_order IN SELECT * FROM jsonb_array_elements(p_orders)
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
        
        v_upserted := v_upserted + 1;
    END LOOP;

    RETURN jsonb_build_object('success', TRUE, 'upserted', v_upserted);
END;
$$;
`;

console.log('🔧 Criando RPC save_orders_json...\n');

const path = `/v1/projects/${PROJECT_ID}/database/query`;
const payload = JSON.stringify({ query: newRPC });

const options = {
  hostname: 'api.supabase.com',
  path: path,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Length': Buffer.byteLength(payload)
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log(`📊 Status: ${res.statusCode}`);
    
    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log('✅ RPC save_orders_json criada com sucesso!\n');
      console.log('💡 Frontend pode agora chamar:');
      console.log('   supabase.rpc("save_orders_json", { p_orders: [...] })');
    } else {
      console.log('❌ Erro:', data);
    }
  });
});

req.on('error', (err) => {
  console.error('❌ Erro:', err.message);
});

req.write(payload);
req.end();
