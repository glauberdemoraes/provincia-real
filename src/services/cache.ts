import { supabase } from '@/lib/supabase'
import type { DateRange, SyncResult } from '@/types'

export async function syncOrdersToCache(range: DateRange): Promise<SyncResult> {
  try {
    const { data, error } = await supabase.rpc('sync_orders_to_cache', {
      p_start_date: range.start.toISOString().split('T')[0],
      p_end_date: range.end.toISOString().split('T')[0],
    })

    if (error) return { success: false, error: error.message }
    return (data as SyncResult) || { success: false }
  } catch (err) {
    return { success: false, error: String(err) }
  }
}

export async function syncMetaToCache(range: DateRange): Promise<SyncResult> {
  try {
    const { data, error } = await supabase.rpc('sync_meta_to_cache', {
      p_start_date: range.start.toISOString().split('T')[0],
      p_end_date: range.end.toISOString().split('T')[0],
    })

    if (error) return { success: false, error: error.message }
    return (data as SyncResult) || { success: false }
  } catch (err) {
    return { success: false, error: String(err) }
  }
}

export async function syncAll(range: DateRange): Promise<{ orders: SyncResult; meta: SyncResult }> {
  const [orders, meta] = await Promise.all([
    syncOrdersToCache(range),
    syncMetaToCache(range),
  ])
  return { orders, meta }
}

export async function getLastSyncTime(syncType: 'orders' | 'meta_campaigns'): Promise<Date | null> {
  try {
    const { data, error } = await supabase
      .from('sync_logs')
      .select('completed_at')
      .eq('sync_type', syncType)
      .eq('status', 'success')
      .order('completed_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !data?.completed_at) return null
    return new Date(data.completed_at)
  } catch {
    return null
  }
}
