-- =============================================================
-- Província Real: Sync Functions
-- sync_orders_to_cache + sync_meta_to_cache
-- =============================================================

BEGIN;

-- Helper: Extract UTM params from URL
CREATE OR REPLACE FUNCTION public.extract_utm_param(url TEXT, param_name TEXT)
RETURNS TEXT LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
    query_string TEXT;
    param_value  TEXT;
BEGIN
    IF url IS NULL OR url = '' THEN
        RETURN NULL;
    END IF;

    query_string := split_part(url, '?', 2);

    IF query_string = '' THEN
        RETURN NULL;
    END IF;

    SELECT value INTO param_value
    FROM (
        SELECT
            split_part(kv, '=', 1) AS key,
            split_part(kv, '=', 2) AS value
        FROM unnest(string_to_array(query_string, '&')) AS kv
    ) params
    WHERE key = param_name
    LIMIT 1;

    RETURN param_value;
END;
$$;

-- sync_orders_to_cache
CREATE OR REPLACE FUNCTION public.sync_orders_to_cache(
    p_start_date DATE,
    p_end_date   DATE
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_log_id         BIGINT;
    v_raw_orders     JSONB;
    v_order          JSONB;
    v_orders_array   JSONB;
    v_fetched        INTEGER := 0;
    v_upserted       INTEGER := 0;
    v_start_ts       TIMESTAMPTZ := NOW();
    v_landing_url    TEXT;
BEGIN
    INSERT INTO public.sync_logs (sync_type, status, date_start, date_end)
    VALUES ('orders', 'started', p_start_date, p_end_date)
    RETURNING id INTO v_log_id;

    BEGIN
        SELECT result INTO v_raw_orders
        FROM public.fetch_nuvemshop_orders(p_start_date::TEXT, p_end_date::TEXT);

        v_orders_array := CASE
            WHEN jsonb_typeof(v_raw_orders) = 'array' THEN v_raw_orders
            ELSE jsonb_build_array(v_raw_orders)
        END;

        v_fetched := jsonb_array_length(v_orders_array);

        FOR v_order IN SELECT * FROM jsonb_array_elements(v_orders_array)
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
                payment_status = EXCLUDED.payment_status, shipping_status = EXCLUDED.shipping_status,
                billing_name = EXCLUDED.billing_name, contact_phone = EXCLUDED.contact_phone,
                billing_phone = EXCLUDED.billing_phone, landing_url = EXCLUDED.landing_url,
                utm_source = EXCLUDED.utm_source, utm_medium = EXCLUDED.utm_medium,
                utm_campaign = EXCLUDED.utm_campaign, utm_content = EXCLUDED.utm_content,
                utm_term = EXCLUDED.utm_term, products = EXCLUDED.products,
                fetched_at = EXCLUDED.fetched_at, updated_at = NOW();

            v_upserted := v_upserted + 1;
        END LOOP;

        UPDATE public.sync_logs
        SET status = 'success', records_fetched = v_fetched, records_upserted = v_upserted,
            duration_ms = EXTRACT(EPOCH FROM (NOW() - v_start_ts)) * 1000, completed_at = NOW()
        WHERE id = v_log_id;

        RETURN jsonb_build_object('success', TRUE, 'fetched', v_fetched, 'upserted', v_upserted, 'log_id', v_log_id);

    EXCEPTION WHEN OTHERS THEN
        UPDATE public.sync_logs
        SET status = 'error', error_message = SQLERRM,
            duration_ms = EXTRACT(EPOCH FROM (NOW() - v_start_ts)) * 1000, completed_at = NOW()
        WHERE id = v_log_id;

        RETURN jsonb_build_object('success', FALSE, 'error', SQLERRM, 'log_id', v_log_id);
    END;
END;
$$;

-- sync_meta_to_cache
CREATE OR REPLACE FUNCTION public.sync_meta_to_cache(
    p_start_date DATE,
    p_end_date   DATE
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_log_id       BIGINT;
    v_raw_data     JSONB;
    v_campaign     JSONB;
    v_data_array   JSONB;
    v_fetched      INTEGER := 0;
    v_upserted     INTEGER := 0;
    v_start_ts     TIMESTAMPTZ := NOW();
BEGIN
    INSERT INTO public.sync_logs (sync_type, status, date_start, date_end)
    VALUES ('meta_campaigns', 'started', p_start_date, p_end_date)
    RETURNING id INTO v_log_id;

    BEGIN
        SELECT result INTO v_raw_data
        FROM public.fetch_meta_campaigns(p_start_date::TEXT, p_end_date::TEXT);

        v_data_array := CASE
            WHEN jsonb_typeof(v_raw_data) = 'array' THEN v_raw_data
            ELSE COALESCE(v_raw_data->'data', jsonb_build_array(v_raw_data))
        END;

        v_fetched := jsonb_array_length(v_data_array);

        FOR v_campaign IN SELECT * FROM jsonb_array_elements(v_data_array)
        LOOP
            INSERT INTO public.meta_campaigns_cache (
                campaign_id, campaign_name, account_id, account_name,
                spend, impressions, clicks, cpc, ctr, cpm, actions,
                date_start, date_stop, fetched_at
            ) VALUES (
                v_campaign->>'campaign_id',
                v_campaign->>'campaign_name',
                v_campaign->>'account_id',
                v_campaign->>'account_name',
                COALESCE((v_campaign->>'spend')::NUMERIC, 0),
                COALESCE((v_campaign->>'impressions')::BIGINT, 0),
                COALESCE((v_campaign->>'clicks')::BIGINT, 0),
                (v_campaign->>'cpc')::NUMERIC,
                (v_campaign->>'ctr')::NUMERIC,
                CASE WHEN (v_campaign->>'impressions')::BIGINT > 0
                    THEN ((v_campaign->>'spend')::NUMERIC / (v_campaign->>'impressions')::BIGINT) * 1000
                    ELSE 0 END,
                v_campaign->'actions',
                p_start_date, p_end_date, NOW()
            )
            ON CONFLICT (campaign_id, date_start, date_stop) DO UPDATE SET
                campaign_name = EXCLUDED.campaign_name, spend = EXCLUDED.spend,
                impressions = EXCLUDED.impressions, clicks = EXCLUDED.clicks,
                cpc = EXCLUDED.cpc, ctr = EXCLUDED.ctr, cpm = EXCLUDED.cpm,
                actions = EXCLUDED.actions, fetched_at = EXCLUDED.fetched_at, updated_at = NOW();

            v_upserted := v_upserted + 1;
        END LOOP;

        UPDATE public.sync_logs
        SET status = 'success', records_fetched = v_fetched, records_upserted = v_upserted,
            duration_ms = EXTRACT(EPOCH FROM (NOW() - v_start_ts)) * 1000, completed_at = NOW()
        WHERE id = v_log_id;

        RETURN jsonb_build_object('success', TRUE, 'fetched', v_fetched, 'upserted', v_upserted, 'log_id', v_log_id);

    EXCEPTION WHEN OTHERS THEN
        UPDATE public.sync_logs
        SET status = 'error', error_message = SQLERRM,
            duration_ms = EXTRACT(EPOCH FROM (NOW() - v_start_ts)) * 1000, completed_at = NOW()
        WHERE id = v_log_id;

        RETURN jsonb_build_object('success', FALSE, 'error', SQLERRM, 'log_id', v_log_id);
    END;
END;
$$;

COMMIT;
