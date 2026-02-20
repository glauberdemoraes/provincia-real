# 🔍 Debug: Problema de Campanhas sendo Marcadas como "DIRETO"

**Data:** 2026-02-20
**Status:** Investigação em andamento

---

## 📋 Problema

Vendas estão sendo categorizadas como **"DIRETO"** mesmo quando têm `utm_campaign` preenchido. Isso significa que o matching entre:

- `utm_campaign` dos orders (NuvemShop)
- `campaign_name` das campanhas Meta Ads

não está funcionando corretamente.

---

## 🔧 Causas Possíveis

### 1. **utm_campaign chegando vazio/null**
```javascript
// Problema
order.utm_campaign = ""     // String vazia
order.utm_campaign = null   // Null
order.utm_campaign = "  "   // Só espaços
```

**Solução:** Adicionar `.trim()` para remover espaços

### 2. **cleanUtmValue removendo tudo**
```javascript
// Se utm_campaign = "minha-campanha|12345"
// E decodeURIComponent falha, ele pode ficar vazio
```

**Solução:** Melhorar tratamento de erro

### 3. **normalizeCampaignName mismatch**
```javascript
// Meta Ads: "Minha Campanha"
// UTM: "minha campanha"
// Normalizado (Meta): "minhacampanha"
// Normalizado (UTM): "minhacampanha"
// ✓ Match OK
```

Mas se há acentos, caracteres especiais:
```javascript
// Meta Ads: "Doce de Leite"
// UTM: "Doce%20de%20Leite"
// Após cleanUtmValue: "Doce de Leite" (com espaços)
// Normalizado: "docedeleite" (espaços removidos)
// ✓ Match OK
```

---

## 🛠️ Mudanças Implementadas para Debug

### Em `src/services/metrics.ts`

#### 1. **Proteção contra utm_campaign vazio**
```typescript
// ANTES
const utmCampaign = normalizeCampaignName(cleanUtmValue(order.utm_campaign || 'Direto'))

// DEPOIS
const rawUtm = (order.utm_campaign || '').trim()  // Trim para remover espaços
const cleanedUtm = cleanUtmValue(rawUtm || 'Direto')
const utmCampaign = normalizeCampaignName(cleanedUtm)
```

#### 2. **Logs de Debug**
```typescript
// Log 1: Amostra de utm_campaign recebidos
console.log('[Metrics] Amostra de utm_campaign recebidos:')
paidOrders.slice(0, 3).forEach((order, i) => {
  console.log(`  [${i}] utm_campaign="${order.utm_campaign}"`)
  console.log(`      → cleanUtmValue: "${cleanUtmValue(order.utm_campaign || 'Direto')}"`)
})

// Log 2: Campanhas Meta Ads
console.log('[Metrics] Campanhas Meta Ads recebidas:')
metaCampaigns.slice(0, 3).forEach((campaign) => {
  const normalized = normalizeCampaignName(campaign.campaign_name)
  console.log(`  Meta: "${campaign.campaign_name}" → normalizado: "${normalized}"`)
})

// Log 3: Campanhas UTM encontradas
console.log('[Metrics] Campanhas UTM encontradas nos orders:')
Array.from(campaignMap.keys()).slice(0, 5).forEach((key) => {
  console.log(`  UTM: "${key}"`)
})

// Log 4: Matching realizado
if (spend > 0 && !hasMatch) {
  console.log(`[Metrics] ⚠️  Meta campaign sem match nos orders`)
}
if (hasMatch && spend > 0) {
  console.log(`[Metrics] ✅ Match encontrado: "${campaign.campaign_name}"`)
}
```

---

## 🧪 Como Usar os Logs

### 1. **Abrir browser DevTools**
```
F12 → Console
```

### 2. **Ir para Dashboard**
```
https://provincia-real.vercel.app
```

### 3. **Procurar por logs**
```
[Metrics] Amostra de utm_campaign recebidos:
[Metrics] Campanhas Meta Ads recebidas:
[Metrics] Campanhas UTM encontradas nos orders:
[Metrics] ✅ Match encontrado:
[Metrics] ⚠️  Meta campaign sem match nos orders
```

