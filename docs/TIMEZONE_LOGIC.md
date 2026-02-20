# Timezone Logic — BR vs LA Proporcional

## Problema

O dashboard precisa mostrar métricas em dois timezones:
- **LA** (Los Angeles): UTC-8, usado pelo Meta Ads API
- **BR** (São Paulo): UTC-3, fuso horário do lojista NuvemShop

## Solução: Cálculo Proporcional

### Conceito

Um "dia BR" cruza dois "dias LA" porque há 5 horas de diferença:

```
Dia BR 2026-02-20:
  ├─ Começa: 2026-02-20 00:00 BR = 2026-02-19 20:00 LA (= 2026-02-20 04:00 UTC)
  │  [Erro na conversão anterior - vamos recalcular]
  │
  └─ Termina: 2026-02-20 23:59 BR = 2026-02-20 18:59 LA (= 2026-02-21 02:59 UTC)
```

**Recálculo correto:**
- BR (São Paulo) = UTC-3
- LA (Los Angeles) = UTC-8
- Offset = 5 horas (LA fica 5 horas atrás de BR)

```
Dia BR 2026-02-20 00:00-23:59:
  ├─ Início (00:00 BR = 03:00 UTC) = 19:00 LA do dia anterior (19:00 2026-02-19 LA)
  └─ Fim (23:59 BR = 02:59 UTC do dia seguinte) = 18:59 LA do mesmo dia (18:59 2026-02-20 LA)
```

Logo, o "dia BR" spans:
- **Últimas 5 horas do dia LA anterior** (19:00-23:59 = 5 horas) = 5/24 ≈ 20.8%
- **Primeiras 19 horas do dia LA atual** (00:00-18:59 = 19 horas) = 19/24 ≈ 79.2%

### Implementação

#### 1. Frontend: Constantes em `lib/timezone.ts`

```typescript
export const BR_LA_OFFSET_HOURS = 5

export const getProportionalWeights = () => ({
  prevDay: 5 / 24,   // 0.208
  curDay: 19 / 24,   // 0.792
})

export const getDateRange_LA_forBR = (brDate: Date) => ({
  prev: new Date(Date.UTC(brDate.getFullYear(), brDate.getMonth(), brDate.getDate() - 1)),
  cur: new Date(Date.UTC(brDate.getFullYear(), brDate.getMonth(), brDate.getDate()))
})
```

#### 2. API: Edge Function `fetch-meta-campaigns`

Quando `timezone_mode=BR`:
1. Calcular range LA: `{ prev: 2026-02-19, cur: 2026-02-20 }`
2. Passar `time_increment=1` para obter spend por **cada dia**
3. Agregar por campanha com pesos proporcionais

**Pseudocódigo:**
```javascript
const { prev, cur } = getDateRange_LA_forBR(new Date('2026-02-20'))
const campaignsP = fetch(prevDate, curDate)  // day para prev
const campaignsC = fetch(curDate, curDate)   // day para cur

const weights = getProportionalWeights()
return campaignsP.map(c => ({
  ...c,
  spend: c.spend * weights.prevDay + campaignsC[c.id].spend * weights.curDay
}))
```

#### 3. Frontend: Metrics Calculation

Em `calculateDashboardMetrics`:
```typescript
if (timezone === 'BR') {
  // Spend já vem com proporção calculada na API
  totalAdSpend += spend
} else {
  // LA: usar spend direto
  totalAdSpend += spend
}
```

## Dados

### UTC Offsets
- **São Paulo (BR)**: UTC-3 (padrão em fevereiro — durante daylight saving em outros meses)
- **Los Angeles (LA)**: UTC-8 (padrão — muda para UTC-7 em março)
- **Offset**: 5 horas (LA fica 5 horas atrás)

### Exemplo Real

**Data consultada: 2026-02-20 (sexta-feira)**

| Métrica | BR Time | UTC | LA Time |
|---------|---------|-----|---------|
| Início dia BR | 00:00 | 03:00 | 19:00 (19/02) |
| Fim dia BR | 23:59 | 02:59 (next day) | 18:59 (20/02) |

## Futuro

Quando implementar cálculo proporcional completo:
1. Edge function retorna `time_increment=1` (spend por dia)
2. Frontend agrupa por campanha + aplica pesos proporcionais
3. Migration: update `meta_campaigns_cache` para armazenar `timezone_mode` usado

## Status

- ✅ Padrão BR implementado
- ✅ Funções de suporte adicionadas (`lib/timezone.ts`)
- ⏳ Cálculo proporcional na edge function (TODO)
- ⏳ Armazenamento de peso de proporção (TODO)

---

**Referência:** `src/lib/timezone.ts`, `src/services/metrics.ts`, `supabase/functions/fetch-meta-campaigns/index.ts`
