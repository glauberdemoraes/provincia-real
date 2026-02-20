#!/bin/bash

set -e

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  Applying Supabase Migration: customer_ltv_all + RPC          ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Configuration
SUPABASE_HOST="prnshbkblddfgttsgxpt.supabase.co"
SUPABASE_USER="postgres"
SUPABASE_DB="postgres"
SUPABASE_PORT="5432"
MIGRATION_FILE="MIGRATION_NEEDED.sql"

# Check if migration file exists
if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Migration file not found: $MIGRATION_FILE"
    exit 1
fi

echo "📋 Migration Details:"
echo "   • Database: $SUPABASE_HOST"
echo "   • SQL File: $MIGRATION_FILE"
echo ""

# Try using environment variable password first
if [ -z "$SUPABASE_PASSWORD" ]; then
    echo "🔑 Password Required"
    echo ""
    echo "To get your Supabase database password:"
    echo "  1. Go: https://app.supabase.com/project/prnshbkblddfgttsgxpt/settings/database"
    echo "  2. Scroll to 'Database Password' section"
    echo "  3. Copy the password (or reset if you don't have it)"
    echo ""
    read -sp "Enter Supabase database password: " SUPABASE_PASSWORD
    echo ""
fi

# Test connection
echo "🔄 Testing database connection..."
export PGPASSWORD="$SUPABASE_PASSWORD"

if ! timeout 5 psql -h "$SUPABASE_HOST" \
                     -U "$SUPABASE_USER" \
                     -d "$SUPABASE_DB" \
                     -p "$SUPABASE_PORT" \
                     -c "SELECT 1" > /dev/null 2>&1; then
    echo "❌ Connection failed"
    echo ""
    echo "⚠️  Check:"
    echo "  • Password is correct"
    echo "  • Database is accessible"
    echo "  • Network allows connection to Supabase"
    echo ""
    echo "Alternative: Apply migration manually"
    echo "  Open: https://app.supabase.com/project/prnshbkblddfgttsgxpt/sql"
    echo "  Copy-paste contents of: $MIGRATION_FILE"
    exit 1
fi

echo "✅ Connection successful"
echo ""

# Apply migration
echo "🚀 Applying migration..."
echo ""

if psql -h "$SUPABASE_HOST" \
        -U "$SUPABASE_USER" \
        -d "$SUPABASE_DB" \
        -p "$SUPABASE_PORT" \
        -f "$MIGRATION_FILE" \
        -v ON_ERROR_STOP=1; then
    echo ""
    echo "✅ Migration applied successfully!"
    echo ""
    echo "✨ New Supabase objects created:"
    echo "   • View: public.customer_ltv_all"
    echo "   • Function: public.initialize_retention_view()"
    echo ""
    echo "📊 Dashboard is now ready with all 25 KPIs!"
    echo ""
else
    echo ""
    echo "❌ Migration failed"
    echo ""
    echo "Try manual application:"
    echo "  https://app.supabase.com/project/prnshbkblddfgttsgxpt/sql"
    exit 1
fi

# Clear password from memory
unset PGPASSWORD
unset SUPABASE_PASSWORD