---

## 📊 Cenários Esperados

### Cenário A: Tudo funcionando
```console
[Metrics] Amostra de utm_campaign recebidos:
  [0] utm_campaign="Doce de Leite"
      → cleanUtmValue: "Doce de Leite"
  [1] utm_campaign="Barra 200g"
      → cleanUtmValue: "Barra 200g"

[Metrics] Campanhas Meta Ads recebidas:
  Meta: "Doce de Leite" → normalizado: "docedeleite"
  Meta: "Barra 200g" → normalizado: "barra200g"

[Metrics] Campanhas UTM encontradas nos orders:
  UTM: "docedeleite"
  UTM: "barra200g"

[Metrics] ✅ Match encontrado: "Doce de Leite" = "Doce de Leite"
[Metrics] ✅ Match encontrado: "Barra 200g" = "Barra 200g"
```

### Cenário B: utm_campaign vazio (problema)
```console
[Metrics] Amostra de utm_campaign recebidos:
  [0] utm_campaign=""
      → cleanUtmValue: "Direto"
  [1] utm_campaign=null
      → cleanUtmValue: "Direto"

[Metrics] Campanhas UTM encontradas nos orders:
  UTM: "direto"
  UTM: "direto"

[Metrics] ⚠️  Meta campaign sem match nos orders: "Doce de Leite"
```

### Cenário C: Mismatch entre names (problema)
```console
[Metrics] Amostra de utm_campaign recebidos:
  [0] utm_campaign="doce-de-leite"
      → cleanUtmValue: "doce-de-leite"

[Metrics] Campanhas Meta Ads recebidas:
  Meta: "Doce de Leite" → normalizado: "docedeleite"

[Metrics] Campanhas UTM encontradas nos orders:
  UTM: "doce-de-leite"  ← Não matcheia!

[Metrics] ⚠️  Meta campaign sem match nos orders: "Doce de Leite"
```

---

## 🎯 Próximas Ações

1. **Fazer deploy** com os logs de debug
2. **Abrir DevTools** no navegador
3. **Ir para Dashboard** e deixar carregar
4. **Copiar os logs** do console
5. **Analisar os logs** para identificar o padrão

---

## 📝 Perguntas a Responder

Com base nos logs, responda:

- [ ] O `utm_campaign` está chegando vazio?
- [ ] Há mismatch entre nomes (ex: "doce-de-leite" vs "Doce de Leite")?
- [ ] O `cleanUtmValue` está funcionando (removendo ID após |)?
- [ ] Quantas vendas estão como "DIRETO"?
- [ ] Quais são os nomes exatos das campanhas Meta Ads?
- [ ] Quais são os nomes exatos dos utm_campaign nos orders?

---

## 🔧 Possível Solução (Se ID em UTM for o Problema)

Se o problema for que `utm_campaign` vem assim:
```
"Doce de Leite|12345"  ou  "Doce%20de%20Leite%7C12345"
```

O `cleanUtmValue` deve extrair apenas `"Doce de Leite"`:

```typescript
const cleanUtmValue = (raw: string): string => {
  try {
    // 1. Decodificar URL
    const decoded = decodeURIComponent(raw)
    console.log(`[Debug] raw="${raw}" → decoded="${decoded}"`)

    // 2. Extrair antes do pipe
    const beforePipe = decoded.split('|')[0].trim()
    console.log(`[Debug] beforePipe="${beforePipe}"`)

    return beforePipe || 'Direto'
  } catch (e) {
    console.error(`[Debug] Error in cleanUtmValue for "${raw}":`, e)
    return raw.split('|')[0].trim() || 'Direto'
  }
}
```

---

## 📚 Referências

- `src/services/metrics.ts` — Função `calculateCampaignMetrics`
- `src/services/metrics.ts` — Função `cleanUtmValue`
- `src/services/metrics.ts` — Função `normalizeCampaignName`

---

**Status:** 🟡 DEBUG ATIVO — Aguardando logs do navegador para análise
