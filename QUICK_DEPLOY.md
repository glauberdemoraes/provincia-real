# ⚡ Quick Deploy — Provincia Real

**Status:** ✅ Código pronto | ⏳ Aguardando deploy

---

## 🚀 Deploy em 3 Comandos

### Opção 1: Automático (Recomendado)
```bash
# Já feito! GitHub Actions detectará e fará deploy automático
git log --oneline -1  # Ver último commit: cb8c296
```

Aguardar:
1. GitHub Actions rodar
2. Vercel fazer deploy automático
3. Verificar em: https://github.com/glauberdemoraes/provincia-real/actions

---

### Opção 2: Manual (CLI)

```bash
cd /root/aios-workspace/provincia-real

# 1. Frontend (Vercel)
vercel login
vercel --prod

# 2. Edge Functions (Supabase)
npx supabase login
npx supabase functions deploy fetch-meta-campaigns

# 3. Database Migrations (Supabase)
npx supabase migration up
```

---

### Opção 3: Dashboard (Sem CLI)

#### Vercel
- URL: https://vercel.com/glauberdemoraes/provincia-real
- Ação: Será deployado automaticamente ao detectar novo push

#### Supabase Functions
- URL: https://supabase.com/dashboard/project/prnshbkblddfgttsgxpt/functions
- Ação: Criar nova function, copiar conteúdo de `supabase/functions/fetch-meta-campaigns/index.ts`

#### Supabase Migrations
- URL: https://supabase.com/dashboard/project/prnshbkblddfgttsgxpt/sql
- Ação: Novo query, copiar SQL de `supabase/migrations/20260220000003_fix_alert_templates.sql`

---

## ✅ Depois de Deployar

Verificar em: https://provincia-real.vercel.app

```bash
# Checklist
[ ] Dashboard carrega sem erros
[ ] Padrão timezone é BR (não LA)
[ ] Alertas mostram {value} interpolado
[ ] Cards com placeholders cinzas
[ ] Seções ordenadas: Resumo → Vendas → Custos → Campanhas
```

---

## 📚 Referências Rápidas

| Arquivo | Descrição |
|---------|-----------|
| `FIXES_IMPLEMENTED.md` | Resumo técnico das correções |
| `DEPLOY_INSTRUCTIONS.md` | Guia detalhado (68 páginas) |
| `docs/TIMEZONE_LOGIC.md` | Explicação do BR/LA proporcional |

---

## 🔗 Links

- **GitHub:** https://github.com/glauberdemoraes/provincia-real
- **Vercel:** https://vercel.com/glauberdemoraes/provincia-real
- **Supabase:** https://supabase.com/dashboard/project/prnshbkblddfgttsgxpt

---

**Status:** 🟢 Pronto para produção
