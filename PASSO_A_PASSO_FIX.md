# 🔧 PASSO A PASSO: Corrigir Sincronização de Pedidos

## ❌ Problema Atual

```
⚠️  RPC save_orders_json error: column "kv" does not exist
```

A RPC que salva os pedidos não existe no banco.

---

## ✅ Solução: 2 Passos Simples

### PASSO 1: Abrir SQL Editor do Supabase

Acesse: https://app.supabase.com/project/prnshbkblddfgttsgxpt/sql/new

### PASSO 2: Copiar e Colar este SQL

```sql
-- ============================================
-- FIX: Criar RPC save_orders_json
-- ============================================

CREATE OR REPLACE FUNCTION public.save_orders_json(p_orders JSONB)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_order JSONB;
    v_count INTEGER := 0;
    v_landing_url TEXT;
BEGIN
    IF jsonb_typeof(p_orders) != 'array' THEN
        p_orders := jsonb_build_array(p_orders);
    END IF;

    FOR v_order IN SELECT jsonb_array_elements(p_orders)
    LOOP
        v_landing_url := v_order->>'landing_url';

        INSERT INTO public.orders_cache (
            id, total, subtotal, shipping_cost_owner, payment_status, shipping_status,
            billing_name, contact_phone, billing_phone, landing_url,
            utm_source, utm_medium, utm_campaign, utm_content, utm_term,
            products, order_created_at, fetched_at
        ) VALUES (
            (v_order->>'id')::BIGINT,
            COALESCE((v_order->>'total')::NUMERIC, 0),
            COALESCE((v_order->>'subtotal')::NUMERIC, 0),
            COALESCE((v_order->>'shipping_cost_owner')::NUMERIC, 0),
            COALESCE(v_order->>'payment_status', 'unknown'),
            v_order->>'shipping_status',
            v_order->>'billing_name',
            v_order->>'contact_phone',
            v_order->>'billing_phone',
            v_landing_url,
            public.extract_utm_param(v_landing_url, 'utm_source'),
            public.extract_utm_param(v_landing_url, 'utm_medium'),
            public.extract_utm_param(v_landing_url, 'utm_campaign'),
            public.extract_utm_param(v_landing_url, 'utm_content'),
            public.extract_utm_param(v_landing_url, 'utm_term'),
            v_order->'products',
            (v_order->>'created_at')::TIMESTAMPTZ,
            NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            total = EXCLUDED.total,
            subtotal = EXCLUDED.subtotal,
            shipping_cost_owner = EXCLUDED.shipping_cost_owner,
            payment_status = EXCLUDED.payment_status,
            shipping_status = EXCLUDED.shipping_status,
            billing_name = EXCLUDED.billing_name,
            contact_phone = EXCLUDED.contact_phone,
            billing_phone = EXCLUDED.billing_phone,
            landing_url = EXCLUDED.landing_url,
            utm_source = EXCLUDED.utm_source,
            utm_medium = EXCLUDED.utm_medium,
            utm_campaign = EXCLUDED.utm_campaign,
            utm_content = EXCLUDED.utm_content,
            utm_term = EXCLUDED.utm_term,
            products = EXCLUDED.products,
            fetched_at = EXCLUDED.fetched_at,
            updated_at = NOW();

        v_count := v_count + 1;
    END LOOP;

    RETURN jsonb_build_object('success', TRUE, 'saved', v_count);
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', FALSE, 'error', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION public.save_orders_json(JSONB) TO anon, authenticated;
```

### PASSO 3: Clicar em "Run"

Botão azul no canto superior direito do SQL Editor.

**Esperado:**
```
Query executed successfully
```

---

## 🧪 Testar

### 1. Recarregar o browser (F5)

### 2. Abrir Console (F12)

### 3. Ver logs aparecerem

**Esperado:**
```
🚀 Performing mandatory mount sync...
📦 Fetching Nuvem Shop orders...
✅ Retrieved 22 orders
💾 Saving orders to Supabase...
✅ Sincronização concluída (2341ms)
```

---

## 🎉 Pronto!

Após aplicar o SQL:
- ✅ Pedidos salvam ao F5 (mount sync)
- ✅ Pedidos salvam a cada 30s (polling)  
- ✅ Pedidos salvam ao clicar 'Atualizar'
- ✅ Pedidos salvam a cada 30min (cron)

---

## ❓ Se der erro

**Erro:** "function public.save_orders_json already exists"
**Solução:** É normal, significa que funcionou! Recarregue a página.

**Erro:** "Syntax error"
**Solução:** Copie o SQL **exatamente** como está acima, sem modificações.

---

**Isso é tudo que você precisa fazer!** 🚀

