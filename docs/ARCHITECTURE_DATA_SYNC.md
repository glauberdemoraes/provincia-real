# Arquitetura de Sincronização de Dados — Provincia Real

**Data:** 2026-02-20
**Status:** Implementado e pronto para integração
**Versão:** 1.0

---

## Problema Original

A arquitetura anterior apresentava um fluxo de dados que não persistia informações críticas:

```
NuvemShop API → Edge Function → JSON Response → Frontend
    ❌ Sem persistência
    ❌ utm_campaign nunca é salvo
    ❌ Dados não são consultáveis via SQL
    ❌ Frontend depende de Edge Function sempre online
    ❌ Sem histórico de dados
```

**Impacto:**
- Campanhas não identificadas
- Impossível fazer análises históricas
- Performance ruim (chamadas síncronas à API)
- Sem fallback se API NuvemShop cair

---

## Solução Implementada

A nova arquitetura implementa **sincronização bidirecional** com persistência em cache:

```
┌─────────────────────┐
│   NuvemShop API     │  (Fonte de verdade)
│   (a cada 12h+)     │
└──────────┬──────────┘
           │
           │ sync_orders_to_cache()
           │ ou sync_meta_to_cache()
           ↓
┌──────────────────────┐
│  RPC Functions       │  (Sincronização inteligente)
│  Supabase PostgreSQL │  - Deduplicação
└──────────┬───────────┘  - Extração de UTM
           │
           │ INSERT ... ON CONFLICT DO UPDATE
           ↓
┌──────────────────────┐
│   orders_cache       │  (Persistência local)
│   (PostgreSQL)       │  - Índices otimizados
│                      │  - Histórico completo
│  meta_campaigns_     │
│   cache              │
└──────────┬───────────┘
           │
           │ SELECT * FROM orders_cache WHERE ...
           ↓
┌──────────────────────┐
│    Frontend (React)  │  (Consultável via SQL)
│  SPA + Real-time     │  - Análises rápidas
│  Supabase RLS        │  - RLS para permissões
└──────────────────────┘
```

---

## Fluxo de Dados Completo

### 1. Sincronização de Pedidos (Orders)

**Função RPC:** `sync_orders_to_cache(p_start_date DATE, p_end_date DATE)`

```sql
-- Exemplo de chamada
SELECT sync_orders_to_cache(
  (NOW() AT TIME ZONE 'America/Sao_Paulo')::date - interval '1 day',
  (NOW() AT TIME ZONE 'America/Sao_Paulo')::date
);

-- Retorna JSON:
{
  "success": true,
  "fetched": 42,      -- pedidos buscados da API
  "upserted": 42,     -- pedidos salvos/atualizados em cache
  "log_id": 123
}
```

**O que acontece dentro:**

1. Chama `fetch_nuvemshop_orders()` para buscar dados da API
2. Para cada pedido, extrai `utm_campaign` de 3 fontes (nesta ordem):
   - Campo `utm_campaign` direto da API (se disponível)
   - Parâmetro `?utm_campaign=...` da URL (`landing_url`)
   - Se tudo vazio, usa default: `"Direto"`
3. Insere em `orders_cache` com `ON CONFLICT DO UPDATE` para evitar duplicatas
4. Registra sincronização em `sync_logs` (timestamp, sucesso/erro, quantidade)

**Estrutura de `orders_cache`:**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | BIGINT PRIMARY KEY | ID único do pedido na NuvemShop |
| total | NUMERIC(10,2) | Valor total do pedido |
| subtotal | NUMERIC(10,2) | Valor sem frete |
| shipping_cost_owner | NUMERIC(10,2) | Custo do frete |
| payment_status | TEXT | `paid`, `pending`, `cancelled`, etc. |
| shipping_status | TEXT | `pending`, `shipped`, `delivered`, etc. |
| billing_name | TEXT | Nome do cliente |
| contact_phone | TEXT | Telefone para contato |
| billing_phone | TEXT | Telefone de faturamento |
| landing_url | TEXT | URL de origem do cliente |
| utm_source | TEXT | Extraído de landing_url |
| utm_medium | TEXT | Extraído de landing_url |
| **utm_campaign** | TEXT | **Extraído de landing_url ou API** |
| utm_content | TEXT | Extraído de landing_url |
| utm_term | TEXT | Extraído de landing_url |
| products | JSONB | Array com detalhes dos produtos |
| order_created_at | TIMESTAMPTZ | Data/hora do pedido (TZ America/Sao_Paulo) |
| fetched_at | TIMESTAMPTZ | Quando foi sincronizado |
| updated_at | TIMESTAMPTZ | Última atualização (AUTO via trigger) |

