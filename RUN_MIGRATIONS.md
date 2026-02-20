# 🗄️ Executar Migrações Supabase

## Status: ⏳ Pendente de Execução Manual

As migrações SQL estão prontas em `supabase/MIGRATIONS_COMBINED.sql` (401 linhas).
Como não conseguimos executá-las via CLI (psql timeout), você precisará executa-las manualmente no Supabase Dashboard.

---

## 🚀 Como Executar (5 passos)

### Passo 1: Abrir SQL Editor do Supabase
1. Acesse: https://supabase.com/dashboard
2. Login com sua conta (se necessário)
3. Selecione o projeto: `prnshbkblddfgttsgxpt`
4. No menu esquerdo, clique em **"SQL Editor"**
5. Clique em **"New Query"** (botão azul)

### Passo 2: Copiar o arquivo SQL
```bash
# No seu terminal local:
cat provincia-real/supabase/MIGRATIONS_COMBINED.sql
```

Ou abra o arquivo em seu editor favorito:
```
/root/aios-workspace/provincia-real/supabase/MIGRATIONS_COMBINED.sql
```

**Copie TODO o conteúdo do arquivo.**

### Passo 3: Colar no Editor
1. No Supabase SQL Editor (aquela caixa branca)
2. Faça Ctrl+A para limpar qualquer query anterior
3. Faça Ctrl+V para colar o arquivo inteiro
4. Você verá ~401 linhas de SQL

### Passo 4: Executar
1. **Opção A (Recomendado)**: Pressione **Ctrl+Enter** (ou Cmd+Enter no Mac)
2. **Opção B**: Clique no botão **"Run"** (canto inferior direito)
3. **Opção C**: Clique no botão **"Run"** (topo, com ícone de play)

Aguarde 20-30 segundos para conclusão.

### Passo 5: Verificar Sucesso

Você deverá ver no console:
```
Query executed successfully (took 5.23s)
```

E no lado direito, aba **"Output"** deverá mostrar:
```
1 row affected
```

---

## ✅ Validação Pós-Execução

### Comando 1: Verificar que as tabelas foram criadas
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Esperado**: Você deve ver as novas tabelas:
- `orders_cache`
- `meta_campaigns_cache`
- `alerts_config`
- `active_alerts`
- `sync_logs`

### Comando 2: Testar a função de alertas
```sql
SELECT * FROM check_alerts();
```

**Esperado**: Deve retornar JSON como:
```json
{
  "alerts": [],
  "alerts_count": 0,
  "metrics_snapshot": {
    "pace_pct": 0,
    "orders_hour": 0,
    "revenue_today": 0,
    "spend_today": 0
  }
}
```

### Comando 3: Verificar default alerts foram criados
```sql
SELECT id, name, metric, condition, threshold
FROM alerts_config
ORDER BY id;
```

**Esperado**: Deve retornar 7 linhas:
1. Ritmo abaixo do alvo (pace_pct < 70)
2. Ritmo crítico (pace_pct < 40)
3. ROAS muito baixo (roas < 2.0)
4. ROAS crítico (roas < 1.0)
5. CPA muito alto (cpa > 50)
6. Nenhum pedido na hora (orders_hour < 0.5)
7. Gasto Meta alto (spend_today > 200)

---

## 🐛 Troubleshooting

### Erro: "Relation 'orders_cache' already exists"
**Causa**: Você já executou as migrações uma vez.
**Solução**: Tudo bem! Isso significa que as migrações já estão aplicadas. Continue para a seção de Validação.

### Erro: "syntax error at end of input"
**Causa**: Você colou o arquivo incompleto ou um pedaço dele.
**Solução**:
1. Limpe o editor (Ctrl+A, Delete)
2. Copie todo o arquivo novamente
3. Certifique-se que copiou tudo (faça Ctrl+C na última linha do arquivo)

### Erro: "permission denied for schema public"
**Causa**: Você está usando um role sem permissões corretas.
**Solução**:
1. Verifique que está no Supabase Dashboard (não em um cliente local)
2. Faça logout e login novamente

### Erro: "Column 'purchases' does not exist"
**Causa**: Erro na DDL do schema.
**Solução**: Envie a mensagem de erro completa para revisar.

---

## 📝 O que as migrações fazem?

### Migration 001: Cache Tables
- Cria `orders_cache` com 18 colunas (pedidos, UTM, frete, etc.)
- Cria `meta_campaigns_cache` com 9 colunas (campanhas, spend, impressões)
- Cria 5 índices para performance de queries

### Migration 002: Support Tables
- Cria `alerts_config` (regras de alertas)
- Cria `active_alerts` (alertas disparados)
- Cria `sync_logs` (histórico de sincronizações)
- Habilita Row Level Security (RLS)

### Migration 003: Sync Functions
- Cria `sync_orders_to_cache()` — puxa pedidos do NuvemShop
- Cria `sync_meta_to_cache()` — puxa campanhas do Meta Ads
- Ambas fazem UPSERT automático

### Migration 004: Alert Functions
- Cria `check_alerts()` — avalia todas as 7 regras
- Cria `extract_utm_param()` — parseia URLs para UTM

### Migration 005: Analytics Views
- Cria `daily_sales_summary` — vendas por dia
- Cria `utm_performance_summary` — conversões por canal
- Cria `customer_ltv_summary` — clientes recorrentes
- Cria `hourly_order_velocity` — pedidos por hora

### Seed: Default Alerts
- Insere 7 regras de alertas padrão para monitoramento

---

## ✨ Próximas Etapas

Após as migrações rodarem:

1. **Testar Dashboard**: Acesse https://provincia-real.vercel.app/dashboard
   - Deverá conectar ao Supabase
   - Status bar mostrará "DB: Connected"

2. **Testar Alertas**:
   - Acesse `/settings`
   - Deverá carregar as 7 regras padrão

3. **Sincronizar Dados**: (para depois)
   - Executar `sync_orders_to_cache()` para carregar pedidos
   - Executar `sync_meta_to_cache()` para carregar campanhas

4. **Integrar Dashboard**: (para depois)
   - Migrar código do App.tsx original
   - Conectar componentes aos dados do cache

---

## 📞 Precisa de Ajuda?

Se algo deu errado:
1. Copie a mensagem de erro
2. Verifique se é um dos erros do Troubleshooting acima
3. Se não, mande a mensagem de erro completa

---

**Arquivo SQL:** `provincia-real/supabase/MIGRATIONS_COMBINED.sql`
**Tamanho:** 401 linhas (20 KB)
**Tempo estimado:** 20-30 segundos
**Status:** ⏳ Aguardando execução manual
