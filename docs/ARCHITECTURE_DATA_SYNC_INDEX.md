# Índice — Arquitetura de Sincronização de Dados

**Documento:** ARCHITECTURE_DATA_SYNC.md  
**Versão:** 1.0  
**Data:** 2026-02-20  
**Tamanho:** 605 linhas / 19 KB

---

## Navegação Rápida

### Para Lideranças
- **Problema Original** (por que isso era um problema?)
  - Sem persistência
  - utm_campaign undefined
  - Sem histórico

- **Solução Implementada** (o que foi feito?)
  - RPC Functions sincronizam dados
  - Persistência em PostgreSQL
  - Extração inteligente de UTM

- **Diferenças: Antes vs. Depois** (tabela comparativa)
  - Resumo visual das mudanças

### Para Desenvolvedores Frontend

1. **Integração Frontend** (seção 5)
   - Opção 1: Sincronizar antes de cada query (RECOMENDADO)
   - Opção 2: Sincronizar manualmente (botão)
   - Opção 3: Queries SQL diretas no frontend

2. **Estratégia de Fallback** (seção 6)
   - Tentativas em ordem
   - Código TypeScript pronto

3. **Exemplos de Código**
   - `fetchOrdersWithSync()` — Função principal
   - `syncOrdersManual()` — Botão "Atualizar"
   - `getOrdersByUTMCampaign()` — Queries custom
   - `SyncButton()` — Componente React

### Para Database Engineers / DBAs

1. **Fluxo de Dados Completo** (seção 2)
   - Diagrama com 4 níveis
   - Descrição de cada etapa

2. **Sincronização de Pedidos** (seção 3.1)
   - Função RPC `sync_orders_to_cache()`
   - Estrutura de `orders_cache` (28 campos)
   - Extração de UTM (helper `extract_utm_param()`)
   - Índices criados

3. **Sincronização de Campanhas Meta** (seção 3.2)
   - Função RPC `sync_meta_to_cache()`
   - Estrutura de `meta_campaigns_cache` (15 campos)
   - Deduplicação strategy

4. **Performance e Índices** (seção 7)
   - Lista de índices
   - Queries otimizadas
   - Estimativas de storage

5. **Logs de Sincronização** (seção 8)
   - Tabela `sync_logs`
   - Como ler histórico de sincronizações

### Para DevOps / Deployment

1. **Frequência de Sincronização** (seção 4)
   - Recomendação: HÍBRIDA
   - Histórico: 1x/dia
   - Hoje: 4x/dia
   - On-demand: Botão no UI

2. **Roadmap de Implementação** (seção 10)
   - Fase 1: Deploy (FEITO)
   - Fase 2-4: Próximas tarefas

### Para Product / Analytics

1. **Problema Original** (seção 1)
   - Campanhas não identificadas
   - Impossível fazer análises históricas

2. **Solução Implementada** (seção 2)
   - Identificação de campanhas
   - Histórico consultável
   - Análises em tempo real

3. **Frequência de Sincronização** (seção 4)
   - Por que cada frequência?
   - Trade-offs explicados

---

## Seções Principais

1. **Problema Original** (1 página)
   - Fluxo anterior e seus problemas

2. **Solução Implementada** (1 página)
   - Novo fluxo com 4 níveis
   - Diagrama ASCII completo

3. **Fluxo de Dados Completo** (4 páginas)
   - 3.1 Sincronização de Pedidos
   - 3.2 Sincronização de Campanhas Meta
   - Estrutura de dados detalhada
   - Helper functions

4. **Frequência de Sincronização** (1 página)
   - Recomendação HÍBRIDA
   - Rationale para cada frequência

5. **Como Integrar no Frontend** (3 páginas)
   - Opção 1: Sync automático (RECOMENDADO)
   - Opção 2: Sync manual
   - Opção 3: Queries SQL diretas
   - Código TypeScript completo
   - Componente React exemplo

6. **Estratégia de Fallback** (1 página)
   - 3 passos de fallback
   - Código TypeScript
   - Logging para debug

7. **Performance e Índices** (2 páginas)
   - Índices criados
   - Queries recomendadas
   - Estimativas de storage
   - Particionamento futuro

8. **Logs de Sincronização** (1 página)
   - Tabela `sync_logs`
   - Exemplo de query de histórico

