-- Criar RPC save_orders_json sem conflitos
-- Ignora erros de objetos que já existem

-- 1. Função para salvar pedidos via JSON array
CREATE OR REPLACE FUNCTION public.save_orders_json(p_orders JSONB)
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

-- 2. Dar permissões
GRANT EXECUTE ON FUNCTION public.save_orders_json(JSONB) TO anon, authenticated;

-- 3. View customer_ltv_all (se não existir)
CREATE OR REPLACE VIEW public.customer_ltv_all AS
SELECT
    COALESCE(billing_name, 'Unknown') AS customer_name,
    COUNT(*) FILTER (WHERE payment_status = 'paid') AS order_count,
    SUM(total) FILTER (WHERE payment_status = 'paid') AS lifetime_revenue,
    MIN(order_created_at) FILTER (WHERE payment_status = 'paid') AS first_order_at,
    MAX(order_created_at) FILTER (WHERE payment_status = 'paid') AS last_order_at
FROM public.orders_cache
WHERE billing_name IS NOT NULL
GROUP BY billing_name
ORDER BY lifetime_revenue DESC NULLS LAST;

GRANT SELECT ON public.customer_ltv_all TO anon, authenticated;
