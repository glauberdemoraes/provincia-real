# 📊 Design de KPIs — Provincia Real

**Data:** 2026-02-20
**Status:** Design Phase (aprovação necessária)

---

## 📋 Visão Geral

5 grupos de KPIs totalizando **20+ métricas** para monitorar a saúde do negócio.

### Matriz de Viabilidade

| Grupo | Total KPIs | Implementável Agora | Requer Dados Novos | Prioridade |
|-------|-----------|-------------------|------------------|-----------|
| 1. Tração (Vendas) | 7 | 4 | 3 (SKU, conversion) | 🔴 Crítica |
| 2. Lucratividade | 5 | 3 | 2 (MCU, breakeven) | 🔴 Crítica |
| 3. Marketing | 5 | 2 | 3 (CPA, conversion, organic) | 🟡 Alta |
| 4. Retenção (LTV) | 5 | 1 | 4 (customer_id, repeat) | 🟡 Alta |
| 5. Logístico-Financeiro | 3 | 2 | 1 (shipment costs) | 🟢 Média |
| **TOTAL** | **25** | **12** | **13** | — |

---

## 🔴 Grupo 1: Indicadores de Tração (Vendas e Crescimento)

### Kpis Implementáveis AGORA (4)

#### 1.1 Faturamento Bruto
```sql
SELECT SUM(total) AS faturamento_bruto
FROM orders_cache
WHERE order_created_at BETWEEN ? AND ?;
```
- **Unidade:** BRL
- **Meta:** R$ 5.000/dia
- **Implementação:** ✅ Imediata (dados em orders_cache)

#### 1.2 Faturamento Líquido
```sql
SELECT SUM(total) - SUM(coalesce(shipping_cost_owner, 0))
  - (faturamento_bruto * 0.023)  -- taxa gateway 2,3%
FROM orders_cache
WHERE order_created_at BETWEEN ? AND ? AND payment_status = 'paid';
```
- **Unidade:** BRL
- **Meta:** R$ 4.500/dia (faturamento_bruto - 10%)
- **Implementação:** ✅ Imediata (com constante taxa gateway)

#### 1.3 Volume de Pedidos
```sql
SELECT COUNT(*) AS total_pedidos
FROM orders_cache
WHERE order_created_at BETWEEN ? AND ? AND payment_status = 'paid';
```
- **Unidade:** Quantidade
- **Meta:** 50 pedidos/dia
- **Implementação:** ✅ Imediata

#### 1.4 Ticket Médio (AOV)
```sql
SELECT AVG(total) AS ticket_medio
FROM orders_cache
WHERE order_created_at BETWEEN ? AND ? AND payment_status = 'paid';
```
- **Unidade:** BRL
- **Meta:** R$ 100/pedido
- **Implementação:** ✅ Imediata

### KPIs Requerem Dados Novos (3)

#### 1.5 Taxa de Conversão do Site/Canal ❌
```sql
-- PRECISA: Google Analytics data ou visitor tracking
SELECT
  (paid_orders::NUMERIC / total_visitors) * 100 AS conversion_rate_pct
FROM analytics_data;
```
- **Unidade:** %
- **Meta:** 2-5% (variar por canal)
- **Dados Necessários:**
  - `analytics_events` table (Google Analytics API)
  - `utm_source` (já temos!)
- **Estimado:** 2 semanas integração

#### 1.6 Mix de Receita por SKU ❌
```sql
-- PRECISA: products table com SKU e categoria
SELECT
  product_sku,
  SUM(total) / (SELECT SUM(total) FROM orders_paid) * 100 AS revenue_mix_pct
FROM order_items oi
JOIN products p ON oi.product_id = p.id
WHERE payment_status = 'paid'
GROUP BY product_sku;
```
- **Unidade:** %
- **Exemplo:** 60% Potes 680g, 40% Barras 200g
- **Dados Necessários:**
  - `products` table (SKU, nome, categoria)
  - `order_items` table (item-level, não apenas total)
- **Estimado:** 1 semana

#### 1.7 Performance de Kits (Upsell) ❌
```sql
-- PRECISA: Rastreamento de combo/kit nos products
SELECT
  COUNT(*) FILTER (WHERE is_kit = true) AS orders_com_kit,
  COUNT(*) FILTER (WHERE is_kit = false) AS orders_unitarios,
  (COUNT(*) FILTER (WHERE is_kit) / COUNT(*))::numeric * 100 AS kit_penetration_pct
FROM order_items
WHERE payment_status = 'paid';
```
- **Unidade:** %
- **Meta:** 40%+ de kit penetration
- **Dados Necessários:**
  - Flag `is_kit` em products ou order_items
