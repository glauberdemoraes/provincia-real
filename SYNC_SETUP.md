# 🔄 Sincronização Automática - Provincia Real

## 📋 Resumo da Solução

Implementação completa de sincronização automática com **3 pontos de atualização**:

1. **📱 Mount Sync** - Ao carregar/recarregar a página (F5)
2. **⏱️ Polling** - A cada 30 segundos (fallback automático)
3. **🔄 Cron Service** - A cada 30 minutos (via serviço Node.js)

---

## ✨ O Que Foi Implementado

### Frontend (React)

```typescript
// src/hooks/useRealtimeSync.ts
useSyncWithRealtime({
  enableMountSync: true,      // ✅ Sincroniza ao carregar
  enableRealtime: true,       // ✅ Listeners em tempo real
  enablePolling: true,        // ✅ Polling fallback
  pollingIntervalMs: 30000,   // A cada 30 segundos
})
```

- **useMountSync()** - Executa ao montar o Dashboard
- **useAutoSync()** - Polling automático
- **useRealtimeSync()** - Listeners para mudanças no banco

### Backend (Edge Functions)

```
✅ /functions/v1/fetch-nuvemshop-orders    [DEPLOYADA]
✅ /functions/v1/fetch-meta-campaigns       [DEPLOYADA]
✅ /functions/v1/sync-complete              [PRONTA]
❓ /functions/v1/sync-nuvemshop-meta        [OPCIONAL]
```

### Serviço de Cron (Node.js)

```
✅ sync-service.mjs - Sincroniza a cada 30 min
✅ Mantém SSH ativo (sem drop)
✅ Logs detalhados em .sync-service.log
```

---

## 🚀 Como Usar

### Opção 1: Frontend Automático (Recomendado para Desenvolvimento)

O frontend já está configurado. **Nenhuma ação necessária!**

Apenas recarregue a página e verá:

```
✅ F5 (Page Load)
  → 🚀 Performing mandatory mount sync...
  → 📦 Fetching Nuvem Shop orders...
  → ✅ Retrieved 15 orders
  → 💾 Saving orders to Supabase...
  → ✅ Sincronização concluída

✅ Clique Botão "Atualizar"
  → Força sync completo imediato

✅ A cada 30 segundos (automático)
  → Polling verifica mudanças
```

### Opção 2: Serviço Cron (Para Produção / SSH Ativo)

Inicia sincronização automática a cada 30 minutos:

```bash
# Terminal 1: Dev normal
npm run dev

# Terminal 2: Serviço de Sync (rodando em paralelo)
npm run sync:service

# Output esperado:
# ═══════════════════════════════════════════════════════
#   Serviço de Sincronização - Provincia Real
# ═══════════════════════════════════════════════════════
#
# 📍 Sincronização inicial...
# 🔄 Iniciando sincronização (2026-02-24 a 2026-02-24)...
# ✅ Sincronização completa! (1234ms) Orders: 45, Campaigns: 12
#
# ⏰ Próximas sincronizações: a cada 30 minutos
# 🛡️  Serviço será mantido ativo (sem SSH drop)
```

**Benefícios:**
- ✅ Sincroniza mesmo sem usuário acessando
- ✅ Mantém SSH ativo (heartbeat a cada 1 min)
- ✅ Logs detalhados em `.sync-service.log`
- ✅ Status salvo em `.sync-service-status.json`

### Opção 3: Deploy no Supabase (Cron Native)

Para usar o cron nativo do Supabase (pg_cron):

```bash
# 1. Instalar CLI do Supabase
npm install -g supabase

# 2. Fazer login
supabase login

# 3. Aplicar migration
supabase db push --project-ref=prnshbkblddfgttsgxpt

# 4. Deployar Edge Function
supabase functions deploy sync-nuvemshop-meta --project-ref=prnshbkblddfgttsgxpt
```

---

## 📊 Testando a Sincronização

### Test 1: Mount Sync (Page Load)

```bash
# 1. Abrir browser em http://localhost:5173
# 2. Abrir DevTools (F12)
# 3. Ir para Console
# 4. Pressionar F5 (refresh)
# 5. Ver logs aparecerem
```

Logs esperados:
```
🚀 Performing mandatory mount sync...
📦 Fetching Nuvem Shop orders...
✅ Retrieved 45 orders
💾 Saving orders to Supabase...
✅ Sincronização concluída (2341ms)
```

### Test 2: Manual Refresh

```bash
# 1. No browser, clicar botão azul "Atualizar" (topo da página)
# 2. Ver animação de loading
# 3. Ver dados atualizados
# 4. Ver timestamp mudando
```

### Test 3: Polling (Automático)

```bash
# 1. Deixar página aberta
# 2. A cada 30 segundos, verá logs:
#    "Auto-sync triggered by polling"
# 3. Dados atualizam automaticamente
```

### Test 4: Cron Service