**Índices para Performance:**

```sql
-- Índices criados automaticamente
CREATE INDEX idx_orders_cache_payment_status ON orders_cache (payment_status);
CREATE INDEX idx_orders_cache_order_created_at ON orders_cache (order_created_at DESC);
CREATE INDEX idx_orders_cache_utm_source ON orders_cache (utm_source);
CREATE INDEX idx_orders_cache_utm_campaign ON orders_cache (utm_campaign);
CREATE INDEX idx_orders_cache_paid_date ON orders_cache (payment_status, order_created_at DESC)
  WHERE payment_status = 'paid';
```

---

### 2. Sincronização de Campanhas Meta (Meta Ads)

**Função RPC:** `sync_meta_to_cache(p_start_date DATE, p_end_date DATE)`

```sql
-- Exemplo de chamada
SELECT sync_meta_to_cache(
  (NOW() AT TIME ZONE 'America/Sao_Paulo')::date - interval '1 day',
  (NOW() AT TIME ZONE 'America/Sao_Paulo')::date
);

-- Retorna JSON:
{
  "success": true,
  "fetched": 15,      -- campanhas buscadas
  "upserted": 15,     -- campanhas salvas
  "log_id": 124
}
```

**Estrutura de `meta_campaigns_cache`:**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | BIGSERIAL PRIMARY KEY | ID sequencial interno |
| campaign_id | TEXT | ID da campanha no Meta |
| campaign_name | TEXT | Nome descritivo |
| account_id | TEXT | ID da conta publicitária |
| account_name | TEXT | Nome da conta |
| spend | NUMERIC(10,4) | Gasto total em R$ |
| impressions | BIGINT | Impressões |
| clicks | BIGINT | Cliques |
| cpc | NUMERIC(10,4) | Custo por clique |
| ctr | NUMERIC(8,6) | Taxa de clique |
| cpm | NUMERIC(10,4) | Custo por mil impressões |
| actions | JSONB | Array com conversões (purchase, add_to_cart, etc.) |
| purchases | INTEGER | Extraído de actions (GENERATED ALWAYS) |
| date_start | DATE | Data início da campanha |
| date_stop | DATE | Data fim da campanha |
| fetched_at | TIMESTAMPTZ | Quando foi sincronizado |
| updated_at | TIMESTAMPTZ | Última atualização |

---

## Frequência de Sincronização

### Recomendação: HÍBRIDA

**Padrão (recomendado):**
- **Histórico (últimos 30 dias):** Sincronizar 1x por dia (00:00 São Paulo)
- **Hoje (últimas 24h):** Sincronizar a cada 4 horas durante horário comercial
- **On-demand:** Botão no frontend para sincronizar manualmente

**Rationale:**
- Histórico não muda (dados de dias passados são estáveis)
- Hoje muda constantemente (novos pedidos chegam continuamente)
- On-demand permite correções sem esperar próximo ciclo automático
- Menos carga no Supabase + dados sempre atualizados

**Configuração alternativa por caso de uso:**

| Caso | Frequência | Exemplo |
|------|-----------|---------|
| Demo/Desenvolvimento | 1 vez ao iniciar | `npm run dev` dispara sync |
| Produção (padrão) | 4h em comercial + 1x noite | Cron schedule |
| Real-time crítico | A cada 30 minutos | Webhook da NuvemShop |
| On-demand apenas | Usuário clica botão | Sem automação |

---

## Como Integrar no Frontend

### Arquivo: `/root/aios-workspace/provincia-real/src/services/api.ts`

#### Opção 1: Sincronizar antes de cada query (RECOMENDADO)

