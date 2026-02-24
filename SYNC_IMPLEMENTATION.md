# 🔄 Sincronização Automática - Guia de Implementação

## 📋 Resumo das Mudanças

Implementação completa de sincronização automática Nuvem Shop → Supabase em 3 pontos:

1. ✅ **Cron Backend (30 minutos)** - Edge Function + pg_cron
2. ✅ **Page Load Sync** - Hook obrigatório ao montar
3. ✅ **Manual Sync** - Botão "Sincronizar" (já existia, agora reforçado)

---

## 🚀 Deployar

### Passo 1: Deploy da Edge Function

```bash
cd /root/aios-workspace/provincia-real

# Deploy a nova Edge Function
supabase functions deploy sync-nuvemshop-meta --project-ref=prnshbkblddfgttsgxpt
```

**Verificar se foi deployado:**
```bash
supabase functions list --project-ref=prnshbkblddfgttsgxpt
```

Deve aparecer: `sync-nuvemshop-meta`

### Passo 2: Aplicar Migration (habilitar pg_cron)

```bash
# Aplicar migration para habilitar pg_cron
supabase db push --project-ref=prnshbkblddfgttsgxpt
```

Ou, se preferir executar direto no banco (SQL):
```bash
supabase db execute --file=supabase/migrations/20260224000001_enable_pg_cron.sql --project-ref=prnshbkblddfgttsgxpt
```

### Passo 3: Verificar Cron

No dashboard Supabase:
1. Ir para **SQL Editor**
2. Executar:
```sql
SELECT * FROM cron.job;
```

Deve estar listado: `sync-nuvemshop-meta-every-30min`

---

## 📝 Como Funciona

### **Trigger 1: Page Load/Reload**

Quando usuário abre ou recarrega a página:

```typescript
// src/hooks/useRealtimeSync.ts → useMountSync()
// Executado automaticamente ao montar Dashboard

useEffect(() => {
  // Força sincronização completa ao carregar
  await performFullSync(dateRange)
  // Depois atualiza UI
  onUpdate()
}, []) // Executa uma vez ao montar
```

**Log esperado:**
```
🚀 Performing mandatory mount sync...
📦 Fetching Nuvem Shop orders...
✅ Retrieved XXX orders
💾 Saving orders to Supabase...
✅ Sincronização concluída
```

### **Trigger 2: Cron a cada 30 minutos**

Automático no servidor:

```sql
-- pg_cron chama a cada 30 minutos:
SELECT cron.schedule(
  'sync-nuvemshop-meta-every-30min',
  '*/30 * * * *',  -- 30 em 30 minutos
  'SELECT net.http_post(...)'
)
```

**Para testar manualmente:**
```bash
curl -X POST https://prnshbkblddfgttsgxpt.supabase.co/functions/v1/sync-nuvemshop-meta \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybnNoYmtibGRkZmd0dHNneHB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MzE1MTAsImV4cCI6MjA4NTMwNzUxMH0.HPUfckX6OfqbWu1MvZIs0bZaYRf58n84MRCrpRk-7og" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### **Trigger 3: Botão Sincronizar**

Já existe em `src/components/RefreshButton.tsx`:

```typescript
// Ao clicar botão, força sync completo
const handleRefresh = async () => {
  await forceFullSync(dateRange)
  // Atualiza UI
  onRefreshComplete()
}
```

---

## 🧪 Teste Completo (3 Pontos)

### Teste 1: Page Load

1. Abrir DevTools (F12)
2. Ir para **Console**
3. Limpar console
4. **Recarregar página** (F5)
5. Ver logs:
   ```
   🚀 Performing mandatory mount sync...
   📦 Fetching Nuvem Shop orders...
   ✅ Retrieved XXX orders
   ```

**Esperado:** Dados carregados automaticamente

### Teste 2: Cron (Manual)

No browser console, executar:
```javascript
fetch('/functions/v1/sync-nuvemshop-meta', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + import.meta.env.VITE_SUPABASE_ANON_KEY,
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(r => console.log('Sync result:', r))
```

**Esperado:** Retorna `{ success: true, orders: {...}, campaigns: {...} }`

### Teste 3: Botão Sincronizar

1. Clicar botão "Atualizar" (azul no topo)
2. Ver animação de loading
3. Ver logs de sincronização
4. Botão volta ao normal

**Esperado:** Dados atualizados, timestamp muda

---

## 📊 Monitorar Sincronizações

### Ver histórico de syncs

No Supabase SQL Editor:
```sql
SELECT * FROM sync_log ORDER BY started_at DESC LIMIT 10;
```

### Verificar últimas Edge Function executions

```sql
SELECT * FROM
  extensions.http_request_queue
ORDER BY inserted_at DESC
LIMIT 10;
```

---

## 🔧 Troubleshooting

### Problema: Cron não está rodando

**Solução:**
1. Verificar se pg_cron está habilitado:
   ```sql
   SELECT * FROM pg_extension WHERE extname = 'pg_cron';
   ```
2. Verificar se job está agendado:
   ```sql
   SELECT * FROM cron.job WHERE jobname = 'sync-nuvemshop-meta-every-30min';
   ```
3. Verificar logs do job:
   ```sql
   SELECT * FROM cron.job_run_details ORDER BY end_time DESC LIMIT 10;
   ```

### Problema: Mount sync não está rodando

**Solução:**
1. Verificar se `enableMountSync = true` no Dashboard.tsx:
   ```typescript
   useSyncWithRealtime({
     tables: ['orders_cache', 'meta_campaigns_cache'],
     enableMountSync: true,  // <-- Verificar isso
     enableRealtime: true,
     enablePolling: true,
   })
   ```
2. Verificar console para erros
3. Verificar se `syncManager.ts` está importado corretamente

### Problema: Dados não aparecem após sync

**Solução:**
1. Verificar se Edge Functions estão deployadas:
   ```bash
   supabase functions list --project-ref=prnshbkblddfgttsgxpt
   ```
2. Verificar se tokens (Nuvem Shop, Meta) estão corretos em `.env.local`
3. Verificar logs da Edge Function:
   ```bash
   supabase functions logs sync-nuvemshop-meta --project-ref=prnshbkblddfgttsgxpt
   ```

---

## 🎯 Configurações Customizáveis

### Interval de Polling

No Dashboard.tsx, mudar:
```typescript
pollingIntervalMs: 30000  // 30 segundos
// Para:
pollingIntervalMs: 60000  // 60 segundos
```

### Intervalo de Cron

Na migration, mudar:
```sql
'*/30 * * * *'  -- A cada 30 minutos
-- Para:
'*/15 * * * *'  -- A cada 15 minutos
```

### Timeout de Sync

No `syncManager.ts`:
```typescript
timeout = 120000  // 2 minutos
// Para:
timeout = 60000  // 1 minuto
```

---

## 📱 Status da Implementação

- [x] Edge Function para sync automático (`sync-nuvemshop-meta/index.ts`)
- [x] Migration com pg_cron habilitado (`20260224000001_enable_pg_cron.sql`)
- [x] Serviço de sync com retry (`services/syncManager.ts`)
- [x] Hook melhorado com mount sync (`hooks/useRealtimeSync.ts`)
- [ ] Deploy e testes em produção

---

## 📞 Próximos Passos

1. **Deploy** - Executar passos em "Deployar"
2. **Testar** - Executar testes em "Teste Completo"
3. **Monitorar** - Usar SQL Editor para acompanhar syncs
4. **Otimizar** - Ajustar intervals conforme necessário
