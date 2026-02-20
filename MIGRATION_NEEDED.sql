-- Run this in Supabase SQL Editor:
-- https://app.supabase.com/project/prnshbkblddfgttsgxpt/sql

BEGIN;

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

COMMIT;
