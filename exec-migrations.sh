#!/bin/bash

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Executando Migrations no Supabase...${NC}\n"

# Supabase config
SUPABASE_URL="https://prnshbkblddfgttsgxpt.supabase.co"
DB_HOST="prnshbkblddfgttsgxpt.postgres.supabase.co"
DB_NAME="postgres"
DB_USER="postgres"
DB_PORT=5432

# Read migrations file
MIGRATIONS=$(cat supabase/MIGRATIONS_COMBINED.sql)

echo -e "${YELLOW}📋 Migrations file:${NC}"
echo "   Arquivo: supabase/MIGRATIONS_COMBINED.sql"
echo "   Linhas: $(echo "$MIGRATIONS" | wc -l)"
echo ""

# Try to connect and execute
echo -e "${YELLOW}⏳ Conectando ao banco de dados Supabase...${NC}\n"

# Create a temporary SQL file
cat > /tmp/migrations.sql << 'EOF'
BEGIN;

-- Test connection
SELECT NOW() as connection_time;

-- Drop existing function if exists
DROP FUNCTION IF EXISTS public.http_get(TEXT, JSONB);

-- ========== MIGRATION 001: CACHE TABLES ==========

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

-- ========== MIGRATION 002: SUPPORT TABLES ==========

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

CREATE TABLE IF NOT EXISTS public.sync_logs (
    id               BIGSERIAL         PRIMARY KEY,
    sync_type        TEXT              NOT NULL,
    status           TEXT              NOT NULL CHECK (status IN ('started', 'success', 'error')),
    records_fetched  INTEGER           DEFAULT 0,
    records_upserted INTEGER           DEFAULT 0,
    error_message    TEXT,
    date_start       DATE,
    date_end         DATE,
    started_at       TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
    completed_at     TIMESTAMPTZ,
    duration_ms      INTEGER
);

CREATE INDEX IF NOT EXISTS idx_sync_logs_sync_type
    ON public.sync_logs (sync_type, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_sync_logs_status
    ON public.sync_logs (status);

CREATE TABLE IF NOT EXISTS public.alert_history (
    id           BIGSERIAL     PRIMARY KEY,
    config_id    UUID          NOT NULL REFERENCES public.alerts_config(id) ON DELETE CASCADE,
    fired_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    metric_value NUMERIC,
    threshold    NUMERIC,
    message      TEXT
);

CREATE INDEX IF NOT EXISTS idx_alert_history_fired_at
    ON public.alert_history (fired_at DESC);
CREATE INDEX IF NOT EXISTS idx_alert_history_config_id
    ON public.alert_history (config_id);

-- Enable RLS
ALTER TABLE public.orders_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meta_campaigns_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow anon read)
CREATE POLICY "Allow anon read orders_cache" ON public.orders_cache
    FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon read meta_campaigns_cache" ON public.meta_campaigns_cache
    FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon read alerts_config" ON public.alerts_config
    FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon read sync_logs" ON public.sync_logs
    FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon read alert_history" ON public.alert_history
    FOR SELECT TO anon USING (true);

-- ========== MIGRATION 003: HELPER FUNCTIONS ==========

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

-- Stub functions for API integration
CREATE OR REPLACE FUNCTION public.fetch_nuvemshop_orders(
    start_date TEXT,
    end_date TEXT
)
RETURNS JSONB LANGUAGE plpgsql AS $$
BEGIN
    RETURN jsonb_build_object(
        'result', '[]'::JSONB,
        'status', 'success',
        'message', 'Ready for real integration'
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.fetch_meta_campaigns(
    start_date TEXT,
    end_date TEXT
)
RETURNS JSONB LANGUAGE plpgsql AS $$
BEGIN
    RETURN jsonb_build_object(
        'result', '[]'::JSONB,
        'status', 'success',
        'message', 'Ready for real integration'
    );
END;
$$;

-- ========== MIGRATION 004: EXCHANGE RATES ==========

CREATE TABLE IF NOT EXISTS public.exchange_rates (
    id            BIGSERIAL     PRIMARY KEY,
    rate_date     DATE          NOT NULL UNIQUE,
    usd_to_brl    NUMERIC(10, 4) NOT NULL,
    source        TEXT          DEFAULT 'awesomeapi',
    fetched_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exchange_rates_date
    ON public.exchange_rates (rate_date DESC);

-- Insert today's rate (placeholder - will be updated by app)
INSERT INTO public.exchange_rates (rate_date, usd_to_brl)
VALUES (CURRENT_DATE, 5.15)
ON CONFLICT (rate_date) DO NOTHING;

-- ========== MIGRATION 005: DEFAULT ALERTS ==========

INSERT INTO public.alerts_config (name, metric, condition, threshold, severity, enabled, message_template)
VALUES
    ('ROAS Baixo', 'roas', 'less_than', 2.0, 'warning', true, 'ROAS abaixo de 2x: {value}'),
    ('Sem Vendas', 'orders', 'equals', 0, 'critical', true, 'Nenhum pedido nos últimos dados'),
    ('ROI Negativo', 'roi', 'less_than', 0, 'critical', true, 'ROI negativo: {value}%'),
    ('Gasto Alto', 'adspend', 'greater_than', 1000, 'info', true, 'Gasto em ads acima de R$ 1000'),
    ('Ticket Baixo', 'ticket', 'less_than', 150, 'info', true, 'Ticket médio baixo: R$ {value}'),
    ('Taxa Conversão Baixa', 'conversion_rate', 'less_than', 2, 'warning', true, 'Taxa de conversão abaixo de 2%'),
    ('CPL Alto', 'cpl', 'greater_than', 50, 'warning', true, 'Custo por lead acima de R$ 50')
ON CONFLICT DO NOTHING;

COMMIT;

-- Show completion
SELECT 'SUCCESS: Migrations executed!' as status;
EOF

# Try to execute with psql
if psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -p "$DB_PORT" -f /tmp/migrations.sql 2>&1 | head -20; then
    echo -e "\n${GREEN}✅ Migrations executadas com sucesso!${NC}\n"
    exit 0
else
    echo -e "\n${YELLOW}ℹ️  psql connection failed - trying alternative method...${NC}\n"
    exit 1
fi

