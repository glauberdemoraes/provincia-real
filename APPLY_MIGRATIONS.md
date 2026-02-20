# 🚀 Como Aplicar Migrations no Supabase

## Procedimento Rápido (2 minutos)

### Passo 1: Acessar SQL Editor do Supabase
1. Vá para: https://app.supabase.com/project/{seu-project-id}/sql
2. Clique em "SQL Editor" (lado esquerdo)

### Passo 2: Copiar SQL Completo
Todo o SQL está em `/supabase/MIGRATIONS_COMBINED.sql`

**Contém:**
- ✅ Migration 001: Cache Tables (orders_cache, meta_campaigns_cache)
- ✅ Migration 002: Support Tables (alerts_config, active_alerts, sync_logs)
- ✅ Migration 003: Sync Functions (sync_orders_to_cache, extract_utm_param)
- ✅ Migration 004: Alert Functions (check_alerts)
- ✅ Migration 005: Analytics Views (daily_sales_summary, utm_performance_summary, etc)
- ✅ SEED: Default Alert Rules (7 alertas pré-configurados)

### Passo 3: Executar no SQL Editor
```sql
-- Cole TODO o conteúdo de MIGRATIONS_COMBINED.sql aqui
-- E clique em "Run" ou pressione Ctrl+Enter
```

## O que vai ser criado

**6 Tabelas:**
- `orders_cache` - Pedidos sincronizados (com utm_campaign extraído)
- `meta_campaigns_cache` - Campanhas Meta Ads
- `alerts_config` - Configuração de alertas
- `active_alerts` - Alertas ativos/disparados
- `sync_logs` - Log de sincronizações
- `exchange_rates` - Taxas de câmbio (opcional)

**3 RPC Functions:**
- `sync_orders_to_cache(start_date, end_date)` - Sincroniza pedidos
- `sync_meta_to_cache(start_date, end_date)` - Sincroniza campanhas
- `check_alerts()` - Valida alertas configurados

**4 Views SQL:**
- `daily_sales_summary` - Resumo diário de vendas
- `utm_performance_summary` - Performance por UTM
- `customer_ltv_summary` - Lifetime value de clientes
- `hourly_order_velocity` - Velocidade horária de pedidos

## Verificação Pós-Deploy

Após executar, teste:

```sql
-- 1. Verificar tabelas criadas
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- 2. Testar RPC
SELECT sync_orders_to_cache('2026-02-20'::DATE, '2026-02-21'::DATE);

-- 3. Verificar se tabela tem dados
SELECT COUNT(*) FROM orders_cache;

-- 4. Ver alertas configurados
SELECT name, metric, condition, threshold FROM alerts_config LIMIT 5;
```

## Se der erro

**Erro: "column result does not exist"**
- Significa que `fetch_nuvemshop_orders` ou `fetch_meta_campaigns` não existem
- **Solução**: Verificar se as migrations foram aplicadas completamente

**Erro: "permission denied"**
- RLS policies podem estar bloqueando acesso
- **Solução**: Verificar RLS policies na tabela

**Erro: "table already exists"**
- Normal se rodar 2x (usa CREATE TABLE IF NOT EXISTS)
- Não há problema, idempotente

## Próximo Passo
Após aplicar as migrations, o frontend poderá sincronizar dados via RPC!