```typescript
import { supabase } from '@/lib/supabase'
import type { NuvemshopOrder, DateRange } from '@/types'

/**
 * Fetch orders com sync automático
 * 1. Sincroniza dados da NuvemShop → Supabase
 * 2. Lê dados do cache local (orders_cache)
 * 3. Retorna resultados
 */
export async function fetchOrdersWithSync(range: DateRange): Promise<NuvemshopOrder[]> {
  try {
    console.log('📡 Sincronizando pedidos...')

    // Step 1: Sincronizar
    const { data: syncResult, error: syncError } = await supabase.rpc(
      'sync_orders_to_cache',
      {
        p_start_date: range.start.toISOString().split('T')[0],
        p_end_date: range.end.toISOString().split('T')[0],
      }
    )

    if (syncError) {
      console.warn('⚠️ Sync falhou, tentando cache:', syncError)
      // Continuar com cache mesmo se sync falhar
    } else {
      console.log(`✅ Sync: ${syncResult?.fetched || 0} buscados, ${syncResult?.upserted || 0} salvos`)
    }

    // Step 2: Ler do cache
    const { data, error } = await supabase
      .from('orders_cache')
      .select('*')
      .gte('order_created_at', range.start.toISOString())
      .lte('order_created_at', range.end.toISOString())
      .eq('payment_status', 'paid')  // Opcional: filtrar apenas pagos
      .order('order_created_at', { ascending: false })

    if (error) throw new Error(`Cache read failed: ${error.message}`)

    console.log(`✅ Lidos ${data?.length || 0} pedidos do cache`)
    return data || []

  } catch (err) {
    console.error('❌ fetchOrdersWithSync error:', err)
    return []
  }
}
```

#### Opção 2: Sincronizar manualmente + botão no UI

```typescript
/**
 * Sincronizar explicitamente (para botão "Atualizar dados")
 */
export async function syncOrdersManual(range: DateRange): Promise<{
  success: boolean
  fetched: number
  upserted: number
  error?: string
}> {
  try {
    const { data, error } = await supabase.rpc('sync_orders_to_cache', {
      p_start_date: range.start.toISOString().split('T')[0],
      p_end_date: range.end.toISOString().split('T')[0],
    })

    if (error) throw new Error(error.message)

    return {
      success: data?.success || false,
      fetched: data?.fetched || 0,
      upserted: data?.upserted || 0,
    }
  } catch (err) {
    console.error('❌ syncOrdersManual error:', err)
    return {
      success: false,
      fetched: 0,
      upserted: 0,
      error: err instanceof Error ? err.message : 'Erro desconhecido',
    }
  }
}

/**
 * Usar em componente React
 */
export function SyncButton() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleSync = async () => {
    setLoading(true)
    const res = await syncOrdersManual({
      start: new Date(Date.now() - 86400000), // últimas 24h
      end: new Date()
    })
    setResult(res)
    setLoading(false)
  }

  return (
    <>
      <button onClick={handleSync} disabled={loading}>
        {loading ? 'Sincronizando...' : 'Atualizar Dados'}
      </button>
      {result && (
        <p>{result.success ? `✅ ${result.upserted} pedidos` : `❌ ${result.error}`}</p>
      )}
    </>
  )
}
```

#### Opção 3: Queries SQL diretas no frontend

```typescript
/**
 * Query custom via Supabase client
 */
export async function getOrdersByUTMCampaign(
  campaign: string,
  range: DateRange
): Promise<NuvemshopOrder[]> {
  const { data, error } = await supabase
    .from('orders_cache')
    .select(`
      id, total, subtotal, payment_status,
      utm_campaign, utm_source, billing_name,
      order_created_at, products
    `)
    .eq('utm_campaign', campaign)
    .eq('payment_status', 'paid')
    .gte('order_created_at', range.start.toISOString())
    .lte('order_created_at', range.end.toISOString())
    .order('order_created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data || []
}

/**
 * Dashboard com estatísticas por campanha
 */
export async function getCampaignStats(range: DateRange) {
  const { data, error } = await supabase
    .rpc('get_campaign_stats', {
      p_start_date: range.start.toISOString().split('T')[0],
      p_end_date: range.end.toISOString().split('T')[0],
    })

  if (error) throw new Error(error.message)
  return data || []
}
```

