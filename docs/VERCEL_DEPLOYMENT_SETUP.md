# Configuração de Deploy Automático na Vercel

## 📋 Resumo

Este documento descreve como configurar o deploy automático na Vercel via GitHub Actions. O workflow está configurado em `.github/workflows/deploy-vercel.yml` e executará automaticamente a cada push para `main`.

---

## 🚀 Como Configurar

### Passo 1: Obter Tokens da Vercel

1. **Acesse Vercel Dashboard:** https://vercel.com/dashboard
2. **Gere um Token:**
   - Vá para **Settings** → **Tokens**
   - Clique em **Create** (ou **Generate New Token**)
   - Nome: `GitHub Actions`
   - Copie o token (exemplo: `xxxxxxxxxxxxx`)

3. **Encontre seu Org ID e Project ID:**
   - Na dashboard, abra o projeto "provincia-real"
   - URL será: `https://vercel.com/{org-name}/provincia-real`
   - Copie o `{org-name}` - este é o ORG_ID

   - No projeto, vá para **Settings** → **General**
   - Procure por "Project ID" e copie

### Passo 2: Adicionar Secrets no GitHub

1. **Acesse GitHub Repository:**
   - https://github.com/glauberdemoraes/provincia-real
   - Clique em **Settings** (aba superior)
   - Sidebar: **Secrets and variables** → **Actions**

2. **Crie 3 Secrets:**

   **Secret 1: VERCEL_TOKEN**
   - Name: `VERCEL_TOKEN`
   - Value: `(token copiado do passo 1)`

   **Secret 2: VERCEL_ORG_ID**
   - Name: `VERCEL_ORG_ID`
   - Value: `(seu org-name ou user-id)`

   **Secret 3: VERCEL_PROJECT_ID**
   - Name: `VERCEL_PROJECT_ID`
   - Value: `(project-id copiado do passo 1)`

3. **Clique em "Add secret"** para cada um

---

## ✅ Como Funciona

### Workflow Automático

```
Push para main
    ↓
GitHub Actions dispara
    ↓
Quality Gates (lint, typecheck, build)
    ↓
Se PASS → Deploy para Vercel (production)
Se FAIL → Bloqueia deploy
```

### Verificar Status

1. **No GitHub:**
   - Vá para **Actions**
   - Veja o status do workflow "Deploy to Vercel"

2. **Na Vercel:**
   - Dashboard → provincia-real
   - Veja "Deployments" para confirm deploy bem-sucedido

---

## 🔧 Detalhes do Workflow

**Arquivo:** `.github/workflows/deploy-vercel.yml`

**Triggers:**
- ✅ Push para `main`
- ✅ Pull requests para `main` (testa mas não deploya)

**Jobs:**
1. **quality-gates** - Roda lint, typecheck, build
2. **deploy** - Deploy na Vercel (apenas em push para main)

**Timeouts:**
- Cada job: ~5-10 minutos

---

## 🚨 Troubleshooting

### ❌ "Workflow failed: Secret not found"
**Solução:**
- Verifique se os 3 secrets foram adicionados corretamente
- Nomes devem ser EXATOS (case-sensitive):
  - `VERCEL_TOKEN`
  - `VERCEL_ORG_ID`
  - `VERCEL_PROJECT_ID`

### ❌ "Deployment failed: Invalid token"
**Solução:**
- Verifique se o token da Vercel está correto
- Gere um novo token no Vercel Dashboard

### ❌ "Quality gates failed"
**Solução:**
- Verifique o erro no log do GitHub Actions
- Corrija o código localmente
- Faça novo push

### ✅ "Deployment successful"
- Acesse seu URL da Vercel para verificar as mudanças

---

## 📊 Monitoramento

### GitHub Actions Dashboard
```
https://github.com/glauberdemoraes/provincia-real/actions
```

### Vercel Dashboard
```
https://vercel.com/dashboard/provincia-real
```

---

## 🔄 Fluxo de Desenvolvimento

1. **Desenvolvimento local** → `git push origin main`
2. **GitHub Actions** → Executa quality gates
3. **Se PASS** → Vercel faz deploy automático
4. **App updated** → Acessível em production URL

---

## 📝 Variáveis de Ambiente (se necessário)

Se seu projeto precisa de variáveis de ambiente em produção:

1. **Na Vercel Dashboard:**
   - Projeto → **Settings** → **Environment Variables**
   - Adicione as variáveis

2. **Ou via CLI:**
   ```bash
   vercel env add CHAVE_VARIAVEL valor
   ```

---

## 🎯 Próximos Passos

1. ✅ Configure os 3 secrets no GitHub
2. ✅ Faça um push de teste (ou use o último commit)
3. ✅ Acompanhe em GitHub Actions / Vercel Dashboard
4. ✅ Verifique a URL de produção

---

**Versão:** 1.0
**Criado em:** 2026-02-20
**Framework:** Vite + React
**Platform:** Vercel
