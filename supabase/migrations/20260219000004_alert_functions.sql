-- =============================================================
-- Província Real: Alert Functions
-- check_alerts() + utilities
-- =============================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.check_alerts()
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_today           DATE := CURRENT_DATE;
    v_hour            INTEGER := EXTRACT(HOUR FROM NOW());
    v_elapsed_minutes INTEGER := (v_hour * 60) + EXTRACT(MINUTE FROM NOW())::INTEGER;
    v_revenue_today   NUMERIC;
    v_orders_today    INTEGER;
    v_orders_hour     NUMERIC;
    v_daily_target    NUMERIC := 5000.00;
    v_pace_pct        NUMERIC;
    v_meta_spend      NUMERIC;
    v_alert_cfg       RECORD;
    v_current_value   NUMERIC;
    v_fires           BOOLEAN;
    v_alerts_fired    JSONB := '[]'::JSONB;
    v_alert_row       JSONB;
BEGIN
    -- Calculate metrics
    SELECT
        COALESCE(SUM(total), 0),
        COUNT(*)
    INTO v_revenue_today, v_orders_today
    FROM public.orders_cache
    WHERE payment_status = 'paid'
      AND order_created_at::DATE = v_today;

    v_orders_hour := CASE
        WHEN v_elapsed_minutes > 0 THEN (v_orders_today::NUMERIC / v_elapsed_minutes) * 60
        ELSE 0
    END;

    v_pace_pct := CASE
        WHEN v_elapsed_minutes > 0 AND v_daily_target > 0
        THEN (v_revenue_today / (v_daily_target * v_elapsed_minutes / 1440.0)) * 100
        ELSE 100
    END;

    SELECT COALESCE(SUM(spend), 0)
    INTO v_meta_spend
    FROM public.meta_campaigns_cache
    WHERE date_start = v_today;

    -- Evaluate alert rules
    FOR v_alert_cfg IN SELECT * FROM public.alerts_config WHERE enabled = TRUE LOOP
        v_current_value := CASE v_alert_cfg.metric
            WHEN 'pace_pct'        THEN v_pace_pct
            WHEN 'orders_hour'     THEN v_orders_hour
            WHEN 'revenue_today'   THEN v_revenue_today
            WHEN 'spend_today'     THEN v_meta_spend
            ELSE NULL
        END;

        IF v_current_value IS NULL THEN CONTINUE; END IF;

        v_fires := CASE v_alert_cfg.condition
            WHEN 'less_than'    THEN v_current_value < v_alert_cfg.threshold
            WHEN 'greater_than' THEN v_current_value > v_alert_cfg.threshold
            WHEN 'equals'       THEN v_current_value = v_alert_cfg.threshold
            ELSE FALSE
        END;

        IF v_fires THEN
            v_alert_row := jsonb_build_object(
                'config_id',     v_alert_cfg.id,
                'name',          v_alert_cfg.name,
                'metric',        v_alert_cfg.metric,
                'current_value', ROUND(v_current_value, 2),
                'threshold',     v_alert_cfg.threshold,
                'severity',      v_alert_cfg.severity,
                'message',       COALESCE(v_alert_cfg.message_template, v_alert_cfg.name),
                'fired_at',      NOW()
            );

            v_alerts_fired := v_alerts_fired || jsonb_build_array(v_alert_row);

            INSERT INTO public.active_alerts (config_id, metric, current_value, threshold, severity, message)
            VALUES (v_alert_cfg.id, v_alert_cfg.metric, v_current_value, v_alert_cfg.threshold, v_alert_cfg.severity, v_alert_row->>'message')
            ON CONFLICT DO NOTHING;
        END IF;
    END LOOP;

    RETURN jsonb_build_object(
        'alerts',         v_alerts_fired,
        'alerts_count',   jsonb_array_length(v_alerts_fired),
        'checked_at',     NOW(),
        'metrics_snapshot', jsonb_build_object(
            'revenue_today',   v_revenue_today,
            'orders_today',    v_orders_today,
            'orders_hour',     ROUND(v_orders_hour, 1),
            'pace_pct',        ROUND(v_pace_pct, 1),
            'meta_spend',      ROUND(v_meta_spend, 2)
        )
    );
END;
$$;

COMMIT;