```bash
# Terminal 1
npm run dev

# Terminal 2
npm run sync:service

# Terminal 3 (em outro shell)
tail -f .sync-service.log

# Verá logs a cada 30 minutos:
# [2026-02-24T22:00:00] 🔄 Iniciando sincronização...
# [2026-02-24T22:00:05] ✅ Sincronização completa! (5432ms) Orders: 45, Campaigns: 12
# [2026-02-24T22:30:00] 🔄 Iniciando sincronização...
# ...
```

---

## 🔍 Monitorando

### Logs do Frontend

**Console do Browser (F12)**
```javascript
// Filtrar por [SYNC]
console.log("🚀 Performing mandatory mount sync...")
console.log("📦 Fetching Nuvem Shop orders...")
console.log("✅ Sincronização concluída")
```

### Logs do Serviço

```bash
# Ver logs em tempo real
tail -f .sync-service.log

# Ver últimas 50 linhas
tail -50 .sync-service.log

# Ver status atual
cat .sync-service-status.json
```

Exemplo de status:
```json
{
  "lastSync": "2026-02-24T22:00:05.123Z",
  "success": true,
  "ordersCount": 45,
  "campaignsCount": 12,
  "duration": 5432
}
```

### Logs do Supabase

Ir em Supabase Dashboard → Functions → Logs:
```
fetch-nuvemshop-orders: 20 execuções
fetch-meta-campaigns: 20 execuções
sync-complete: 20 execuções
```

---

## ⚙️ Configuração Avançada

### Mudar Intervalo de Polling

Em `src/pages/Dashboard/index.tsx`:

```typescript
useSyncWithRealtime({
  pollingIntervalMs: 15000,  // Mudar para 15 segundos
  // ... outras opções
})
```

### Mudar Intervalo do Cron Service

Em `sync-service.mjs`:

```javascript
// Mudar de 30 minutos para 15 minutos
cron.schedule('*/15 * * * *', async () => {
  await performSync()
})
```

### Desabilitar Realtime (apenas polling)

Em `src/pages/Dashboard/index.tsx`:

```typescript
useSyncWithRealtime({
  enableRealtime: false,  // Desabilitar listeners
  enablePolling: true,    // Manter polling
})
```

---

## 🐛 Troubleshooting

### Problema: Mount sync não está rodando

**Solução:**
```bash
# 1. Abrir DevTools (F12)
# 2. Ver se há erro no Console
# 3. Verificar se enableMountSync = true em Dashboard.tsx
# 4. Limpar cache: npm run clear-cache ou Ctrl+Shift+Del
```

### Problema: Polling não atualiza dados

**Solução:**
```bash
# 1. Verificar se enablePolling = true
# 2. Aumentar timeout de sync:
#    pollingIntervalMs: 60000 (em vez de 30000)
# 3. Verificar console para erros
```

### Problema: Cron Service caiu

**Solução:**
```bash
# 1. Ver logs
tail -50 .sync-service.log

# 2. Reiniciar
npm run sync:service

# 3. Rodar em background com nohup (Unix/Linux)
nohup npm run sync:service > sync-service.out 2>&1 &

# 4. Rodar com PM2 (recomendado para produção)
npm install -g pm2
pm2 start sync-service.mjs --name "sync-service"
pm2 save
pm2 startup
```

### Problema: SSH drop / Conexão cai

**Solução:**
Usar o Cron Service (npm run sync:service):
- ✅ Heartbeat a cada 1 minuto mantém SSH ativo
- ✅ Sem timeout/drop

Ou, se usar Supabase pg_cron nativo:
- ✅ Roda direto no banco (sem SSH necessário)

---

## 📈 Checklist de Produção

- [ ] Frontend sync está funcionando (F5 → sync automático)
- [ ] Botão refresh atualiza dados
- [ ] Polling está funcionando (dados mudam a cada 30s)
- [ ] Cron service está rodando (npm run sync:service)
- [ ] Logs são salvos (.sync-service.log)
- [ ] SSH permanece ativo durante a noite
- [ ] Dados atualizam sem refresh manual

---

## 🎯 Próximos Passos

1. **Deploy da Edge Function (Opcional)**
   ```bash
   npm install -g supabase
   supabase login
   supabase functions deploy sync-nuvemshop-meta --project-ref=prnshbkblddfgttsgxpt
   ```

2. **Deploy em Produção**
   - Usar PM2 ou similar para manter sync service ativo
   - Configurar logs para persistência
   - Monitorar via Sentry ou similar

3. **Otimizações Futuras**
   - [ ] Webhook Nuvem Shop (quando houver mudança, sincronizar)
   - [ ] Webhook Meta (quando houver mudança, sincronizar)
   - [ ] Database: Índices para queries mais rápidas
   - [ ] Cache: Redis para dados que não mudam frequentemente

---

## 📞 Suporte

Qualquer dúvida sobre sincronização, ver logs detalhados:

```bash
# Terminal
tail -f .sync-service.log

# Browser Console (F12)
// Filtrar por [SYNC]
```

**Tudo pronto para sincronização automática 24/7! 🚀**
