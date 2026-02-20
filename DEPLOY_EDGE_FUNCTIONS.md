# 🚀 Deploy de Edge Functions no Supabase

**Status**: Edge Functions criadas, prontas para deploy

As duas Edge Functions foram criadas em:
- `supabase/functions/fetch-nuvemshop-orders/index.ts`
- `supabase/functions/fetch-meta-campaigns/index.ts`

---

## 📋 O que fazer agora:

### Opção 1: Deploy via Supabase CLI (Recomendado)

```bash
# 1. Instalar Supabase CLI (se não tiver)
npm install -g supabase@latest

# 2. Login no Supabase
supabase login

# 3. Deploy as Edge Functions
supabase functions deploy fetch-nuvemshop-orders --project-id prnshbkblddfgttsgxpt
supabase functions deploy fetch-meta-campaigns --project-id prnshbkblddfgttsgxpt

# 4. Verificar se está tudo certo
supabase functions list --project-id prnshbkblddfgttsgxpt
```

### Opção 2: Deploy via Interface Gráfica do Supabase

1. Abra: https://supabase.com/dashboard/project/prnshbkblddfgttsgxpt/functions
2. Clique em "Create a new function"
3. Copie o conteúdo de `supabase/functions/fetch-nuvemshop-orders/index.ts` para a primeira
4. Copie o conteúdo de `supabase/functions/fetch-meta-campaigns/index.ts` para a segunda
5. Clique em "Deploy"

---

## ✅ Como saber se funcionou:

Após o deploy, teste chamando:

```bash
# Para NuvemShop
curl -X POST https://prnshbkblddfgttsgxpt.supabase.co/functions/v1/fetch-nuvemshop-orders \
  -H "Authorization: Bearer seu_anon_key" \
  -H "Content-Type: application/json" \
  -d '{"start_date":"2026-02-20","end_date":"2026-02-20"}'

# Para Meta
curl -X POST https://prnshbkblddfgttsgxpt.supabase.co/functions/v1/fetch-meta-campaigns \
  -H "Authorization: Bearer seu_anon_key" \
  -H "Content-Type: application/json" \
  -d '{"start_date":"2026-02-20","end_date":"2026-02-20"}'
```

Se receber dados no JSON, está funcionando! ✅

---

## 🔍 O que as Edge Functions fazem:

### `fetch-nuvemshop-orders`
- ✅ Conecta à API da NuvemShop (Store ID: 7230282)
- ✅ Busca pedidos entre datas especificadas
- ✅ Extrai: id, total, status, produtos, landing_url (para UTM)
- ✅ Retorna em JSON para o frontend

### `fetch-meta-campaigns`
- ✅ Conecta à API do Meta (apenas conta: act_2037936660447316)
- ✅ Busca campanhas com "doce" no nome
- ✅ Extrai: campaign_id, spend, impressions, clicks, ROAS
- ✅ Filtra por período (data de início e fim)
- ✅ Retorna em JSON para o frontend

---

## 🔐 Credenciais (já configuradas):

```typescript
// NuvemShop
STORE_ID = '7230282'
ACCESS_TOKEN = '470c8121c30cfac9bf853c45181132eeb9d69799'

// Meta Ads
ACCESS_TOKEN = 'EAAKH0VidJXQBQqDhCNY0agvymRugNxoWXKZAxSsq6IKcpeQBBsR07YQ9i5VxhqhaCaLjLOvJzXt1Ddjm0D0qc6hJmzOSSL6MfPaSZAfAkkgZBL7bksP5z5rLNwZACSr90i1tZAoFwb79ARc60ubblaUWJb7exbUZC3X6i24Jr23rIZB56Bwz3yoOmOonmKXeQzA'
ACCOUNT_ID = 'act_2037936660447316'
```

---

## 📊 Resultado esperado:

Quando as Edge Functions estiverem deployadas e funcionando:

1. **Dashboard carrega dados REAIS** da NuvemShop
2. **Campanhas aparecem com ROAS/ROI real** do Meta Ads
3. **Análise por campanha funciona** com dados verdadeiros
4. **Cotação USD/BRL atualiza** automaticamente

---

## ⏱️ Tempo de Deploy:

- Via CLI: ~2 minutos
- Via interface: ~3 minutos

---

## 🆘 Problemas?

Se receber erro de autenticação:
- Verifique se a access token do Meta está correta
- Verifique se o Store ID da NuvemShop está correto
- Verifique se o Account ID do Meta está correto (act_2037936660447316)

Se as funções não forem encontradas:
- Aguarde 30 segundos após deploy
- Atualize a página
- Verifique em: https://supabase.com/dashboard/project/prnshbkblddfgttsgxpt/functions

---

## 📝 Próximos passos:

1. Deploy as Edge Functions ✅
2. Verificar se estão funcionando ✅
3. Acessar https://provincia-real.vercel.app ✅
4. Ver dados reais no dashboard ✅

Pronto! 🚀