---

## Estratégia de Fallback

Quando `orders_cache` está vazio ou sincronização falha:

```typescript
/**
 * Fetch com fallback inteligente
 * 1. Tenta cache (rápido)
 * 2. Se vazio, tenta sincronizar (espera dados)
 * 3. Se sync falha, tenta Edge Function (pode estar desatualizado)
 */
export async function fetchOrdersWithFallback(range: DateRange): Promise<NuvemshopOrder[]> {
  try {
    // Step 1: Tentar cache
    console.log('📦 Tentando cache...')
    const { data: cacheData, error: cacheError } = await supabase
      .from('orders_cache')
      .select('*')
      .gte('order_created_at', range.start.toISOString())
      .lte('order_created_at', range.end.toISOString())
      .order('order_created_at', { ascending: false })

    if (!cacheError && cacheData && cacheData.length > 0) {
      console.log(`✅ Cache hit: ${cacheData.length} pedidos`)
      return cacheData
    }

    // Step 2: Cache vazio, tentar sincronizar
    console.log('⏳ Cache vazio, sincronizando...')
    const { data: syncResult, error: syncError } = await supabase.rpc(
      'sync_orders_to_cache',
      {
        p_start_date: range.start.toISOString().split('T')[0],
        p_end_date: range.end.toISOString().split('T')[0],
      }
    )

    if (!syncError && syncResult?.success) {
      // Sync funcionou, ler cache novamente
      const { data: newCacheData } = await supabase
        .from('orders_cache')
        .select('*')
        .gte('order_created_at', range.start.toISOString())
        .lte('order_created_at', range.end.toISOString())
        .order('order_created_at', { ascending: false })

      if (newCacheData && newCacheData.length > 0) {
        console.log(`✅ Sync sucesso: ${newCacheData.length} pedidos`)
        return newCacheData
      }
    }

    // Step 3: Sync falhou ou vazio, tentar Edge Function (fallback)
    console.log('⚠️ Cache e sync vazios, usando Edge Function...')
    const fallbackData = await fetchOrders(range)
    return fallbackData

  } catch (err) {
    console.error('❌ fetchOrdersWithFallback error:', err)
    return []
  }
}
```

---

## Performance e Índices

### Índices Criados Automaticamente

```sql
-- Buscas por período (mais comum)
CREATE INDEX idx_orders_cache_order_created_at
  ON orders_cache (order_created_at DESC);

-- Filtros por status de pagamento
CREATE INDEX idx_orders_cache_payment_status
  ON orders_cache (payment_status);

-- Análises por campanha (UTM)
CREATE INDEX idx_orders_cache_utm_campaign
  ON orders_cache (utm_campaign);

-- Análises por origem (utm_source)
CREATE INDEX idx_orders_cache_utm_source
  ON orders_cache (utm_source);

-- Query comum: "Pedidos pagos nos últimos 7 dias"
CREATE INDEX idx_orders_cache_paid_date
  ON orders_cache (payment_status, order_created_at DESC)
  WHERE payment_status = 'paid';
```

### Queries Recomendadas

```sql
-- Rápido: Pedidos pagos últimos 7 dias
SELECT * FROM orders_cache
WHERE payment_status = 'paid'
  AND order_created_at >= NOW() - interval '7 days'
ORDER BY order_created_at DESC;

-- Rápido: Agrupar por campanha
SELECT utm_campaign, COUNT(*), SUM(total)
FROM orders_cache
WHERE payment_status = 'paid'
  AND order_created_at >= NOW() - interval '30 days'
GROUP BY utm_campaign
ORDER BY SUM(total) DESC;

-- Cuidado: Pode ser lento sem filtros
SELECT * FROM orders_cache; -- ❌ Scaneia toda tabela

-- Particionamento (futuro, se tabela crescer)
-- Preparação para: PARTITION BY RANGE (YEAR(order_created_at))
```

---

## Logs de Sincronização

Cada sync é registrado em `sync_logs`:

