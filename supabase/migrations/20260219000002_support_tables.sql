-- =============================================================
-- Província Real: Support Tables (Alerts, Sync Logs, RLS)
-- =============================================================

BEGIN;

-- alerts_config: User-defined alert rules
CREATE TABLE IF NOT EXISTS public.alerts_config (
    id              UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT              NOT NULL,
    metric          TEXT              NOT NULL,
    condition       TEXT              NOT NULL,
    threshold       NUMERIC           NOT NULL,
    severity        TEXT              NOT NULL
                    CHECK (severity IN ('info', 'warning', 'critical')),
    enabled         BOOLEAN           NOT NULL DEFAULT TRUE,
    message_template TEXT,
    created_at      TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_alerts_config_updated_at
    BEFORE UPDATE ON public.alerts_config
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- active_alerts: Currently firing alerts
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

-- sync_logs: Track synchronizations
CREATE TABLE IF NOT EXISTS public.sync_logs (
    id              BIGSERIAL         PRIMARY KEY,
    sync_type       TEXT              NOT NULL
                    CHECK (sync_type IN ('orders', 'meta_campaigns')),
    status          TEXT              NOT NULL
                    CHECK (status IN ('started', 'success', 'error')),
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

-- Enable RLS
ALTER TABLE public.orders_cache          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meta_campaigns_cache  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts_config         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.active_alerts         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_logs             ENABLE ROW LEVEL SECURITY;

-- Read policies for anon (frontend)
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
