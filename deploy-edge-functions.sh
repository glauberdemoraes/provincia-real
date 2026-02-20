#!/bin/bash

# Deploy Edge Functions to Supabase
# This script deploys the two edge functions for fetching real data

set -e

echo "🚀 Deploying Edge Functions to Supabase..."
echo ""

PROJECT_ID="prnshbkblddfgttsgxpt"
SUPABASE_URL="https://${PROJECT_ID}.supabase.co"
FUNCTIONS_DIR="./supabase/functions"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}📋 Edge Functions to deploy:${NC}"
echo "  1. fetch-nuvemshop-orders - NuvemShop Orders API"
echo "  2. fetch-meta-campaigns - Meta Ads Campaigns API"
echo ""

# Check if functions exist
if [ ! -f "${FUNCTIONS_DIR}/fetch-nuvemshop-orders/index.ts" ]; then
    echo -e "${YELLOW}❌ Error: fetch-nuvemshop-orders function not found${NC}"
    exit 1
fi

if [ ! -f "${FUNCTIONS_DIR}/fetch-meta-campaigns/index.ts" ]; then
    echo -e "${YELLOW}❌ Error: fetch-meta-campaigns function not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Both functions found${NC}"
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${YELLOW}⚠️  Supabase CLI not installed${NC}"
    echo ""
    echo -e "${BLUE}Install it with:${NC}"
    echo "  npm install -g supabase"
    echo ""
    echo -e "${BLUE}Then login with:${NC}"
    echo "  supabase login"
    echo ""
    echo -e "${BLUE}Then deploy with:${NC}"
    echo "  supabase functions deploy fetch-nuvemshop-orders --project-id ${PROJECT_ID}"
    echo "  supabase functions deploy fetch-meta-campaigns --project-id ${PROJECT_ID}"
    exit 1
fi

echo -e "${BLUE}📦 Deploying functions...${NC}"
echo ""

# Deploy functions
supabase functions deploy fetch-nuvemshop-orders --project-id "${PROJECT_ID}"
echo ""
supabase functions deploy fetch-meta-campaigns --project-id "${PROJECT_ID}"
echo ""

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo -e "${BLUE}🔍 Verify deployment at:${NC}"
echo "  https://supabase.com/dashboard/project/${PROJECT_ID}/functions"
echo ""
echo -e "${BLUE}🧪 Test the functions:${NC}"
echo "  curl -X POST ${SUPABASE_URL}/functions/v1/fetch-nuvemshop-orders \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"start_date\":\"2026-02-20\",\"end_date\":\"2026-02-20\"}'"
echo ""
