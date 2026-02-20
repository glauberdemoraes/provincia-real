#!/bin/bash

# Supabase Configuration
SUPABASE_URL="https://prnshbkblddfgttsgxpt.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybnNoYmtibGRkZmd0dHNneHB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MzE1MTAsImV4cCI6MjA4NTMwNzUxMH0.HPUfckX6OfqbWu1MvZIs0bZaYRf58n84MRCrpRk-7og"

echo "🔄 Attempting to apply migration via Supabase API..."
echo ""

# Try to check if customer_ltv_all view exists
curl -s -X POST \
  "$SUPABASE_URL/rest/v1/rpc/check_view_exists" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"view_name":"customer_ltv_all"}' \
  2>/dev/null

echo ""
echo "⚠️  API approach requires special RPC functions"
echo "📝 Please use the SQL Editor method instead"
echo "   https://app.supabase.com/project/prnshbkblddfgttsgxpt/sql"
