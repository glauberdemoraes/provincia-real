-- Fix: Criar RPC save_orders_json que estava faltando

BEGIN;

-- Função para salvar pedidos via JSON array
CREATE OR REPLACE FUNCTION public.save_orders_json(
    p_orders JSONB
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_order JSONB;
    v_count INTEGER := 0;
    v_landing_url TEXT;
BEGIN
    -- Garantir que é um array
    IF jsonb_typeof(p_orders) != 'array' THEN
        p_orders := jsonb_build_array(p_orders);
    END IF;

    -- Iterar sobre cada pedido
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
            total = EXCLUDED.total,
            subtotal = EXCLUDED.subtotal,
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

-- Dar permissões para anon user
GRANT EXECUTE ON FUNCTION public.save_orders_json(JSONB) TO anon;
GRANT EXECUTE ON FUNCTION public.save_orders_json(JSONB) TO authenticated;

-- Criar RPC para customer_ltv_all view
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

-- Dar permissões na view
GRANT SELECT ON public.customer_ltv_all TO anon;
GRANT SELECT ON public.customer_ltv_all TO authenticated;

-- Função initialize_retention_view
CREATE OR REPLACE FUNCTION public.initialize_retention_view()
RETURNS TABLE (success BOOLEAN, message TEXT) AS $$
BEGIN
  RETURN QUERY SELECT true::BOOLEAN, 'customer_ltv_all view available'::TEXT;
EXCEPTION WHEN OTHERS THEN
  RETURN QUERY SELECT false::BOOLEAN, ('Error: ' || SQLERRM)::TEXT;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION public.initialize_retention_view() TO anon;
GRANT EXECUTE ON FUNCTION public.initialize_retention_view() TO authenticated;

-- Ajustar RLS em exchange_rates para permitir leitura pública
ALTER TABLE public.exchange_rates DISABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access on exchange_rates"
  ON public.exchange_rates FOR SELECT USING (true);

COMMIT;
