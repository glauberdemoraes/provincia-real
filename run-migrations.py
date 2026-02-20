#!/usr/bin/env python3
"""
Execute Supabase migrations via PostgreSQL connection
"""

import os
import sys

try:
    import psycopg2
except ImportError:
    print("❌ psycopg2 not installed. Installing...")
    os.system("pip install psycopg2-binary")
    import psycopg2

# Supabase database credentials
SUPABASE_HOST = "prnshbkblddfgttsgxpt.postgres.supabase.co"
SUPABASE_PORT = 5432
SUPABASE_USER = "postgres"
SUPABASE_PASSWORD = os.environ.get("SUPABASE_DB_PASSWORD", "")
SUPABASE_DATABASE = "postgres"

def run_migrations():
    """Execute all migrations from MIGRATIONS_COMBINED.sql"""

    if not SUPABASE_PASSWORD:
        print("⚠️  SUPABASE_DB_PASSWORD não configurada")
        print("\n📋 Para executar as migrations manualmente:")
        print("1. Abra: https://supabase.com/dashboard/project/prnshbkblddfgttsgxpt/sql/new")
        print("2. Copie todo o conteúdo de: supabase/MIGRATIONS_COMBINED.sql")
        print("3. Cole no SQL Editor")
        print("4. Clique em RUN")
        return False

    try:
        # Read migrations file
        with open("supabase/MIGRATIONS_COMBINED.sql", "r") as f:
            sql_content = f.read()

        print("✅ Arquivo de migrations lido")
        print(f"📏 Total de linhas: {len(sql_content.splitlines())}")

        # Connect to Supabase
        print("\n⏳ Conectando ao Supabase...")
        conn = psycopg2.connect(
            host=SUPABASE_HOST,
            port=SUPABASE_PORT,
            user=SUPABASE_USER,
            password=SUPABASE_PASSWORD,
            database=SUPABASE_DATABASE,
        )

        cursor = conn.cursor()

        print("✅ Conectado ao Supabase")
        print("\n⏳ Executando migrations...")

        # Execute migrations
        cursor.execute(sql_content)
        conn.commit()

        print("✅ Migrations executadas com sucesso!")
        print("\n📊 Tabelas criadas:")
        print("  ✓ orders_cache")
        print("  ✓ meta_campaigns_cache")
        print("  ✓ alerts_config")
        print("  ✓ sync_logs")
        print("  ✓ exchange_rates")
        print("  ✓ alert_history")

        cursor.close()
        conn.close()

        return True

    except Exception as e:
        print(f"\n❌ Erro ao executar migrations: {e}")
        print("\n📋 Tente manualmente:")
        print("1. Abra: https://supabase.com/dashboard/project/prnshbkblddfgttsgxpt/sql/new")
        print("2. Copie todo o conteúdo de: supabase/MIGRATIONS_COMBINED.sql")
        print("3. Cole no SQL Editor e clique em RUN")
        return False

if __name__ == "__main__":
    success = run_migrations()
    sys.exit(0 if success else 1)