- **Estimado:** 3 dias

---

## 💰 Grupo 2: Indicadores de Lucratividade

### Implementáveis AGORA (3)

#### 2.1 Margem de Contribuição Total (MCT)
```sql
SELECT
  SUM(total) -
  SUM(coalesce(shipping_cost_owner, 0)) -
  (SUM(total) * 0.023) -  -- gateway fee
  (COUNT(*) * 4)  -- R$4 embalagem/rótulo (constante)
FROM orders_cache
WHERE order_created_at BETWEEN ? AND ? AND payment_status = 'paid';
```
- **Unidade:** BRL
- **Meta:** R$ 3.000/dia
- **Implementação:** ✅ Imediata (com constantes)
- **Nota:** Usa custo fixo de R$4/unit até ter dados de COGS reais

#### 2.2 Margem Líquida (%)
```sql
SELECT
  (MCT / SUM(total)) * 100 AS margem_liquida_pct
FROM orders_cache
WHERE payment_status = 'paid';
```
- **Unidade:** %
- **Meta:** 20-25%
- **Implementação:** ✅ Derivada de MCT

#### 2.3 ROI de Produto
```sql
SELECT
  (gross_profit - product_cost) / product_cost * 100 AS roi_pct
-- Onde: gross_profit = vendas_pagas - custos_operacionais
--       product_cost = SUM(unit_cost * quantity) do produtor
```
- **Unidade:** %
- **Meta:** 200%+ (3x retorno)
- **Implementação:** ✅ Possível com COGS atual (~R$15/unit estimado)

### Requerem Dados Novos (2)

#### 2.4 Margem de Contribuição Unitária (MCU) ❌
```sql
-- PRECISA: Custo real de produção por item
SELECT
  product_sku,
  AVG(sale_price - product_cost - 4) AS mcu_media  -- 4 = embalagem
FROM order_items
WHERE payment_status = 'paid'
GROUP BY product_sku;
```
- **Unidade:** BRL/unit
- **Target:** MCU 30-50 por unit
- **Dados Necessários:** `product_cost` na tabela products
- **Estimado:** 1 semana

#### 2.5 Breakeven Point ❌
```sql
-- PRECISA: Custo fixo mensal (aluguel, pessoal, etc)
SELECT
  CEIL(fixed_costs / avg_mcu) AS units_to_breakeven
FROM (
  SELECT
    5000 AS fixed_costs,  -- exemplo: R$5k/mês
    AVG(sale_price - product_cost - 4) AS avg_mcu
  FROM order_items
);
```
- **Unidade:** Unidades/mês
- **Implementação:** Requer custo fixo mensal
- **Estimado:** 3 dias (com dados)

---

## 📈 Grupo 3: Indicadores de Marketing (Aquisição)

### Implementáveis AGORA (2)

#### 3.1 ROAS (Return on Ad Spend) ✅ (já existe!)
```sql
SELECT
  SUM(total) / SUM(spend) AS roas
FROM orders_cache oc
JOIN meta_campaigns_cache mcc ON oc.utm_campaign = mcc.campaign_name
WHERE oc.payment_status = 'paid'
GROUP BY campaign_name;
```
- **Unidade:** x (multiplicador)
- **Meta:** 4.0x+
- **Status:** ✅ Dashboard (melhorar visualização)

#### 3.2 Participação de Tráfego Orgânico
```sql
SELECT
  COUNT(*) FILTER (WHERE utm_source IS NULL) AS direct_orders,
  COUNT(*) AS total_orders,
  (COUNT(*) FILTER (WHERE utm_source IS NULL)::numeric / COUNT(*)) * 100 AS organic_pct
FROM orders_cache
WHERE payment_status = 'paid';
```
- **Unidade:** %
- **Meta:** 20%+ (crescimento esperado)
- **Implementação:** ✅ Imediata (NULL utm_source = organic)

### Requerem Dados Novos (3)

#### 3.3 CAC (Custo de Aquisição de Cliente) ❌
```sql
-- PRECISA: Rastreamento de customer_id único
SELECT
  SUM(ad_spend) / COUNT(DISTINCT customer_id_first_purchase) AS cac
FROM ad_spend_by_campaign
JOIN customer_first_order ON ...;
```
- **Unidade:** BRL/customer
- **Target:** CAC < R$50
- **Dados:**
  - `customers` table (customer_id único)
  - Rastreamento de "primeira compra"
