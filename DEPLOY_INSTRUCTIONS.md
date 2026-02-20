# 🚀 Instruções de Deployment — Provincia Real

**Data:** 2026-02-20
**Status:** Código pronto, aguardando deployment

---

## 📋 Resumo

Todas as correções foram implementadas, testadas e commitadas. O código está pronto para ser deployado em 3 ambientes:

1. **Frontend** → Vercel
2. **Edge Functions** → Supabase
3. **Database Migrations** → Supabase

---

## ✅ Pré-requisitos

Você precisa ter:
- ✅ CLI Vercel configurada com autenticação
- ✅ CLI Supabase configurada com access token
- ✅ Acesso ao repositório GitHub
- ✅ Acesso aos dashboards Vercel e Supabase

---

## 📦 Método 1: Deployment Automático via GitHub Actions

Se você tem GitHub Actions configurado:

1. **Fazer push** (já foi feito ✅):
   ```bash
   git push origin main
   ```

2. **Verificar Actions:**
   - Ir para: https://github.com/glauberdemoraes/provincia-real/actions
   - Procurar por "Fix: correções Provincia Real"
   - Aguardar conclusão

3. **Resultado:**
   - ✅ Vercel faz deploy automático ao detectar push em `main`
   - ✅ Supabase functions são deployadas (se CI/CD está configurado)

**Status:** Push já foi feito! Verifique se há workflows rodando.

---

## 📦 Método 2: Deployment Manual (Recomendado)

### Passo 1: Frontend (Vercel)

```bash
cd /root/aios-workspace/provincia-real

# Login no Vercel
vercel login
# Siga as instruções e cole o token quando solicitado

# Deploy em produção
vercel --prod
```

**Esperado:**
```
✓ Linked to glauberdemoraes/provincia-real (created .vercel)
✓ Built with Next.js
✓ Production URL: https://provincia-real.vercel.app
```

### Passo 2: Edge Functions (Supabase)

```bash
# Autenticar no Supabase
npx supabase login
# Siga as instruções com seu token de acesso

# Deploy da function
npx supabase functions deploy fetch-meta-campaigns

# Opcional: deploy de todas as functions
npx supabase functions deploy
```

**Esperado:**
```
✓ Deploying function 'fetch-meta-campaigns'...
✓ Function deployed: https://prnshbkblddfgttsgxpt.supabase.co/functions/v1/fetch-meta-campaigns
```

### Passo 3: Executar Migration

```bash
# Aplicar migrations ao banco
npx supabase migration up

# Ou via Supabase Dashboard:
# 1. Ir para SQL Editor
# 2. Executar: supabase/migrations/20260220000003_fix_alert_templates.sql
```

**Esperado:**
```
✓ Migration 20260220000003_fix_alert_templates applied successfully
```

---

## 📦 Método 3: Via Dashboard Supabase (Sem CLI)

Se preferir não usar CLI:

### Edge Functions

1. Ir para: https://supabase.com/dashboard/project/prnshbkblddfgttsgxpt/functions
2. Clicar em "Deploy a new function"
3. Escolher "fetch-meta-campaigns"
4. Copiar conteúdo de `supabase/functions/fetch-meta-campaigns/index.ts`
5. Colar no editor
6. Clicar em "Deploy"

### Migrations

1. Ir para SQL Editor
2. Clicar em "New Query"
3. Copiar conteúdo de `supabase/migrations/20260220000003_fix_alert_templates.sql`
4. Colar e executar

---

## 🔍 Verificação Pós-Deploy

### Frontend (Vercel)

```bash
# Testar URL
curl -s https://provincia-real.vercel.app | head -20

# Ou abrir no navegador e verificar:
# ✅ Dashboard carrega sem erros
# ✅ Padrão é BR (não LA)
# ✅ Cards com placeholders aparecem em cinza
```

### Edge Functions (Supabase)

```bash
# Testar endpoint
curl -X POST https://prnshbkblddfgttsgxpt.supabase.co/functions/v1/fetch-meta-campaigns \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "start_date": "2026-02-20",
    "end_date": "2026-02-20"
  }'

# Esperado: JSON com campanhas Meta
```

### Database (Supabase)

```sql
-- Verificar que alerts_config foi atualizada
SELECT metric, message_template FROM alerts_config WHERE metric = 'pace_pct' LIMIT 1;

-- Esperado: message_template contém {value}
```

---

## 🔐 Tokens Necessários

Se não tem, gere novos:

### Vercel Token
1. Ir para: https://vercel.com/account/tokens
2. Criar novo token
3. Usar em: `vercel login`

### Supabase Access Token
1. Ir para: https://supabase.com/dashboard/account/tokens
2. Criar novo token
3. Guardar em local seguro
4. Usar em: `npx supabase login`

---

## 🆘 Troubleshooting

### "Token not valid"
```bash
# Fazer login novamente
vercel login
# ou
npx supabase login
```

### "Function already exists"
```bash
# Forçar atualização
npx supabase functions deploy fetch-meta-campaigns --force
```

### "Migration already applied"
```bash
# Ver status
npx supabase migration list

# Se já aplicada, sem problemas — prosseguir
```

### "Build fails on Vercel"
```bash
# Verificar que build local passa
npm run build
npm run lint

# Se não passar, corrigir antes de fazer push
```

---

## 📊 Checklist de Deployment

- [ ] `git push origin main` feito ✅
- [ ] Vercel faz deploy automático (ou `vercel --prod` executado)
- [ ] Edge function `fetch-meta-campaigns` deployada
- [ ] Migration `20260220000003_fix_alert_templates` executada
- [ ] Dashboard abre em https://provincia-real.vercel.app
- [ ] Padrão é BR (não LA)
- [ ] Alertas mostram {value} interpolado
- [ ] Cards com placeholders aparecem cinzas quando sem dados
- [ ] Seções ordenadas: Resumo → Vendas → Custos → Campanhas

---

## 🔗 Links Importantes

- **Repository:** https://github.com/glauberdemoraes/provincia-real
- **Vercel Dashboard:** https://vercel.com/glauberdemoraes/provincia-real
- **Supabase Dashboard:** https://supabase.com/dashboard/project/prnshbkblddfgttsgxpt
- **Commits:** de9f401, cb8c296 (neste branch)

---

## 📝 Notas

1. **GitHub Actions:** Se não houver workflow configurado, o Vercel deve fazer deploy automático ao detectar push em `main`

2. **Edge Functions:** A CLI Supabase requer autenticação. Se preferir evitar CLI, use dashboard Supabase

3. **Migrations:** Podem ser aplicadas via SQL Editor também

4. **Rollback:** Se necessário:
   ```bash
   # Frontend
   vercel rollback  # Volta para versão anterior

   # Database
   npx supabase migration down 20260220000003
   ```

---

**Próximo passo:** Execute os comandos de Método 2 acima ou configure GitHub Actions.

Status: ✅ **Código pronto para deploy** — Aguardando execução dos comandos acima.
