-- Fix alert message templates to use proper interpolation syntax

-- Ensure alerts_config table exists with message_template column
CREATE TABLE IF NOT EXISTS alerts_config (
  id BIGSERIAL PRIMARY KEY,
  metric VARCHAR NOT NULL UNIQUE,
  metric_name VARCHAR NOT NULL,
  warning_threshold DECIMAL,
  critical_threshold DECIMAL,
  message_template TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fix message templates to use {value} placeholder syntax
UPDATE alerts_config
SET message_template = 'CRÍTICO: Ritmo em {value}% — apenas {value}% do alvo'
WHERE metric = 'pace_pct' AND critical_threshold IS NOT NULL;

UPDATE alerts_config
SET message_template = 'AVISO: Ritmo em {value}% — {value}% do alvo esperado'
WHERE metric = 'pace_pct' AND warning_threshold IS NOT NULL AND critical_threshold IS NULL;

-- Ensure all alert configs have proper templates with {value}
UPDATE alerts_config
SET message_template = 'Métrica crítica: {value}%'
WHERE message_template IS NULL OR message_template = '' OR message_template NOT LIKE '%{value}%';

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_alerts_config_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS alerts_config_updated_at ON alerts_config;
CREATE TRIGGER alerts_config_updated_at
  BEFORE UPDATE ON alerts_config
  FOR EACH ROW
  EXECUTE FUNCTION update_alerts_config_timestamp();
