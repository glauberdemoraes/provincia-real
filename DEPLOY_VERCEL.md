# Deploy na Vercel — Cockpit Província Real

## 🎯 Status: Pronto para Deploy

- ✅ GitHub: https://github.com/glauberdemoraes/provincia-real
- ✅ Main branch pronto
- ✅ Build: Testado e funcional

---

## 🚀 Deploy em 3 Passos

### Passo 1: Abrir Vercel Dashboard
1. Ir para https://vercel.com/new
2. Logar com conta glauberdemoraes@gmail.com
3. Selecionar "Import Project"
4. Colar: `https://github.com/glauberdemoraes/provincia-real`

### Passo 2: Configurar Variáveis de Ambiente
Na tela "Configure Project", adicionar:

```
VITE_SUPABASE_URL=https://prnshbkblddfgttsgxpt.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybnNoYmtibGRkZmd0dHNneHB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MzE1MTAsImV4cCI6MjA4NTMwNzUxMH0.HPUfckX6OfqbWu1MvZIs0bZaYRf58n84MRCrpRk-7og
VITE_DAILY_REVENUE_TARGET=5000
VITE_POTE_UNIT_COST=16
VITE_BARRA_UNIT_COST=8
```

### Passo 3: Deploy
- Clicar "Deploy"
- Aguardar build (2-3 min)
- 🎉 App ao vivo!

---

## 📱 Seu App Estará Em

Após deploy: `https://provincia-real.vercel.app/`

(Vercel gera URL automática, mas você pode customizar depois)

---

## ⚙️ Configuração Pós-Deploy

### Auto-Deploy
- ✅ Ativado por padrão
- Toda vez que você fizer push em `main`, Vercel faz deploy automático

### Domínio Customizado (Opcional)
- Vercel Dashboard → Settings → Domains
- Adicionar seu domínio

### Environment Variables (Depois)
- Vercel Dashboard → Settings → Environment Variables
- Já está tudo pronto

---

## 🔍 Troubleshooting

### "Build failed"
- Verificar build log em Vercel Dashboard
- Confirmar env vars estão corretas

### "Cannot find module '@/'"
- Já está configurado no `tsconfig.app.json`
- Se erro persiste, fazer push novamente (Vercel reconstrói)

### "Blank page"
- Abrir DevTools (F12) → Console
- Verificar erros de Supabase connection
- Confirmar `.env.local` não está no repo (security)

---

## 📝 Após Deploy

1. **Testar Dashboard** — Acessar `/dashboard`
   - Theme toggle (dark/light)
   - Timezone toggle (LA/BR)
   - Alertas (vai mostrar quando Supabase migrations estiverem rodando)

2. **Testar outras rotas**
   - `/realtime` — Modo TV (em construção)
   - `/history` — Tendências (em construção)
   - `/settings` — Configurações (em construção)

3. **Aplicar Migrações SQL** — Depois disso, alertas funcionarão!
   - Ver `SETUP.md` para instruções

---

## 🔐 Segurança

- ✅ `.env.local` está no `.gitignore` (não será commitado)
- ✅ Variáveis sensíveis no Vercel Dashboard (nunca no repo)
- ✅ Supabase anon key é pública (protegida por RLS)
- ⚠️ Tokens NuvemShop/Meta ainda hardcoded no Supabase (use Vault depois)

---

Tudo pronto! 🚀 Faça o deploy e me avisa quando estiver ao vivo!
