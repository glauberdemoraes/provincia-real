#!/bin/bash

# Supabase Credentials
SUPABASE_HOST="prnshbkblddfgttsgxpt.supabase.co"
SUPABASE_USER="postgres"
SUPABASE_DB="postgres"
SUPABASE_PORT="5432"

# O token sbp_ é um Personal Access Token (Management API)
# Não pode ser usado diretamente como senha do PostgreSQL
# Precisamos de SERVICE_ROLE_KEY ou password do usuario postgres

echo "❌ Erro: Token pessoal (sbp_) não é compatível com psql"
echo ""
echo "✅ Soluções:"
echo ""
echo "1️⃣  OPÇÃO: Usar SERVICE_ROLE_KEY"
echo "   Você tem a SERVICE_ROLE_KEY do Supabase?"
echo "   (Encontra em: Dashboard > Project Settings > API)"
echo ""
echo "2️⃣  OPÇÃO: Usar senha do postgres"
echo "   psql -h $SUPABASE_HOST -U $SUPABASE_USER -d $SUPABASE_DB < migrations.sql"
echo ""
echo "3️⃣  OPÇÃO: Dashboard Manual"
echo "   https://app.supabase.com/project/prnshbkblddfgttsgxpt/sql"
echo ""

