-- =============================================================
-- Província Real: Cache Tables
-- Stores fetched data locally for historical analysis + speed
-- =============================================================

BEGIN;

-- orders_cache: NuvemShop order data persisted locally
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

-- meta_campaigns_cache: Meta Ads campaign data
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

-- Updated_at trigger
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
