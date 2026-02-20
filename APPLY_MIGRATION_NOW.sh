#!/bin/bash

# Simple script to help apply the Supabase migration

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  🚀 Apply Supabase Migration — 3 Simple Steps                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

echo "📋 THE SQL YOU NEED TO RUN:"
echo ""
echo "┌────────────────────────────────────────────────────────────────┐"

cat MIGRATION_NEEDED.sql | sed 's/^/│ /'

echo "│                                                                │"
echo "└────────────────────────────────────────────────────────────────┘"
echo ""

echo "✨ THREE WAYS TO APPLY:"
echo ""

echo "1️⃣  WEB UI (EASIEST - 30 seconds)"
echo "   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   a) Go to: https://app.supabase.com/project/prnshbkblddfgttsgxpt/sql"
echo "   b) Click \"New Query\""
echo "   c) Copy the SQL above and paste it"
echo "   d) Click \"RUN\""
echo "   e) ✅ Done!"
echo ""

echo "2️⃣  COPY TO FILE (for later)"
echo "   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   The SQL is already in: MIGRATION_NEEDED.sql"
echo ""

echo "3️⃣  COMMAND LINE"
echo "   ━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   \$ bash apply-final-migration.sh"
echo "   Then enter your Supabase database password"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "After applying the migration:"
echo "  ✅ View will be created: customer_ltv_all"
echo "  ✅ RPC will be registered: initialize_retention_view()"
echo "  ✅ Dashboard will show all 25 KPIs"
echo ""

echo "App Status:"
echo "  📱 Frontend: https://provincia-real.vercel.app (deploying)"
echo "  🗄️  Database: Waiting for migration"
echo "  ✅ Ready when both complete"
echo ""