- **Estimado:** 2 semanas

#### 3.4 CPA (Custo por Ação) ❌
```sql
-- Diferentes actions: addtocart, checkout, purchase
SELECT
  SUM(spend) / COUNT(*) FILTER (WHERE action = 'purchase') AS cpa_purchase
FROM meta_campaigns_cache;
```
- **Unidade:** BRL/ação
- **Requer:** Meta Ads API com event breakdown
- **Estimado:** 1 semana

#### 3.5 CPM e CPC ❌
```sql
-- Já temos parcialmente em meta_campaigns_cache (cpc, cpm calculado)
-- Mas falta granularidade por ad_set, creative
SELECT campaign_name, cpm, cpc FROM meta_campaigns_cache;
```
- **Unidade:** CPM = BRL/1000imp, CPC = BRL/clique
- **Dados:** Já em meta_campaigns_cache!
- **Implementação:** ✅ 2 dias (apenas visualização)

---

## 👥 Grupo 4: Indicadores de Retenção (Valor Vitalício)

### Implementável AGORA (1)

#### 4.1 Participação de Clientes Únicos
```sql
SELECT COUNT(DISTINCT billing_name) AS unique_customers FROM orders_cache;
```
- **Unidade:** Quantidade
- **Implementação:** ✅ Imediata

### Requerem Dados Novos (4)

#### 4.2 LTV (Lifetime Value) ❌
```sql
-- PRECISA: customer_id único + histórico completo
SELECT
  customer_id,
  SUM(total) FILTER (WHERE payment_status = 'paid') AS ltv
FROM orders_cache
WHERE customer_id IN (SELECT DISTINCT customer_id FROM orders_cache)
GROUP BY customer_id
ORDER BY ltv DESC;
```
- **Unidade:** BRL
- **Meta:** LTV media > R$300
- **Dados:** `customers` table + customer_id em orders
- **Estimado:** 2 semanas

#### 4.3 Taxa de Recompra ❌
```sql
SELECT
  COUNT(DISTINCT customer_id) FILTER (WHERE purchase_count >= 2)
  / COUNT(DISTINCT customer_id) * 100 AS repeat_rate_pct
FROM customer_purchase_history;
```
- **Unidade:** %
- **Meta:** 20%+ (crescimento esperado)
- **Dados:** Rastreamento de repeats
- **Estimado:** 1 semana

#### 4.4 Churn de Clientes ❌
```sql
-- Clientes que compraram uma vez e nunca mais
SELECT
  COUNT(DISTINCT customer_id) FILTER (WHERE purchase_count = 1) AS churned_customers,
  COUNT(DISTINCT customer_id) AS total_customers
FROM customer_purchase_history;
```
- **Unidade:** %
- **Meta:** < 80% churn (40%+ retention)
- **Estimado:** 1 semana

#### 4.5 Frequência de Compra ❌
```sql
SELECT
  AVG(purchase_count) AS compras_per_customer_avg,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY purchase_count) AS compras_median
FROM customer_purchase_history;
```
- **Unidade:** Compras/semestre
- **Meta:** 2-3 compras por cliente por semestre
- **Estimado:** 1 semana

---

## 🚚 Grupo 5: Indicadores Logístico-Financeiros

### Implementáveis AGORA (2)

#### 5.1 Custo Total de Frete
```sql
SELECT SUM(shipping_cost_owner) AS total_shipping_cost
FROM orders_cache
WHERE order_created_at BETWEEN ? AND ? AND payment_status = 'paid';
```
- **Unidade:** BRL
- **Meta:** < 15% do faturamento
- **Implementação:** ✅ Imediata

#### 5.2 Custo de Gateway
```sql
SELECT SUM(total) * 0.023 AS gateway_costs  -- 2,3% Nuvemshop
FROM orders_cache
WHERE payment_status = 'paid';
```
- **Unidade:** BRL
- **Meta:** ~2,3% do faturamento
- **Implementação:** ✅ Imediata

### Requer Dados Novos (1)

#### 5.3 Take Rate de Frete ❌
```sql
-- Diferença: frete cobrado (customer) vs pago (logística)
SELECT
  SUM(shipping_charged_to_customer) - SUM(shipping_cost_owner) AS frete_profit,
  SUM(shipping_cost_owner) AS frete_cost
FROM order_shipping;
```
- **Unidade:** BRL / %
- **Implementação:** Requer rastreamento de frete separado
- **Estimado:** 1 semana

