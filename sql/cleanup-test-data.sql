-- Cleanup Script: Remove test data from orders_cache
-- Safe to run - only removes IDs 1001-1002 which are test entries
-- Created: 2026-02-24

-- Remove test orders
DELETE FROM public.orders_cache
WHERE id IN (1001, 1002);

-- Verify cleanup
SELECT
    COUNT(*) as total_orders,
    COUNT(*) FILTER (WHERE id < 1000) as real_orders,
    COUNT(*) FILTER (WHERE id >= 1000) as test_orders
FROM public.orders_cache;

-- Expected output:
-- total_orders: 200, real_orders: 200, test_orders: 0
