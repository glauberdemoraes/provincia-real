-- Província Real: COMBINED MIGRATIONS
-- Copy-paste this entire file into Supabase SQL Editor and run
-- ============================================================

-- Migration 001: Cache Tables
-- ============================================================
BEGIN;

CREATE TABLE IF NOT EXISTS public.orders_cache (
    id                   BIGINT PRIMARY KEY,
    total                NUMERIC(10, 2)    NOT NULL DEFAULT 0,
    subtotal             NUMERIC(10, 2)    NOT NULL DEFAULT 0,
    shipping_cost_owner  NUMERIC(10, 2)    NOT NULL DEFAULT 0,
    payment_status       TEXT              NOT NULL,
    shipping_status      TEXT,
    billing_name         TEXT,
    contact_phone        TEXT,
    billing_phone        TEXT,
    landing_url          TEXT,
    utm_source           TEXT,
    utm_medium           TEXT,
    utm_campaign         TEXT,
    utm_content          TEXT,
    utm_term             TEXT,
    products             JSONB,
    order_created_at     TIMESTAMPTZ       NOT NULL,
    fetched_at           TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_cache_payment_status
    ON public.orders_cache (payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_cache_order_created_at
    ON public.orders_cache (order_created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_cache_utm_source
    ON public.orders_cache (utm_source);
CREATE INDEX IF NOT EXISTS idx_orders_cache_utm_campaign
    ON public.orders_cache (utm_campaign);
CREATE INDEX IF NOT EXISTS idx_orders_cache_paid_date
    ON public.orders_cache (payment_status, order_created_at DESC)
    WHERE payment_status = 'paid';

CREATE TABLE IF NOT EXISTS public.meta_campaigns_cache (
    id                   BIGSERIAL         PRIMARY KEY,
    campaign_id          TEXT              NOT NULL,
    campaign_name        TEXT              NOT NULL,
    account_id           TEXT              NOT NULL,
    account_name         TEXT,
    spend                NUMERIC(10, 4)    NOT NULL DEFAULT 0,
    impressions          BIGINT            NOT NULL DEFAULT 0,
    clicks               BIGINT            NOT NULL DEFAULT 0,
    cpc                  NUMERIC(10, 4),
    ctr                  NUMERIC(8, 6),
    cpm                  NUMERIC(10, 4),
    actions              JSONB,
    purchases            INTEGER           GENERATED ALWAYS AS (
                             COALESCE((actions->>'purchase')::INTEGER, 0)
                         ) STORED,
    date_start           DATE              NOT NULL,
    date_stop            DATE              NOT NULL,
    fetched_at           TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
    UNIQUE (campaign_id, date_start, date_stop)
);

CREATE INDEX IF NOT EXISTS idx_meta_campaigns_date
    ON public.meta_campaigns_cache (date_start DESC, date_stop DESC);
CREATE INDEX IF NOT EXISTS idx_meta_campaigns_campaign_id
    ON public.meta_campaigns_cache (campaign_id);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER set_orders_updated_at
    BEFORE UPDATE ON public.orders_cache
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_meta_updated_at
    BEFORE UPDATE ON public.meta_campaigns_cache
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

COMMIT;

-- Migration 002: Support Tables & RLS
-- ============================================================
BEGIN;

CREATE TABLE IF NOT EXISTS public.alerts_config (
    id              UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT              NOT NULL,
    metric          TEXT              NOT NULL,
    condition       TEXT              NOT NULL,
    threshold       NUMERIC           NOT NULL,
    severity        TEXT              NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
    enabled         BOOLEAN           NOT NULL DEFAULT TRUE,
    message_template TEXT,
    created_at      TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_alerts_config_updated_at
    BEFORE UPDATE ON public.alerts_config
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.active_alerts (
    id              UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
    config_id       UUID              REFERENCES public.alerts_config(id) ON DELETE CASCADE,
    metric          TEXT              NOT NULL,
    current_value   NUMERIC,
    threshold       NUMERIC,
    severity        TEXT              NOT NULL,
    message         TEXT              NOT NULL,
    fired_at        TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
    acknowledged_at TIMESTAMPTZ,
    resolved_at     TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_active_alerts_severity
    ON public.active_alerts (severity, fired_at DESC)
    WHERE resolved_at IS NULL;

CREATE TABLE IF NOT EXISTS public.sync_logs (
    id              BIGSERIAL         PRIMARY KEY,
    sync_type       TEXT              NOT NULL CHECK (sync_type IN ('orders', 'meta_campaigns')),
    status          TEXT              NOT NULL CHECK (status IN ('started', 'success', 'error')),
    date_start      DATE              NOT NULL,
    date_end        DATE              NOT NULL,
    records_fetched INTEGER           DEFAULT 0,
    records_upserted INTEGER          DEFAULT 0,
    duration_ms     INTEGER,
    error_message   TEXT,
    started_at      TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
    completed_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_sync_logs_type_status
    ON public.sync_logs (sync_type, started_at DESC);

ALTER TABLE public.orders_cache          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meta_campaigns_cache  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts_config         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.active_alerts         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_logs             ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read_orders"
    ON public.orders_cache FOR SELECT TO anon USING (TRUE);
CREATE POLICY "anon_read_meta"
    ON public.meta_campaigns_cache FOR SELECT TO anon USING (TRUE);
CREATE POLICY "anon_read_alerts_config"
    ON public.alerts_config FOR SELECT TO anon USING (TRUE);
CREATE POLICY "anon_write_alerts_config"
    ON public.alerts_config FOR ALL TO anon USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "anon_read_active_alerts"
    ON public.active_alerts FOR SELECT TO anon USING (TRUE);
CREATE POLICY "anon_read_sync_logs"
    ON public.sync_logs FOR SELECT TO anon USING (TRUE);

COMMIT;

-- Migration 003: Sync Functions
-- ============================================================
BEGIN;

CREATE OR REPLACE FUNCTION public.extract_utm_param(url TEXT, param_name TEXT)
RETURNS TEXT LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
    query_string TEXT;
    param_value  TEXT;
BEGIN
    IF url IS NULL OR url = '' THEN RETURN NULL; END IF;
    query_string := split_part(url, '?', 2);
    IF query_string = '' THEN RETURN NULL; END IF;
    SELECT value INTO param_value FROM (
        SELECT split_part(kv, '=', 1) AS key, split_part(kv, '=', 2) AS value
        FROM unnest(string_to_array(query_string, '&')) AS kv
    ) params WHERE key = param_name LIMIT 1;
    RETURN param_value;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_orders_to_cache(p_start_date DATE, p_end_date DATE)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_log_id BIGINT;
    v_raw_orders JSONB;
    v_order JSONB;
    v_orders_array JSONB;
    v_fetched INTEGER := 0;
    v_upserted INTEGER := 0;
    v_start_ts TIMESTAMPTZ := NOW();
    v_landing_url TEXT;
BEGIN
    INSERT INTO public.sync_logs (sync_type, status, date_start, date_end)
    VALUES ('orders', 'started', p_start_date, p_end_date) RETURNING id INTO v_log_id;
    BEGIN
        SELECT result INTO v_raw_orders FROM public.fetch_nuvemshop_orders(p_start_date::TEXT, p_end_date::TEXT);
        v_orders_array := CASE WHEN jsonb_typeof(v_raw_orders) = 'array' THEN v_raw_orders ELSE jsonb_build_array(v_raw_orders) END;
        v_fetched := jsonb_array_length(v_orders_array);
        FOR v_order IN SELECT * FROM jsonb_array_elements(v_orders_array) LOOP
            v_landing_url := v_order->>'landing_url';
            INSERT INTO public.orders_cache (id, total, subtotal, shipping_cost_owner, payment_status, shipping_status,
                billing_name, contact_phone, billing_phone, landing_url,
                utm_source, utm_medium, utm_campaign, utm_content, utm_term,
                products, order_created_at, fetched_at) VALUES (
                (v_order->>'id')::BIGINT, COALESCE((v_order->>'total')::NUMERIC, 0),
                COALESCE((v_order->>'subtotal')::NUMERIC, 0), COALESCE((v_order->>'shipping_cost_owner')::NUMERIC, 0),
                COALESCE(v_order->>'payment_status', 'unknown'), v_order->>'shipping_status',
                v_order->>'billing_name', v_order->>'contact_phone', v_order->>'billing_phone', v_landing_url,
                public.extract_utm_param(v_landing_url, 'utm_source'),
                public.extract_utm_param(v_landing_url, 'utm_medium'),
                public.extract_utm_param(v_landing_url, 'utm_campaign'),
                public.extract_utm_param(v_landing_url, 'utm_content'),
                public.extract_utm_param(v_landing_url, 'utm_term'),
                v_order->'products', (v_order->>'created_at')::TIMESTAMPTZ, NOW())
            ON CONFLICT (id) DO UPDATE SET total = EXCLUDED.total, subtotal = EXCLUDED.subtotal,
                shipping_cost_owner = EXCLUDED.shipping_cost_owner, payment_status = EXCLUDED.payment_status,
                shipping_status = EXCLUDED.shipping_status, billing_name = EXCLUDED.billing_name,
                contact_phone = EXCLUDED.contact_phone, billing_phone = EXCLUDED.billing_phone,
                landing_url = EXCLUDED.landing_url, utm_source = EXCLUDED.utm_source,
                utm_medium = EXCLUDED.utm_medium, utm_campaign = EXCLUDED.utm_campaign,
                utm_content = EXCLUDED.utm_content, utm_term = EXCLUDED.utm_term,
                products = EXCLUDED.products, fetched_at = EXCLUDED.fetched_at, updated_at = NOW();
            v_upserted := v_upserted + 1;
        END LOOP;
        UPDATE public.sync_logs SET status = 'success', records_fetched = v_fetched,
            records_upserted = v_upserted, duration_ms = EXTRACT(EPOCH FROM (NOW() - v_start_ts)) * 1000,
            completed_at = NOW() WHERE id = v_log_id;
        RETURN jsonb_build_object('success', TRUE, 'fetched', v_fetched, 'upserted', v_upserted, 'log_id', v_log_id);
    EXCEPTION WHEN OTHERS THEN
        UPDATE public.sync_logs SET status = 'error', error_message = SQLERRM,
            duration_ms = EXTRACT(EPOCH FROM (NOW() - v_start_ts)) * 1000, completed_at = NOW() WHERE id = v_log_id;
        RETURN jsonb_build_object('success', FALSE, 'error', SQLERRM, 'log_id', v_log_id);
    END;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_meta_to_cache(p_start_date DATE, p_end_date DATE)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_log_id BIGINT;
    v_raw_data JSONB;
    v_campaign JSONB;
    v_data_array JSONB;
    v_fetched INTEGER := 0;
    v_upserted INTEGER := 0;
    v_start_ts TIMESTAMPTZ := NOW();
BEGIN
    INSERT INTO public.sync_logs (sync_type, status, date_start, date_end)
    VALUES ('meta_campaigns', 'started', p_start_date, p_end_date) RETURNING id INTO v_log_id;
    BEGIN
        SELECT result INTO v_raw_data FROM public.fetch_meta_campaigns(p_start_date::TEXT, p_end_date::TEXT);
        v_data_array := CASE WHEN jsonb_typeof(v_raw_data) = 'array' THEN v_raw_data ELSE COALESCE(v_raw_data->'data', jsonb_build_array(v_raw_data)) END;
        v_fetched := jsonb_array_length(v_data_array);
        FOR v_campaign IN SELECT * FROM jsonb_array_elements(v_data_array) LOOP
            INSERT INTO public.meta_campaigns_cache (campaign_id, campaign_name, account_id, account_name,
                spend, impressions, clicks, cpc, ctr, cpm, actions, date_start, date_stop, fetched_at) VALUES (
                v_campaign->>'campaign_id', v_campaign->>'campaign_name', v_campaign->>'account_id', v_campaign->>'account_name',
                COALESCE((v_campaign->>'spend')::NUMERIC, 0), COALESCE((v_campaign->>'impressions')::BIGINT, 0),
                COALESCE((v_campaign->>'clicks')::BIGINT, 0), (v_campaign->>'cpc')::NUMERIC, (v_campaign->>'ctr')::NUMERIC,
                CASE WHEN (v_campaign->>'impressions')::BIGINT > 0 THEN ((v_campaign->>'spend')::NUMERIC / (v_campaign->>'impressions')::BIGINT) * 1000 ELSE 0 END,
                v_campaign->'actions', p_start_date, p_end_date, NOW())
            ON CONFLICT (campaign_id, date_start, date_stop) DO UPDATE SET
                campaign_name = EXCLUDED.campaign_name, spend = EXCLUDED.spend, impressions = EXCLUDED.impressions,
                clicks = EXCLUDED.clicks, cpc = EXCLUDED.cpc, ctr = EXCLUDED.ctr, cpm = EXCLUDED.cpm,
                actions = EXCLUDED.actions, fetched_at = EXCLUDED.fetched_at, updated_at = NOW();
            v_upserted := v_upserted + 1;
        END LOOP;
        UPDATE public.sync_logs SET status = 'success', records_fetched = v_fetched, records_upserted = v_upserted,
            duration_ms = EXTRACT(EPOCH FROM (NOW() - v_start_ts)) * 1000, completed_at = NOW() WHERE id = v_log_id;
        RETURN jsonb_build_object('success', TRUE, 'fetched', v_fetched, 'upserted', v_upserted, 'log_id', v_log_id);
    EXCEPTION WHEN OTHERS THEN
        UPDATE public.sync_logs SET status = 'error', error_message = SQLERRM,
            duration_ms = EXTRACT(EPOCH FROM (NOW() - v_start_ts)) * 1000, completed_at = NOW() WHERE id = v_log_id;
        RETURN jsonb_build_object('success', FALSE, 'error', SQLERRM, 'log_id', v_log_id);
    END;
END;
$$;

COMMIT;

-- Migration 004: Alert Functions
-- ============================================================
BEGIN;

CREATE OR REPLACE FUNCTION public.check_alerts()
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_today DATE := CURRENT_DATE;
    v_hour INTEGER := EXTRACT(HOUR FROM NOW());
    v_elapsed_minutes INTEGER := (v_hour * 60) + EXTRACT(MINUTE FROM NOW())::INTEGER;
    v_revenue_today NUMERIC;
    v_orders_today INTEGER;
    v_orders_hour NUMERIC;
    v_daily_target NUMERIC := 5000.00;
    v_pace_pct NUMERIC;
    v_meta_spend NUMERIC;
    v_alert_cfg RECORD;
    v_current_value NUMERIC;
    v_fires BOOLEAN;
    v_alerts_fired JSONB := '[]'::JSONB;
    v_alert_row JSONB;
BEGIN
    SELECT COALESCE(SUM(total), 0), COUNT(*) INTO v_revenue_today, v_orders_today
    FROM public.orders_cache WHERE payment_status = 'paid' AND order_created_at::DATE = v_today;
    
    v_orders_hour := CASE WHEN v_elapsed_minutes > 0 THEN (v_orders_today::NUMERIC / v_elapsed_minutes) * 60 ELSE 0 END;
    v_pace_pct := CASE WHEN v_elapsed_minutes > 0 AND v_daily_target > 0
        THEN (v_revenue_today / (v_daily_target * v_elapsed_minutes / 1440.0)) * 100 ELSE 100 END;
    
    SELECT COALESCE(SUM(spend), 0) INTO v_meta_spend FROM public.meta_campaigns_cache WHERE date_start = v_today;
    
    FOR v_alert_cfg IN SELECT * FROM public.alerts_config WHERE enabled = TRUE LOOP
        v_current_value := CASE v_alert_cfg.metric
            WHEN 'pace_pct' THEN v_pace_pct WHEN 'orders_hour' THEN v_orders_hour
            WHEN 'revenue_today' THEN v_revenue_today WHEN 'spend_today' THEN v_meta_spend ELSE NULL END;
        IF v_current_value IS NULL THEN CONTINUE; END IF;
        v_fires := CASE v_alert_cfg.condition
            WHEN 'less_than' THEN v_current_value < v_alert_cfg.threshold
            WHEN 'greater_than' THEN v_current_value > v_alert_cfg.threshold
            WHEN 'equals' THEN v_current_value = v_alert_cfg.threshold ELSE FALSE END;
        IF v_fires THEN
            v_alert_row := jsonb_build_object('config_id', v_alert_cfg.id, 'name', v_alert_cfg.name,
                'metric', v_alert_cfg.metric, 'current_value', ROUND(v_current_value, 2),
                'threshold', v_alert_cfg.threshold, 'severity', v_alert_cfg.severity,
                'message', COALESCE(v_alert_cfg.message_template, v_alert_cfg.name), 'fired_at', NOW());
            v_alerts_fired := v_alerts_fired || jsonb_build_array(v_alert_row);
            INSERT INTO public.active_alerts (config_id, metric, current_value, threshold, severity, message)
            VALUES (v_alert_cfg.id, v_alert_cfg.metric, v_current_value, v_alert_cfg.threshold, v_alert_cfg.severity, v_alert_row->>'message')
            ON CONFLICT DO NOTHING;
        END IF;
    END LOOP;
    
    RETURN jsonb_build_object('alerts', v_alerts_fired, 'alerts_count', jsonb_array_length(v_alerts_fired),
        'checked_at', NOW(), 'metrics_snapshot', jsonb_build_object('revenue_today', v_revenue_today,
        'orders_today', v_orders_today, 'orders_hour', ROUND(v_orders_hour, 1), 'pace_pct', ROUND(v_pace_pct, 1),
        'meta_spend', ROUND(v_meta_spend, 2)));
END;
$$;

COMMIT;

-- Migration 005: Analytics Views
-- ============================================================
BEGIN;

CREATE OR REPLACE VIEW public.daily_sales_summary AS
SELECT order_created_at::DATE AS sale_date, COUNT(*) AS total_orders,
    COUNT(*) FILTER (WHERE payment_status = 'paid') AS paid_orders,
    COUNT(*) FILTER (WHERE payment_status != 'paid') AS unpaid_orders,
    SUM(total) AS gross_revenue, SUM(total) FILTER (WHERE payment_status = 'paid') AS paid_revenue,
    SUM(shipping_cost_owner) AS shipping_costs,
    AVG(total) FILTER (WHERE payment_status = 'paid') AS avg_order_value
FROM public.orders_cache GROUP BY order_created_at::DATE ORDER BY sale_date DESC;

CREATE OR REPLACE VIEW public.utm_performance_summary AS
SELECT COALESCE(utm_source, '(direct)') AS source, COALESCE(utm_medium, '(none)') AS medium,
    COALESCE(utm_campaign, '(not set)') AS campaign, COUNT(*) AS sessions,
    COUNT(*) FILTER (WHERE payment_status = 'paid') AS conversions,
    SUM(total) FILTER (WHERE payment_status = 'paid') AS revenue,
    ROUND(COUNT(*) FILTER (WHERE payment_status = 'paid')::NUMERIC / NULLIF(COUNT(*), 0) * 100, 2) AS conversion_rate_pct,
    AVG(total) FILTER (WHERE payment_status = 'paid') AS avg_order_value
FROM public.orders_cache GROUP BY utm_source, utm_medium, utm_campaign ORDER BY revenue DESC NULLS LAST;

CREATE OR REPLACE VIEW public.customer_ltv_summary AS
SELECT billing_name, contact_phone, COUNT(*) FILTER (WHERE payment_status = 'paid') AS order_count,
    SUM(total) FILTER (WHERE payment_status = 'paid') AS lifetime_revenue,
    AVG(total) FILTER (WHERE payment_status = 'paid') AS avg_order_value,
    MIN(order_created_at) AS first_order_at, MAX(order_created_at) AS last_order_at
FROM public.orders_cache WHERE billing_name IS NOT NULL AND payment_status = 'paid'
GROUP BY billing_name, contact_phone HAVING COUNT(*) >= 2 ORDER BY lifetime_revenue DESC;

CREATE OR REPLACE VIEW public.hourly_order_velocity AS
SELECT DATE_TRUNC('hour', order_created_at AT TIME ZONE 'America/Sao_Paulo') AS hour_br,
    COUNT(*) FILTER (WHERE payment_status = 'paid') AS paid_orders,
    SUM(total) FILTER (WHERE payment_status = 'paid') AS revenue
FROM public.orders_cache WHERE order_created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE_TRUNC('hour', order_created_at AT TIME ZONE 'America/Sao_Paulo') ORDER BY hour_br DESC;

COMMIT;

-- SEED: Default Alert Rules
-- ============================================================
INSERT INTO public.alerts_config (name, metric, condition, threshold, severity, enabled, message_template)
VALUES
    ('Ritmo abaixo do alvo', 'pace_pct', 'less_than', 70, 'warning', TRUE, 'Ritmo de vendas em {value}% do alvo'),
    ('Ritmo crítico', 'pace_pct', 'less_than', 40, 'critical', TRUE, 'CRÍTICO: Ritmo em {value}%'),
    ('ROAS muito baixo', 'roas', 'less_than', 2.0, 'warning', TRUE, 'ROAS em {value}x'),
    ('ROAS crítico', 'roas', 'less_than', 1.0, 'critical', TRUE, 'CRÍTICO: ROAS em {value}x'),
    ('CPA muito alto', 'cpa', 'greater_than', 50.0, 'warning', TRUE, 'CPA em R${value}'),
    ('Nenhum pedido na hora', 'orders_hour', 'less_than', 0.5, 'info', TRUE, 'Menos de 1 pedido/hora'),
    ('Gasto Meta alto', 'spend_today', 'greater_than', 200, 'warning', TRUE, 'Gasto Meta: USD {value}')
ON CONFLICT DO NOTHING;

-- ============================================================
-- ALL MIGRATIONS COMPLETED!
-- ============================================================
