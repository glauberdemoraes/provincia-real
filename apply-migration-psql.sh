#!/bin/bash

# Supabase Connection Details
SUPABASE_HOST="prnshbkblddfgttsgxpt.supabase.co"
SUPABASE_USER="postgres"
SUPABASE_DB="postgres"
SUPABASE_PORT="5432"

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "❌ psql not found. Please install PostgreSQL client:"
    echo "   macOS: brew install postgresql"
    echo "   Ubuntu/Debian: sudo apt-get install postgresql-client"
    echo "   Windows: Download from https://www.postgresql.org/download/windows/"
    exit 1
fi

# Check if password is provided
if [ -z "$SUPABASE_PASSWORD" ]; then
    echo ""
    echo "🔑 Supabase Password Required"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "To get your password:"
    echo "1. Go to: https://app.supabase.com/project/prnshbkblddfgttsgxpt/settings/database"
    echo "2. Look for 'Database password' section"
    echo "3. Copy the password (or reset it if you don't have it)"
    echo ""
    echo "Then run:"
    echo "   export SUPABASE_PASSWORD='your-password-here'"
    echo "   bash apply-migration-psql.sh"
    echo ""
    exit 1
fi

echo "🔄 Applying migration to Supabase..."
echo ""

# Create the SQL file
cat > /tmp/migration.sql << 'EOF'
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
EOF

# Apply migration
export PGPASSWORD="$SUPABASE_PASSWORD"

psql -h "$SUPABASE_HOST" \
     -U "$SUPABASE_USER" \
     -d "$SUPABASE_DB" \
     -p "$SUPABASE_PORT" \
     -f /tmp/migration.sql \
     -v ON_ERROR_STOP=1

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration applied successfully!"
    echo "📊 View created: customer_ltv_all"
    echo ""
    rm -f /tmp/migration.sql
else
    echo ""
    echo "❌ Migration failed!"
    echo "📝 Check your password and try again"
    rm -f /tmp/migration.sql
    exit 1
fi
