#!/bin/bash

# Apply migration using Vercel Edge Functions as intermediary
# This allows execution of SQL via the deployed app

echo "🔄 Attempting to apply migration via Vercel Edge Function..."
echo ""

MIGRATION_SQL=$(cat MIGRATION_NEEDED.sql | jq -Rs .)

curl -X POST \
  "https://provincia-real.vercel.app/api/migrate" \
  -H "Content-Type: application/json" \
  -d "{\"sql\": $MIGRATION_SQL}" \
  2>/dev/null

echo ""
echo "If the above response shows success, migration was applied!"
echo "If not, use the manual Web UI method instead."
