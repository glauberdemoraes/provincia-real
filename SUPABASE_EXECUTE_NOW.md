# ⚡ EXECUTE AGORA NO SUPABASE

## Passo 1: Abra o SQL Editor

**Clique aqui:** https://supabase.com/dashboard/project/prnshbkblddfgttsgxpt/sql/new

---

## Passo 2: Cole EXATAMENTE este SQL

```sql
CREATE TABLE IF NOT EXISTS public.exchange_rates (
  date DATE PRIMARY KEY,
  usd_brl NUMERIC(10, 4) NOT NULL,
  source TEXT DEFAULT 'awesomeapi',
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT exchange_rates_usd_brl_positive CHECK (usd_brl > 0)
);

CREATE INDEX IF NOT EXISTS idx_exchange_rates_date ON public.exchange_rates(date DESC);

ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to exchange_rates" ON public.exchange_rates
  FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated insert to exchange_rates" ON public.exchange_rates
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update to exchange_rates" ON public.exchange_rates
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

INSERT INTO public.exchange_rates (date, usd_brl, source)
VALUES (CURRENT_DATE, 4.97, 'awesomeapi')
ON CONFLICT (date) DO NOTHING;
```

---

## Passo 3: Clique no botão **RUN** (azul)

⏱️ Aguarde 5-10 segundos

---

## Passo 4: Pronto! ✨

Agora você tem:
- ✅ Tabela `exchange_rates` criada
- ✅ Índice para queries rápidas
- ✅ RLS habilitado (segurança)
- ✅ Cotação inicial inserida (R$ 4.97/USD)

---

## Dashboard agora vai:

1. 📊 Buscar cotações USD/BRL do Supabase
2. 💱 Converter spend de Meta Ads (USD → BRL)
3. 📈 Calcular ROAS/ROI com câmbio real
4. 🎯 Exibir análise por campanha

---

## Link para Acessar

🚀 **https://provincia-real.vercel.app**

---

## Problema?

Se der erro, tente:

1. **"permission denied"** → Você está na anon key (correto). RLS pode estar bloqueando.
   - Solução: Execute uma linha por vez

2. **"already exists"** → Tabela já foi criada
   - Solução: Pronto! Pode usar normalmente

3. **"invalid SQL"** → Copiei algo errado
   - Solução: Abra novamente este arquivo e copie linha por linha

---

**Tempo total:** 1 minuto ⏱️
