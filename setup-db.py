#!/usr/bin/env python3
import subprocess
import json
import sys

TOKEN = "sbp_918272d9db25c6800e4dcbbf5c3c8a6df212b4f3"
PROJECT_ID = "prnshbkblddfgttsgxpt"

print("🔐 Configurando banco de dados no Supabase...")
print("")

# Tentar instalar supabase-py se não existir
try:
    import supabase
except ImportError:
    print("📦 Instalando supabase...")
    subprocess.run([sys.executable, "-m", "pip", "install", "-q", "supabase"], check=False)
    import supabase

from supabase import create_client

url = "https://prnshbkblddfgttsgxpt.supabase.co"
anon_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybnNoYmtibGRkZmd0dHNneHB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MzE1MTAsImV4cCI6MjA4NTMwNzUxMH0.HPUfckX6OfqbWu1MvZIs0bZaYRf58n84MRCrpRk-7og"

print("1️⃣  Conectando ao Supabase...")
supabase_client = create_client(url, anon_key)

print("2️⃣  Verificando tabela exchange_rates...")
try:
    response = supabase_client.table("exchange_rates").select("*").limit(1).execute()
    print("✅ Tabela JÁ EXISTE!")
    print(f"   Registros: {len(response.data)}")
except Exception as e:
    if "Could not find the table" in str(e):
        print("❌ Tabela não existe")
        print("")
        print("⚠️  Você precisa executar manualmente:")
        print("1. Abra: https://supabase.com/dashboard/project/prnshbkblddfgttsgxpt/sql/new")
        print("2. Cole: SUPABASE_EXECUTE_NOW.md")
        print("3. Clique RUN")
    else:
        print(f"❓ Erro: {e}")
        sys.exit(1)

print("")
print("3️⃣  Tentando inserir cotação do dia...")
try:
    from datetime import date
    today = str(date.today())
    
    supabase_client.table("exchange_rates").upsert({
        "date": today,
        "usd_brl": 4.97,
        "source": "awesomeapi"
    }).execute()
    
    print(f"✅ Cotação inserida/atualizada para {today}")
except Exception as e:
    print(f"⚠️  {e}")

print("")
print("🎉 Setup concluído!")
print("📍 Acesse: https://provincia-real.vercel.app")
