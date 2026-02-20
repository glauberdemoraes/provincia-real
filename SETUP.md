# Setup — Cockpit Província Real

## Status: Versão Inicial Pronta ✅

### Completado

✅ **Scaffolding**
- React 18 + TypeScript + Vite
- Tailwind CSS 4 com dark mode
- Path alias (`@/`) configurado
- Router com 4 páginas (Dashboard, Realtime, History, Settings)

✅ **Camada de Tipos**
- `src/types/index.ts` — Todos os interfaces TypeScript
- NuvemshopOrder, MetaCampaign, DashboardMetrics, ActiveAlert, etc.

✅ **Camada de Serviços**
- `src/services/api.ts` — Fetch NuvemShop + Meta Ads (live e cache)
- `src/services/cache.ts` — Sincronização de dados ao cache
- `src/services/alerts.ts` — Gerenciamento de alertas

✅ **Camada de Contextos**
- ThemeContext — Dark/light mode
- TimezoneContext — LA / BR timezone toggle

✅ **Componentes Iniciais**
- MetricCard — Card de métrica reutilizável
- AlertBanner — Banner de alertas ativo
- ErrorBoundary — Tratamento de erros React
- Dashboard página inicial funcional

✅ **Migrações SQL**
- `20260219000001_cache_tables.sql` — Tabelas orders_cache + meta_campaigns_cache
- `20260219000002_support_tables.sql` — Alertas, sync logs, RLS
- `20260219000003_sync_functions.sql` — sync_orders_to_cache + sync_meta_to_cache
- `20260219000004_alert_functions.sql` — check_alerts()
- `20260219000005_analytics_views.sql` — Views para histórico
- `20260219000001_default_alerts.sql` — 7 alertas padrão

### Build Status
```
✓ TypeScript: OK (0 errors)
✓ Vite Build: OK
✓ Size: 416 KB (gzip: 123.85 KB)
```

---

## Próximos Passos

### 1. Deploy Migrações no Supabase
```bash
# Aplicar migrations em ordem no SQL Editor do Supabase:
# 1. Copy conteúdo de migration 001 → run
# 2. Copy conteúdo de migration 002 → run
# 3. Copy conteúdo de migration 003 → run
# 4. Copy conteúdo de migration 004 → run
# 5. Copy conteúdo de migration 005 → run
# 6. Copy conteúdo do seed → run
```

### 2. Criar Secrets no Supabase Vault (Segurança)
```sql
-- Executar no SQL Editor:
SELECT vault.create_secret('nuvemshop_token', '470c8121c30cfac9bf853c45181132eeb9d69799', 'NuvemShop API Token');
SELECT vault.create_secret('meta_token', 'EAAKH0VidJXQ...', 'Meta Graph API Token');
```

### 3. Integrar Dashboard Original
Migrar código do App.tsx original para `src/pages/Dashboard/`:
- Extrair lógica de métricas → `useDashboardData.ts`
- Integrar charts (Recharts)
- Integrar tabelas UTM e Meta Ads

### 4. Implementar Novos Indicadores
- [ ] Gauge de velocidade (pedidos/hora)
- [ ] Funnel de conversão
- [ ] Ad Efficiency Score (A/B/C/D)
- [ ] Break-even tracker
- [ ] CAC por canal

### 5. Tela Realtime / TV
- [ ] BigMetricTile components (métricas gigantes)
- [ ] LiveAlertTicker (alertas scrolling)
- [ ] Auto-refresh 30s
- [ ] Fullscreen API toggle

### 6. Página History
- [ ] TrendSection (gráficos temporais)
- [ ] CohortSection (clientes recorrentes)
- [ ] ExportButton (CSV/Excel)

### 7. Página Settings
- [ ] CRUD de alertas
- [ ] Histórico de sincronizações
- [ ] Trigger manual de sync

---

## Rodando Localmente

```bash
cd /root/aios-workspace/provincia-real

# Desenvolvimento
npm run dev

# Build produção
npm run build

# Type check
npm run typecheck

# Lint
npm run lint
```

A app rodará em `http://localhost:5173`

---

## Estrutura de Arquivos

```
src/
├── lib/              # Utilidades (supabase, constants, utils)
├── types/            # Interfaces TypeScript
├── services/         # API, cache, alertas
├── hooks/            # Custom hooks (a implementar)
├── contexts/         # Theme + Timezone
├── components/       # Componentes React
│   ├── ui/          # Primitivos (MetricCard, AlertBanner, etc.)
│   ├── charts/      # Gráficos Recharts
│   └── tables/      # Tabelas
├── pages/           # Páginas (Dashboard, Realtime, History, Settings)
├── App.tsx          # Router root
├── main.tsx         # Entrypoint React
└── index.css        # Tailwind CSS global

supabase/
├── migrations/      # 5 arquivos SQL
└── seeds/          # Dados iniciais (alertas)
```

---

## Notas Importantes

### Security
- 🔐 Tokens NuvemShop/Meta ainda estão hardcoded nas stored procedures
- 📋 Implementar Supabase Vault quando tiver acesso SQL Editor
- 🔒 RLS policies já configuradas para anon key

### Performance
- ✅ Cache tables indexadas para queries rápidas
- ✅ Views para histórico otimizadas
- ✅ Componentes otimizados com React.memo (a implementar)

### Próxima Versão
- [ ] Integrar código original do App.tsx
- [ ] Validar RPC calls ao Supabase
- [ ] Testar alerts em tempo real
- [ ] Performance testing em grandes datasets