9. **Diferenças: Antes vs. Depois** (1 página)
   - Tabela comparativa
   - 10 aspectos diferentes

10. **Roadmap de Implementação** (1 página)
    - 4 fases descritas
    - Checkbox para cada tarefa

11. **Referências** (1 página)
    - Arquivos relacionados
    - Caminhos absolutos

12. **FAQ** (1 página)
    - 7 perguntas comuns
    - Respostas técnicas

---

## Busca Rápida

### Procurando por:

**"Como fazer sync"**
→ Seção 5: Como Integrar no Frontend → fetchOrdersWithSync()

**"utm_campaign"**
→ Seção 3.1: Sincronização de Pedidos (extração inteligente)

**"Frequência de sincronização"**
→ Seção 4: Frequência de Sincronização

**"Estrutura de dados"**
→ Seção 3: Fluxo de Dados → Orders_cache e meta_campaigns_cache

**"Índices de banco"**
→ Seção 7: Performance e Índices

**"Fallback"**
→ Seção 6: Estratégia de Fallback

**"Código exemplo"**
→ Seção 5: Como Integrar no Frontend (TypeScript + React)

**"FAQ"**
→ Seção 12: FAQ (7 perguntas respondidas)

**"Roadmap"**
→ Seção 10: Roadmap de Implementação (4 fases)

---

## Dicas de Leitura

### Para leitura rápida (15 minutos):
1. Problema Original
2. Solução Implementada
3. Frequência de Sincronização
4. Diferenças: Antes vs. Depois

### Para implementação (30 minutos):
1. Como Integrar no Frontend
2. Estratégia de Fallback
3. Exemplos de Código
4. FAQ

### Para compreensão técnica completa (60 minutos):
1. Leia na ordem apresentada
2. Revise seções de Performance
3. Estude o Roadmap
4. Abra arquivos relacionados em paralelo

### Para revisão gerencial (10 minutos):
1. Problema Original
2. Solução Implementada (diagrama)
3. Frequência de Sincronização
4. Roadmap de Implementação

---

## Arquivos Relacionados no Repositório

Para aprofundamento técnico:

```
/root/aios-workspace/provincia-real/

supabase/migrations/
├─ 20260219000001_cache_tables.sql          ← Tabelas orders_cache + meta_campaigns_cache
├─ 20260219000003_sync_functions.sql        ← RPC Functions sync_orders_to_cache()
├─ 20260219000005_analytics_views.sql       ← Views para análises
└─ MIGRATIONS_COMBINED.sql                  ← Todas as migrations

src/services/
└─ api.ts                                    ← Funções a serem implementadas

src/types/
└─ index.ts                                  ← Tipos TypeScript (NuvemshopOrder, etc.)

docs/
├─ TIMEZONE_LOGIC.md                         ← Contexto de timezone (America/Sao_Paulo)
├─ EDGE_FUNCTIONS_SETUP.md                   ← Edge functions relacionadas
└─ ARCHITECTURE_DATA_SYNC.md                 ← Este documento
```

---

## Checklist de Compreensão

Após ler o documento:

- [ ] Entendo por que a solução anterior não funcionava
- [ ] Entendo o fluxo de dados correto (API → RPC → Cache → Frontend)
- [ ] Entendo como `utm_campaign` é extraído (3 fontes)
- [ ] Entendo a frequência de sincronização (HÍBRIDA)
- [ ] Consigo implementar `fetchOrdersWithSync()` no frontend
- [ ] Entendo a estratégia de fallback
- [ ] Consigo escrever queries SQL no frontend
- [ ] Entendo os índices criados e por que são necessários
- [ ] Sei qual é o próximo passo (Fase 2: Integração Frontend)

---

## Suporte Técnico

Para dúvidas:

1. **Sobre fluxo de dados?**
   → Seção 2: Solução Implementada (com diagrama)

2. **Sobre código?**
   → Seção 5: Como Integrar no Frontend (TypeScript examples)

3. **Sobre estrutura de dados?**
   → Seção 3: Fluxo de Dados (orders_cache + meta_campaigns_cache)

4. **Sobre performance?**
   → Seção 7: Performance e Índices

5. **Sobre próximos passos?**
   → Seção 10: Roadmap de Implementação

6. **Perguntas comuns?**
   → Seção 12: FAQ

---

**Última atualização:** 2026-02-20  
**Status:** Pronto para produção
