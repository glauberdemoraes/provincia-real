-- Default Alert Rules for Província Real

INSERT INTO public.alerts_config (name, metric, condition, threshold, severity, enabled, message_template)
VALUES
    ('Ritmo abaixo do alvo',    'pace_pct',      'less_than',    70,   'warning',  TRUE, 'Ritmo de vendas em {value}% do alvo'),
    ('Ritmo crítico',           'pace_pct',      'less_than',    40,   'critical', TRUE, 'CRÍTICO: Ritmo em {value}% — apenas {value}% do alvo'),
    ('ROAS muito baixo',        'roas',          'less_than',    2.0,  'warning',  TRUE, 'ROAS em {value}x, abaixo de {threshold}x'),
    ('ROAS crítico',            'roas',          'less_than',    1.0,  'critical', TRUE, 'CRÍTICO: ROAS em {value}x'),
    ('CPA muito alto',          'cpa',           'greater_than', 50.0, 'warning',  TRUE, 'CPA em R${value}'),
    ('Nenhum pedido na hora',   'orders_hour',   'less_than',    0.5,  'info',     TRUE, 'Menos de 1 pedido/hora'),
    ('Gasto Meta alto',         'spend_today',   'greater_than', 200,  'warning',  TRUE, 'Gasto Meta: USD {value}')
ON CONFLICT DO NOTHING;