---

## 🎯 Proposta de Roadmap — Implementação em Fases

### ✅ Fase 1: RÁPIDA (Semana 1)
**Implementar os 12 KPIs "prontos agora"**

Tempo: ~3-4 dias de desenvolvimento
Esforço: Criar SQL views + componentes React

```yaml
Views a criar:
  - vw_daily_metrics (faturamento, volume, ticket médio)
  - vw_profitability (MCT, margem líquida, ROI)
  - vw_channel_performance (ROAS por campanha, organic %)
  - vw_shipping_costs (custo total, % faturamento)

Componentes React:
  - KpiCard (exibir métrica + meta + status)
  - KpiTable (comparação período vs período)
  - KpiChart (série temporal)
```

### 🟡 Fase 2: ESTRUTURA DE DADOS (Semana 2)
**Adicionar 5 tabelas de suporte para ativar 13 KPIs restantes**

```sql
-- Novas tabelas necessárias:
CREATE TABLE customers (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  first_order_at TIMESTAMPTZ,
  lifetime_value NUMERIC
);

CREATE TABLE order_items (
  id UUID,
  order_id BIGINT,
  product_id UUID,
  quantity INTEGER,
  price NUMERIC
);

CREATE TABLE products (
  id UUID PRIMARY KEY,
  sku TEXT UNIQUE,
  name TEXT,
  category TEXT,
  cost NUMERIC,
  is_kit BOOLEAN
);

CREATE TABLE shipping_details (
  order_id BIGINT,
  charged_to_customer NUMERIC,
  actual_cost NUMERIC,
  carrier TEXT
);

CREATE TABLE analytics_events (
  event_id UUID,
  customer_id UUID,
  event_type TEXT (visit, addtocart, checkout, purchase),
  utm_source TEXT,
  timestamp TIMESTAMPTZ
);
```

### 🟢 Fase 3: IMPLEMENTAÇÃO COMPLETA (Semana 3-4)
**Criar últimos 13 KPIs + Dashboard Cockpit**

---

## 📊 Exemplo: Tabela de Comparação Estratégica (Para Cockpit)

```markdown
| Métrica | Valor Atual | Meta | Status | Ação |
|---------|-----------|-----|--------|------|
| Faturamento Diário | R$ 3.200 | R$ 5.000 | 🟡 64% | ↑ Aumentar ads |
| Margem Líquida | 18% | 25% | 🟡 Pode melhorar | ✓ Reduzir COGS |
| ROAS Geral | 4.2x | 4.0x | 🟢 Excelente | ✓ Manter |
| CAC | N/A | < R$50 | 🔴 Sem dados | Implementar tracking |
| LTV/CAC Ratio | N/A | 3.0x | 🔴 Sem dados | Implementar LTV |
| Churn | N/A | < 80% | 🔴 Sem dados | Implementar retenção |
| Ticket Médio | R$ 95 | R$ 100 | 🟡 95% | Oferecer upsell |
| Conversion Rate | N/A | 2-5% | 🔴 Sem dados | Integrar GA4 |
```

---

## 📝 Acceptance Criteria para Cada Fase

### Fase 1 ✅
- [ ] 12 KPIs visíveis no dashboard
- [ ] Cada KPI com histórico de 7 dias
- [ ] Comparação vs. meta configurável
- [ ] Alertas quando KPI < 80% da meta
- [ ] Documentação de fórmula para cada KPI

### Fase 2 🟡
- [ ] Schema expandido com 5 novas tabelas
- [ ] Migrations aplicadas
- [ ] ETL do NuvemShop → products/customers/order_items
- [ ] Testes de integridade de dados

### Fase 3 🟢
- [ ] 25 KPIs no Cockpit
- [ ] Filtro por período customizável
- [ ] Export para CSV
- [ ] Alertas inteligentes

---

## 🚀 Next Steps

1. **Aprovação deste design** ← Você aqui
2. **Fase 1:** Implementar 12 KPIs (~3 dias)
3. **Fase 2:** Estrutura de dados (~2 dias)
4. **Fase 3:** Completar restante (~4 dias)

**Total estimado:** 2-3 semanas para 100% dos KPIs.

---

*Documento: /docs/KPI_DESIGN.md*
*Autor: @dev (Dex - Builder)*
*Última atualização: 2026-02-20*
