# Integração Nativa GitHub-Vercel (Automática)

## 📋 Resumo

Este é o método **mais simples e confiável** para fazer deploy automático na Vercel:
- ✅ Zero configuração de secrets
- ✅ Deploy automático a cada push
- ✅ Gerenciado direto pela Vercel
- ✅ Sem workflow complexo

---

## 🚀 Como Configurar (3 Passos)

### **Passo 1: Acesse Vercel Dashboard**

```
https://vercel.com/dashboard
```

---

### **Passo 2: Abra Projeto "provincia-real"**

1. Clique no projeto
2. Vá em **Settings** (aba superior)
3. Sidebar esquerda → **Git Integrations**

---

### **Passo 3: Conecte GitHub**

1. Se não estiver conectado, clique **"Connect Git Repository"**
2. Selecione GitHub
3. Autorize Vercel no GitHub
4. Procure e selecione: `glauberdemoraes/provincia-real`
5. Clique **"Connect"** ou **"Import"**

---

## ✅ Deploy Automático Ativado!

A partir de agora:

```
Push para main (GitHub)
    ↓
Vercel detecta mudança
    ↓
Build automático na Vercel
    ↓
Deploy para produção
    ↓
URL atualizada ✅
```

---

## 📊 Como Monitorar

### **GitHub Actions**
```
https://github.com/glauberdemoraes/provincia-real/actions
```
Status: Quality Gates (lint, typecheck, build)

### **Vercel Deployments**
```
https://vercel.com/dashboard/provincia-real
```
Status: Build, Preview, Production

---

## 🔄 Fluxo Completo

```
1. Desenvolvimento local
   ↓
2. git push origin main
   ↓
3. GitHub Actions (quality gates) - ~2 min
   ↓
4. Vercel (build + deploy) - ~1-2 min
   ↓
5. App atualizado em produção ✅
```

---

## 📝 Arquivo de Workflow

**Local:** `.github/workflows/deploy-vercel.yml`

**O que faz:**
- Executa linter (eslint)
- Executa typecheck (TypeScript)
- Executa build (Vite)

**Vercel faz o resto** (deploy automático)

---

## 🎯 Verificar Deployment

### **Passo 1: Fazer um push de teste**

```bash
git commit --allow-empty -m "test: verificar deployment"
git push origin main
```

### **Passo 2: Acompanhar no GitHub**

```
https://github.com/glauberdemoraes/provincia-real/actions
```

Espere pelo workflow "Quality Gates" completar.

### **Passo 3: Acompanhar na Vercel**

```
https://vercel.com/dashboard/provincia-real
```

Procure por "Deployments" e veja o status:
- 🔨 Building...
- ✅ Ready (deployment concluído)

### **Passo 4: Acessar App**

- **Production URL:** Veja em Vercel Dashboard > Deployments
- Deve ser algo como: `https://provincia-real.vercel.app`

---

## 🚨 Troubleshooting

### ❌ "Vercel não detecta mudanças"

**Solução:**
1. Verifique se o repositório está conectado em **Settings > Git Integrations**
2. Se não aparecer, clique **"Connect Repository"**
3. Selecione `glauberdemoraes/provincia-real`

### ❌ "Build falha na Vercel"

**Solução:**
1. Verifique se **Quality Gates passa** no GitHub Actions
2. Se passar no GitHub, mas falha na Vercel:
   - Abra o build log na Vercel Dashboard
   - Procure pelo erro específico
   - Corrija localmente e faça novo push

### ✅ "Deployment bem-sucedido"

Parabéns! Seu app está em produção automática.

---

## 📚 Recursos

- [Vercel Git Integration Docs](https://vercel.com/docs/deployments/git)
- [Vercel + GitHub](https://vercel.com/docs/concepts/git/vercel-for-github)
- [Production Deployments](https://vercel.com/docs/deployments/production)

---

## 🎉 Benefícios

| Feature | Status |
|---------|--------|
| **Deploy automático** | ✅ Sim |
| **Preview PRs** | ✅ Sim (automático) |
| **Rollback fácil** | ✅ Dashboard Vercel |
| **SSL/HTTPS** | ✅ Automático |
| **CDN global** | ✅ Automático |
| **Analytics** | ✅ Vercel Dashboard |

---

**Versão:** 1.0
**Método:** Integração Nativa GitHub-Vercel
**Status:** ✅ Ativo
**Data:** 2026-02-20
