# Configuração Tailwind v4 - Provincia Real

## ✅ Solução Confirmada

Esta documentação descreve a configuração correta do **Tailwind CSS v4.2.0** com **@tailwindcss/postcss** para o projeto Provincia Real.

**Última atualização:** 2026-02-20
**Status:** ✅ Funcionando 100% - CSS compila completo (24.26 kB)

---

## 📋 Requisitos

```json
{
  "dependencies": {
    "@tailwindcss/postcss": "^4.2.0"
  },
  "devDependencies": {
    "tailwindcss": "^4.2.0",
    "postcss": "^8.5.6",
    "@vitejs/plugin-react": "^5.1.1",
    "vite": "^7.3.1"
  }
}
```

---

## 🔧 Configuração Necessária

### 1. **postcss.config.js**
```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
```

**Nota:** Usar `@tailwindcss/postcss` e NÃO `tailwindcss` sozinho.

### 2. **src/index.css**
```css
@import "tailwindcss";

* {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

html {
  scroll-behavior: smooth;
}

/* ... resto dos estilos customizados ... */
```

**Nota:** Usar `@import "tailwindcss"` (sintaxe v4), NÃO `@tailwind base/components/utilities`.

### 3. **tailwind.config.js**
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
}
```

**Nota:** Config mínima sem override de cores. Tailwind gera todas as cores por padrão.

### 4. **vite.config.ts**
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  css: {
    postcss: './postcss.config.js',
  },
  server: {
    port: 5173,
    open: true,
  },
})
```

**Nota:** A chave `css.postcss` é essencial para o Vite processar corretamente o PostCSS.

---

## ✅ Verificação de Funcionamento

### Após Build
O arquivo CSS compilado deve ter aproximadamente **24-26 kB** (gzip: ~5.5 kB).

```bash
npm run build
```

Verificar saída:
```
dist/assets/index-XXXXX.css   24.26 kB │ gzip:   5.52 kB  ✅
```

### Verificar Classes Geradas
```bash
cat dist/assets/index-*.css | grep -o "bg-zinc-950\|bg-blue-600\|text-zinc-50"
```

Deve retornar múltiplas ocorrências das classes.

---

## 🚨 Problemas Comuns e Soluções

### ❌ Problema: CSS compilado muito pequeno (3-4 KB)
**Causa:** PostCSS não está sendo processado corretamente.

**Solução:**
1. Verificar `vite.config.ts` - adicionar `css: { postcss: './postcss.config.js' }`
2. Limpar cache: `rm -rf dist && npm run build`
3. Verificar se `@tailwindcss/postcss` está no `package.json`

### ❌ Problema: Classes Tailwind não estão sendo aplicadas
**Causa:** `content` paths incorretos no `tailwind.config.js`.

**Solução:**
```javascript
content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}',
],
```

Verificar que o padrão glob cobre todos os arquivos com classes Tailwind.

### ❌ Problema: Cores não aparecem (apenas utilitários básicos)
**Causa:** PostCSS plugin incorreto no `postcss.config.js`.

**Solução:**
- Usar `'@tailwindcss/postcss': {}`
- NÃO usar `tailwindcss: {}`
- NÃO usar `@tailwind base/components/utilities` no CSS

### ❌ Problema: Dark mode não funciona
**Causa:** `darkMode: 'class'` não está configurado.

**Solução:** Verificar `tailwind.config.js` tem `darkMode: 'class'`.

---

## 📝 Checklist de Deploy

Antes de fazer deploy, verificar:

- [ ] `postcss.config.js` usando `@tailwindcss/postcss`
- [ ] `src/index.css` usando `@import "tailwindcss"`
- [ ] `tailwind.config.js` com `content` paths corretos
- [ ] `vite.config.ts` com `css.postcss` configurado
- [ ] Build gera CSS 20+ KB: `npm run build`
- [ ] Classes Tailwind aparecem no CSS compilado
- [ ] Dark mode funciona (toggle `dark` class no HTML)
- [ ] Cores aparecem corretamente (zinc, blue, emerald, etc.)

---

## 🔄 Histórico de Fixes

| Data | Problema | Solução | Commit |
|------|----------|---------|--------|
| 2026-02-20 | CSS incompileto (3.33 KB) | Adicionar `css.postcss` no vite.config.ts | 80693d6 |
| 2026-02-20 | Sem classes de cor | Usar `@tailwindcss/postcss` correto | 80693d6 |
| 2026-02-20 | Sintaxe CSS errada | Mudar para `@import "tailwindcss"` | 80693d6 |

---

## 📚 Referências

- [Tailwind CSS v4 Docs](https://tailwindcss.com/docs/installation)
- [PostCSS Plugin Guide](https://tailwindcss.com/docs/configuration)
- [Vite CSS Processing](https://vitejs.dev/guide/features.html#css)

---

**Mantido por:** Claude Haiku 4.5
**Última verificação:** Build pass ✅
