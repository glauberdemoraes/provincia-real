-- =============================================================
-- Província Real: Analytics Views
-- Views for history, reporting, and realtime data
-- =============================================================

BEGIN;

-- Daily sales summary
CREATE OR REPLACE VIEW public.daily_sales_summary AS
SELECT
    order_created_at::DATE AS sale_date,
    COUNT(*) AS total_orders,
    COUNT(*) FILTER (WHERE payment_status = 'paid') AS paid_orders,
    COUNT(*) FILTER (WHERE payment_status != 'paid') AS unpaid_orders,
    SUM(total) AS gross_revenue,
    SUM(total) FILTER (WHERE payment_status = 'paid') AS paid_revenue,
    SUM(shipping_cost_owner) AS shipping_costs,
    AVG(total) FILTER (WHERE payment_status = 'paid') AS avg_order_value
FROM public.orders_cache
GROUP BY order_created_at::DATE
ORDER BY sale_date DESC;

-- UTM performance
CREATE OR REPLACE VIEW public.utm_performance_summary AS
SELECT
    COALESCE(utm_source, '(direct)') AS source,
    COALESCE(utm_medium, '(none)') AS medium,
    COALESCE(utm_campaign, '(not set)') AS campaign,
    COUNT(*) AS sessions,
    COUNT(*) FILTER (WHERE payment_status = 'paid') AS conversions,
    SUM(total) FILTER (WHERE payment_status = 'paid') AS revenue,
    ROUND(COUNT(*) FILTER (WHERE payment_status = 'paid')::NUMERIC / NULLIF(COUNT(*), 0) * 100, 2) AS conversion_rate_pct,
    AVG(total) FILTER (WHERE payment_status = 'paid') AS avg_order_value
FROM public.orders_cache
GROUP BY utm_source, utm_medium, utm_campaign
ORDER BY revenue DESC NULLS LAST;

-- Customer LTV
CREATE OR REPLACE VIEW public.customer_ltv_summary AS
SELECT
    billing_name,
    contact_phone,
    COUNT(*) FILTER (WHERE payment_status = 'paid') AS order_count,
    SUM(total) FILTER (WHERE payment_status = 'paid') AS lifetime_revenue,
    AVG(total) FILTER (WHERE payment_status = 'paid') AS avg_order_value,
    MIN(order_created_at) AS first_order_at,
    MAX(order_created_at) AS last_order_at
FROM public.orders_cache
WHERE billing_name IS NOT NULL AND payment_status = 'paid'
GROUP BY billing_name, contact_phone
HAVING COUNT(*) >= 2
ORDER BY lifetime_revenue DESC;

-- Hourly velocity
CREATE OR REPLACE VIEW public.hourly_order_velocity AS
SELECT
    DATE_TRUNC('hour', order_created_at AT TIME ZONE 'America/Sao_Paulo') AS hour_br,
    COUNT(*) FILTER (WHERE payment_status = 'paid') AS paid_orders,
    SUM(total) FILTER (WHERE payment_status = 'paid') AS revenue
FROM public.orders_cache
WHERE order_created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE_TRUNC('hour', order_created_at AT TIME ZONE 'America/Sao_Paulo')
ORDER BY hour_br DESC;

COMMIT;