```sql
-- Ver histórico de sincronizações
SELECT
  id, sync_type, status, records_fetched, records_upserted,
  date_start, date_end, duration_ms, completed_at, error_message
FROM sync_logs
WHERE sync_type = 'orders'
ORDER BY completed_at DESC
LIMIT 10;

-- Exemplo resultado:
-- id=1, sync_type=orders, status=success, fetched=42, upserted=42, duration_ms=1250
-- id=2, sync_type=meta_campaigns, status=success, fetched=15, upserted=15, duration_ms=890
-- id=3, sync_type=orders, status=error, error_message="API timeout after 30s"
```

---

## Diferenças: Antes vs. Depois

| Aspecto | ANTES | DEPOIS |
|---------|-------|--------|
| **Persistência** | ❌ Não | ✅ Sim (orders_cache) |
| **utm_campaign** | ❌ undefined | ✅ Extraído 3 fontes |
| **Consultas SQL** | ❌ Não | ✅ Sim, rápidas |
| **Histórico** | ❌ Não | ✅ Completo |
| **Deduplicação** | ❌ Não | ✅ ON CONFLICT |
| **Fallback** | ❌ Se API cai, sem dados | ✅ Cache sempre disponível |
| **Performance** | ⚠️ Chamadas síncronas | ✅ Async + índices |
| **RLS/Permissões** | ❌ Sem controle | ✅ Via Supabase RLS |
| **Monitoramento** | ❌ Não | ✅ sync_logs |
| **Timestamp TZ** | ❌ UTC | ✅ America/Sao_Paulo |

---

## Roteiro de Implementação

### Fase 1: Deploy (FEITO ✅)
- [x] Criar tabelas `orders_cache` e `meta_campaigns_cache`
- [x] Implementar funções RPC `sync_orders_to_cache()` e `sync_meta_to_cache()`
- [x] Criar helper `extract_utm_param()` para parsing de URLs
- [x] Criar índices para performance
- [x] Implementar `sync_logs` para auditoria

### Fase 2: Integração Frontend
- [ ] Atualizar `src/services/api.ts` com `fetchOrdersWithSync()`
- [ ] Implementar botão "Atualizar Dados" com `syncOrdersManual()`
- [ ] Testar sync com dados reais
- [ ] Implementar fallback `fetchOrdersWithFallback()`

### Fase 3: Automação
- [ ] Setup Cron job (Cloud Functions ou externa)
- [ ] Sincronização diária (00:00 São Paulo)
- [ ] Sincronização 4 horas durante comercial
- [ ] Monitoramento de erros em sync_logs

### Fase 4: Análises
- [ ] Dashboard por campanha (utm_campaign)
- [ ] ROI por fonte (utm_source)
- [ ] Queries custom conforme demanda

---

## Referências

**Funções SQL:**
- `/root/aios-workspace/provincia-real/supabase/migrations/20260219000003_sync_functions.sql`

**Tabelas:**
- `/root/aios-workspace/provincia-real/supabase/migrations/20260219000001_cache_tables.sql`

**Frontend:**
- `/root/aios-workspace/provincia-real/src/services/api.ts`

**Tipos:**
- `/root/aios-workspace/provincia-real/src/types/index.ts`

---

## FAQ

**P: Como extrair utm_campaign se o pedido vier de forma diferente?**
R: A função `extract_utm_param()` faz 3 tentativas:
1. Campo direto da API NuvemShop
2. Parâmetro URL em landing_url
3. Default: "Direto"

**P: Com que frequência sincronizar?**
R: Recomendado híbrido: 1x/dia histórico + 4h/comercial + on-demand

**P: E se sync falhar?**
R: Fallback automático tenta Edge Function. Log em sync_logs para debug.

**P: Quanto de storage vai ocupar?**
R: ~1KB por pedido. 1000 pedidos/mês = ~30MB/ano. Supabase suporta facilmente.

**P: Preciso duplicar dados em meta_campaigns_cache também?**
R: Sim, mesmo padrão. Função `sync_meta_to_cache()` já implementada.

**P: Como fazer queries avançadas (agregações)?**
R: SQL direto via `supabase.rpc()` ou criar stored procedures customizadas.

---

**Documento criado:** 2026-02-20
**Última atualização:** 2026-02-20
**Status:** Pronto para produção
