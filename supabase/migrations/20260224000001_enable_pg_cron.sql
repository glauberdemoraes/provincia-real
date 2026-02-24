-- Enable pg_cron extension (required for scheduling)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create sync_log table to track sync runs
CREATE TABLE IF NOT EXISTS sync_log (
  id BIGSERIAL PRIMARY KEY,
  sync_type TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  orders_count INT DEFAULT 0,
  campaigns_count INT DEFAULT 0,
  error_message TEXT,
  duration_ms INT
);

-- Create index for quick lookups
CREATE INDEX IF NOT EXISTS sync_log_started_at_idx ON sync_log(started_at DESC);
CREATE INDEX IF NOT EXISTS sync_log_status_idx ON sync_log(status);

-- Grant privileges to postgres user (required for pg_cron)
GRANT ALL PRIVILEGES ON sync_log TO postgres;
GRANT ALL PRIVILEGES ON sync_log_id_seq TO postgres;

-- Schedule sync every 30 minutes
-- Note: This calls the Edge Function via HTTP
-- The function must be deployed first before this cron can run
SELECT cron.schedule(
  'sync-nuvemshop-meta-every-30min',
  '*/30 * * * *',
  $$
    SELECT net.http_post(
      url := 'https://' || current_setting('app.supabase_url') || '/functions/v1/sync-nuvemshop-meta',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || current_setting('app.service_role_key'),
        'Content-Type', 'application/json'
      ),
      body := jsonb_build_object('trigger', 'pg_cron')
    ) AS request_id;
  $$
);

-- Alternative: Simple RPC call (if you want to call a stored procedure instead)
-- SELECT cron.schedule(
--   'sync-nuvemshop-meta-every-30min',
--   '*/30 * * * *',
--   'SELECT sync_nuvemshop_meta();'
-- );

-- Log the scheduling
INSERT INTO sync_log (sync_type, status, started_at)
VALUES ('cron_schedule', 'completed', NOW());
