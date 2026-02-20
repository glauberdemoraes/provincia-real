# 🚀 Edge Functions Setup - Documentação Completa

**Data**: 2026-02-20
**Autor**: Claude Code (IA)
**Status**: ✅ Funcionando

---

## 📋 Índice

1. [O que são Edge Functions](#o-que-são-edge-functions)
2. [Estrutura de Arquivos](#estrutura-de-arquivos)
3. [Passo a Passo de Criação](#passo-a-passo-de-criação)
4. [Deploy via API REST](#deploy-via-api-rest)
5. [Testes](#testes)
6. [Troubleshooting](#troubleshooting)

---

## O que são Edge Functions

Edge Functions são funções serverless que rodam no Supabase, escritas em **Deno/TypeScript**. Elas executam próximo aos dados (edge), com baixa latência.

**Usos neste projeto:**
- Buscar dados reais da API da NuvemShop
- Buscar dados reais da API do Meta Ads
- Autenticação e autorização
- Processamento de dados antes de armazenar

---

## Estrutura de Arquivos

```
supabase/functions/
├── fetch-nuvemshop-orders/
│   ├── index.ts              # Código Deno da function
│   └── deno.json             # Configuração de imports
├── fetch-meta-campaigns/
│   ├── index.ts              # Código Deno da function
│   └── deno.json             # Configuração de imports
└── [outras functions aqui]
```

---

## Passo a Passo de Criação

### 1️⃣ Criar Diretório da Function

```bash
mkdir -p supabase/functions/fetch-nuvemshop-orders
mkdir -p supabase/functions/fetch-meta-campaigns
```

### 2️⃣ Criar Arquivo index.ts

**Estrutura mínima:**

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Seu código aqui
    const { param1, param2 } = await req.json()

    // Processar dados
    const result = { success: true }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
```

### 3️⃣ Criar deno.json

```json
{
  "imports": {
    "https://deno.land/std@0.168.0/http/server.ts": "https://deno.land/std@0.168.0/http/server.ts"
  }
}
```

### 4️⃣ Deploy via API REST (✅ MELHOR MÉTODO)

**Token necessário**: Personal Access Token do Supabase (`sbp_...`)

**Script Python:**

```python
import requests

TOKEN = "sbp_918272d9db25c6800e4dcbbf5c3c8a6df212b4f3"
PROJECT_ID = "prnshbkblddfgttsgxpt"
API_URL = "https://api.supabase.com"

def deploy_function(function_name):
    """Deploy uma Edge Function"""

    # Ler código da function
    with open(f"supabase/functions/{function_name}/index.ts", 'r') as f:
        code = f.read()

    headers = {
        "Authorization": f"Bearer {TOKEN}",
        "Content-Type": "application/json"
    }

    # ✅ IMPORTANTE: Incluir "slug" no payload
    payload = {
        "name": function_name,
        "slug": function_name,
        "body": code,
        "verify_jwt": True,
        "import_map": "",
    }

    endpoint = f"{API_URL}/v1/projects/{PROJECT_ID}/functions"

    # Criar ou atualizar
    resp = requests.post(endpoint, json=payload, headers=headers, timeout=30)

    if resp.status_code == 201:
        print(f"✅ {function_name} criada")
        return True
    elif resp.status_code == 409:
        # Já existe, fazer UPDATE
        url_update = f"{endpoint}/{function_name}"
        payload_update = {"body": code}
        resp_update = requests.patch(url_update, json=payload_update, headers=headers, timeout=30)
        if resp_update.status_code in [200, 201]:
            print(f"✅ {function_name} atualizada")
            return True

    print(f"❌ Erro: {resp.status_code} - {resp.text}")
    return False

# Deploy das functions
deploy_function("fetch-nuvemshop-orders")
deploy_function("fetch-meta-campaigns")
```

---

## Deploy via API REST

### Requisitos

✅ **Personal Access Token** (sbp_...)
✅ **Project ID** (ex: prnshbkblddfgttsgxpt)
✅ **Código Deno/TypeScript** (index.ts)

### Endpoints da API

#### Criar Function (POST)
```
POST https://api.supabase.com/v1/projects/{PROJECT_ID}/functions
```

**Payload:**
```json
{
  "name": "fetch-nuvemshop-orders",
  "slug": "fetch-nuvemshop-orders",
  "body": "import { serve } from ...",
  "verify_jwt": true,
  "import_map": ""
}
```

**Response (Sucesso):**
```
Status: 201 Created
```

#### Atualizar Function (PATCH)
```
PATCH https://api.supabase.com/v1/projects/{PROJECT_ID}/functions/{FUNCTION_NAME}
```

**Payload:**
```json
{
  "body": "import { serve } from ..."
}
```

**Response (Sucesso):**
```
Status: 200 OK
```

---

## Testes

### Teste via cURL

```bash
curl -X POST https://{PROJECT_ID}.supabase.co/functions/v1/fetch-nuvemshop-orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {ANON_KEY}" \
  -d '{"start_date":"2026-02-20","end_date":"2026-02-20"}'
```

**Respostas esperadas:**

✅ **Sucesso (200)**
```json
{
  "result": [
    { "id": 1234, "total": 150.50, ... }
  ]
}
```

❌ **Erro de Boot (BOOT_ERROR)**
- Problema: Código inválido ou import quebrado
- Solução: Verificar sintaxe TypeScript, testar localmente com Deno

❌ **Erro de CORS (403)**
- Problema: CORS headers incorretos
- Solução: Verificar corsHeaders no código

---

## Troubleshooting

### BOOT_ERROR: "Function failed to start"

**Causas:**
- Import inválido
- Sintaxe TypeScript incorreta
- Arquivo deno.json com configuração errada

**Solução:**
1. Verificar sintaxe: `deno check index.ts`
2. Simplificar imports
3. Testar localmente com Deno

### 404: "Requested function was not found"

**Causa:** Function ainda não foi deployada

**Solução:**
```bash
# Aguarde 10-20 segundos após deploy
sleep 20
curl https://{PROJECT_ID}.supabase.co/functions/v1/{FUNCTION_NAME}
```

### CORS Headers não funcionando

**Verificar no código:**
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Retornar no response
return new Response(..., {
  headers: { ...corsHeaders, ... }
})
```

### Erro de Autenticação (401)

**Causa:** Token inválido ou expirado

**Solução:**
```bash
# Verificar token
echo $SUPABASE_ACCESS_TOKEN

# Gerar novo token:
# https://app.supabase.com/account/tokens
```

---

## Exemplo Completo: fetch-nuvemshop-orders

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { start_date, end_date } = await req.json()

    if (!start_date || !end_date) {
      throw new Error("start_date and end_date required")
    }

    // Credenciais (hardcoded é aceitável para funções públicas)
    const STORE_ID = '7230282'
    const ACCESS_TOKEN = '470c8121c30cfac9bf853c45181132eeb9d69799'
    const API_URL = `https://api.tiendanube.com/v1/${STORE_ID}/orders`

    // Fazer requisição
    const params = new URLSearchParams({
      created_at_min: start_date,
      created_at_max: end_date,
      per_page: '200',
    })

    const response = await fetch(`${API_URL}?${params}`, {
      method: 'GET',
      headers: {
        'Authentication': `bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      }
    })

    const data = await response.json()

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
```

---

## Checklist para Criar Nova Function

- [ ] `mkdir -p supabase/functions/{function-name}`
- [ ] Criar `index.ts` com código Deno
- [ ] Criar `deno.json` com imports
- [ ] Testar imports: `deno check index.ts`
- [ ] Deploy via API REST com Python script
- [ ] Aguardar 10-20 segundos
- [ ] Testar com cURL
- [ ] Atualizar `src/services/api.ts` para chamar a function
- [ ] Commit e push no GitHub

---

## Script Rápido para Deploy Futuro

Salvar como `deploy-function.py`:

```python
#!/usr/bin/env python3

import sys
import requests

if len(sys.argv) < 2:
    print("Uso: python3 deploy-function.py {function-name}")
    sys.exit(1)

FUNCTION_NAME = sys.argv[1]
TOKEN = "sbp_918272d9db25c6800e4dcbbf5c3c8a6df212b4f3"
PROJECT_ID = "prnshbkblddfgttsgxpt"

with open(f"supabase/functions/{FUNCTION_NAME}/index.ts") as f:
    code = f.read()

headers = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}
payload = {
    "name": FUNCTION_NAME,
    "slug": FUNCTION_NAME,
    "body": code,
    "verify_jwt": True,
}

resp = requests.post(
    f"https://api.supabase.com/v1/projects/{PROJECT_ID}/functions",
    json=payload, headers=headers
)

print(f"Status: {resp.status_code}")
print(f"Response: {resp.text[:200]}")
```

Uso:
```bash
python3 deploy-function.py fetch-nuvemshop-orders
```

---

## Referências

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Deno Docs](https://deno.land)
- [Supabase API Reference](https://api.supabase.com)

---

**Última atualização:** 2026-02-20
**Documentado por:** Claude Code
**Status:** ✅ Pronto para usar
