# 🚀 EXECUTE AS MIGRAÇÕES AGORA

## Status
- ✅ App está pronto em `https://provincia-real.vercel.app`
- ✅ Arquivo SQL está pronto: `supabase/MIGRATIONS_COMBINED.sql`
- ⏳ **PRÓXIMA AÇÃO: Você executa SQL no Supabase Dashboard**

---

## ⚡ 3 MINUTOS PARA TERMINAR

### Passo 1: Abra o SQL Editor

Acesse **AGORA**:
```
https://supabase.com/dashboard/project/prnshbkblddfgttsgxpt/sql/new
```

**OU:**
1. Vá para: https://supabase.com
2. Login se necessário
3. Selecione projeto: `prnshbkblddfgttsgxpt`
4. Menu esquerdo → **"SQL Editor"**
5. Clique **"New Query"** (botão azul)

### Passo 2: Copie o Arquivo SQL

Copie **TODO** este arquivo:

```
/root/aios-workspace/provincia-real/supabase/MIGRATIONS_COMBINED.sql
```

**Tamanho:** 20 KB, 401 linhas

**Inicie com:**
```sql
-- Província Real: COMBINED MIGRATIONS
-- Copy-paste this entire file into Supabase SQL Editor and run
```

**Termine com:**
```sql
ON CONFLICT DO NOTHING;

-- ============================================================
-- ALL MIGRATIONS COMPLETED!
-- ============================================================
```

### Passo 3: Cole no Editor

No Supabase SQL Editor (aquela caixa branca grande):
1. Pressione **Ctrl+A** para limpar
2. Pressione **Ctrl+V** para colar

Você verá ~401 linhas de SQL

### Passo 4: Clique RUN

**OPÇÃO A (Recomendado):**
- Pressione **Ctrl+Enter** (ou **Cmd+Enter** no Mac)

**OPÇÃO B:**
- Clique no botão **"Run"** no canto inferior direito

**OPÇÃO C:**
- Clique no botão ▶️ (play) no topo

### Passo 5: Aguarde

Espere até ver:
```
Query executed successfully (took X.XXs)
```

Deve levar **20-40 segundos**

---

## ✅ Confirmar Sucesso

### Validação 1 (Rápido): No SQL Editor

Rode este comando:

```sql
SELECT COUNT(*) FROM alerts_config;
```

Esperado: **7** (7 regras de alertas padrão)

### Validação 2 (Automática): No Terminal

```bash
cd provincia-real
npx ts-node validate-migrations.ts
```

Esperado: **9 PASS** (todas as validações passam)

---

## 🎯 Depois de Executar

Seu banco estará pronto com:

✅ **2 tabelas de cache**
- orders_cache (pedidos do NuvemShop)
- meta_campaigns_cache (campanhas do Meta)

✅ **3 tabelas de suporte**
- alerts_config (7 regras padrão)
- active_alerts (alertas disparados)
- sync_logs (histórico de sincronizações)

✅ **4 funções SQL**
- sync_orders_to_cache()
- sync_meta_to_cache()
- check_alerts()
- extract_utm_param()

✅ **4 views analytics**
- daily_sales_summary
- utm_performance_summary
- customer_ltv_summary
- hourly_order_velocity

✅ **7 alertas configurados**
1. Ritmo abaixo do alvo (< 70%)
2. Ritmo crítico (< 40%)
3. ROAS muito baixo (< 2.0x)
4. ROAS crítico (< 1.0x)
5. CPA muito alto (> R$ 50)
6. Nenhum pedido/hora (< 0.5/hr)
7. Gasto Meta alto (> USD 200)

---

## 🐛 Se der erro

### Erro: "Relation 'orders_cache' already exists"

✅ **OK!** Significa que as migrações já foram aplicadas.
- Continue para "Validação 1"

### Erro: "syntax error at end of input"

❌ Você colou apenas parte do arquivo.
- Limpe o editor (Ctrl+A, Delete)
- Copie **TODO** o arquivo novamente
- Cole e rode

### Erro: "permission denied"

❌ Você não tem permissão neste banco.
- Verifique que está no Supabase Dashboard (não em cliente local)
- Faça logout e login novamente

### Erro: "timeout"

❌ A query demorou muito.
- Clique **Stop** se disponível
- Tente novamente
- Se persistir, avise

---

## ⏱️ Timeline

```
Agora        → Cole SQL
+30 segs     → "Query executed successfully"
+1 min       → Valide com npx ts-node validate-migrations.ts
+2 mins      → App totalmente pronto!
```

---

## 📞 Precisa de Ajuda?

Mensagens comuns:

| Situação | Solução |
|----------|---------|
| Arquivo SQL muito grande | Copie em 2 partes (split no meio) |
| Browser trava | Use incógnito + Force Refresh (Ctrl+Shift+R) |
| "No API key found" | Certifique-se que está no Supabase Dashboard |
| Não consegue logar | Resete a senha em https://supabase.com |

---

## 🎬 AGORA MESMO

### Copie isto:

```
https://supabase.com/dashboard/project/prnshbkblddfgttsgxpt/sql/new
```

### Cole na barra do navegador e pressione Enter

### Pronto! Você está no SQL Editor

---

**Estimativa:** 3 minutos para terminar ⏱️

**Status:** ⏳ Aguardando sua ação

**Arquivo SQL:** `/root/aios-workspace/provincia-real/supabase/MIGRATIONS_COMBINED.sql`
