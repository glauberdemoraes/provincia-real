/**
 * Database migrations and initialization helpers
 * Called on app startup to ensure all required tables/views exist
 */

import { supabase } from './supabase'

/**
 * Check if a view exists in the database
 */
export async function viewExists(viewName: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('information_schema.views')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', viewName)
      .limit(1)

    // If no error and we got data, view exists
    // If error about permissions or table not found, view doesn't exist
    return !error
  } catch {
    return false
  }
}

/**
 * Initialize database (called on app startup)
 * Creates missing views and functions
 */
export async function initializeDatabase(): Promise<void> {
  try {
    console.log('[Migrations] Checking database initialization...')

    // Check if customer_ltv_all view exists
    const hasLtvView = await viewExists('customer_ltv_all')

    if (!hasLtvView) {
      console.warn('[Migrations] ⚠️  View customer_ltv_all not found')
      console.warn('[Migrations] Application will work with limited retention features')
      console.warn('[Migrations] Apply migration from MIGRATION_NEEDED.sql')

      // Try to initialize via RPC (may fail if view doesn't exist)
      try {
        await supabase.rpc('initialize_retention_view')
        console.log('[Migrations] ✅ RPC initialization attempted')
      } catch (err) {
        console.warn('[Migrations] RPC initialization not available:', err)
      }
    } else {
      console.log('[Migrations] ✅ All required views exist')
    }
  } catch (err) {
    console.warn('[Migrations] Error during initialization:', err)
    // Continue anyway - app can function with reduced features
  }
}

/**
 * Log migration status for debugging
 */
export async function logMigrationStatus(): Promise<void> {
  try {
    const tables = ['orders_cache', 'meta_campaigns_cache', 'alerts_config']
    const views = ['customer_ltv_all', 'customer_ltv_summary', 'daily_sales_summary']

    console.log('[Migrations] Table Status:')
    for (const table of tables) {
      try {
        const { count } = await supabase.from(table).select('*', { count: 'exact', head: true })
        console.log(`  ✅ ${table}: ${count} rows`)
      } catch {
        console.log(`  ❌ ${table}: not accessible`)
      }
    }

    console.log('[Migrations] View Status:')
    for (const view of views) {
      const exists = await viewExists(view)
      console.log(`  ${exists ? '✅' : '❌'} ${view}`)
    }
  } catch (err) {
    console.warn('[Migrations] Error logging status:', err)
  }
}
