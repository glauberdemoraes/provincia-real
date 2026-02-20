# Setup Supabase — Tabela de Cotações USD/BRL

## 🚀 Rápido (2 minutos)

### Opção 1: Via Dashboard (Recomendado)

1. **Abra o SQL Editor do Supabase:**
   - URL: https://supabase.com/dashboard/project/prnshbkblddfgttsgxpt/sql/new

2. **Cole este SQL e clique RUN:**

```sql
-- Create exchange_rates table for daily USD/BRL conversion rates
CREATE TABLE IF NOT EXISTS public.exchange_rates (
  date DATE PRIMARY KEY,
  usd_brl NUMERIC(10, 4) NOT NULL,
  source TEXT DEFAULT 'awesomeapi',
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT exchange_rates_usd_brl_positive CHECK (usd_brl > 0)
);

-- Create index for faster lookups by date
CREATE INDEX IF NOT EXISTS idx_exchange_rates_date ON public.exchange_rates(date DESC);

-- Enable RLS
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Allow public read access to exchange_rates" ON public.exchange_rates
  FOR SELECT
  USING (true);

-- Create policy for authenticated insert/update
CREATE POLICY "Allow authenticated insert to exchange_rates" ON public.exchange_rates
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update to exchange_rates" ON public.exchange_rates
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_exchange_rates_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_exchange_rates_timestamp ON public.exchange_rates;
CREATE TRIGGER trigger_exchange_rates_timestamp
  BEFORE UPDATE ON public.exchange_rates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_exchange_rates_timestamp();

-- Insert seed data with today's approximate rate
INSERT INTO public.exchange_rates (date, usd_brl, source)
VALUES (CURRENT_DATE, 4.97, 'awesomeapi')
ON CONFLICT (date) DO NOTHING;
```

3. **Aguarde 10-15 segundos**

4. **Pronto! ✨**

---

## 🧪 Validar Setup

Depois de executar o SQL, rode este teste:

```bash
# Verificar se tabela foi criada
curl -s -H "apikey: YOUR_ANON_KEY" \
  'https://prnshbkblddfgttsgxpt.supabase.co/rest/v1/exchange_rates?select=*' \
  | jq '.'
```

Você deve ver:
```json
[
  {
    "date": "2026-02-20",
    "usd_brl": "4.97",
    "source": "awesomeapi",
    "fetched_at": "2026-02-20T10:30:00Z",
    "updated_at": "2026-02-20T10:30:00Z"
  }
]
```

---

## 📊 Dashboard Agora Pode:

- ✅ Buscar cotação USD/BRL do dia via AwesomeAPI
- ✅ Cachear cotação na tabela `exchange_rates`
- ✅ Converter spend de Meta Ads (USD) para BRL
- ✅ Calcular ROAS e ROI com câmbio real
- ✅ Exibir cotação atualizada no rodapé

---

## ❓ Problemas?

### "Table not found"
- Certifique-se de executar o SQL completo
- Verifique se está no projeto correto (prnshbkblddfgttsgxpt)

### "Permission denied"
- Use a anon key (não a service key)
- RLS pode estar bloqueando acesso

### Cotação não atualiza
- AwesomeAPI pode estar fora do ar
- Verifique: https://economia.awesomeapi.com.br/json/last/USD-BRL
- Fallback: R$ 4.97/USD (do seed)

---

## 🔄 Atualizar Cotação Manualmente

```sql
INSERT INTO public.exchange_rates (date, usd_brl, source)
VALUES ('2026-02-20', 5.10, 'manual')
ON CONFLICT (date) DO UPDATE SET usd_brl = 5.10;
```

---

**Status**: Aguardando execução da migration
**Próximo Passo**: Acessar dashboard em https://provincia-real.vercel.app
