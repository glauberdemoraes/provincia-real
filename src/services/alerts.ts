import { supabase } from '@/lib/supabase'
import type { ActiveAlert, AlertConfig } from '@/types'

export async function checkAlerts(): Promise<{
  alerts: ActiveAlert[]
  alerts_count: number
  metrics_snapshot: Record<string, number>
} | null> {
  try {
    const { data, error } = await supabase.rpc('check_alerts')

    if (error) {
      console.error('checkAlerts error:', error)
      return null
    }

    return data || { alerts: [], alerts_count: 0, metrics_snapshot: {} }
  } catch (err) {
    console.error('checkAlerts exception:', err)
    return null
  }
}

export async function getAlertConfigs(): Promise<AlertConfig[]> {
  try {
    const { data, error } = await supabase
      .from('alerts_config')
      .select('*')
      .eq('enabled', true)
      .order('severity', { ascending: false })

    if (error) throw new Error(error.message)
    return data || []
  } catch (err) {
    console.error('getAlertConfigs error:', err)
    return []
  }
}

export async function updateAlertConfig(id: string, updates: Partial<AlertConfig>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('alerts_config')
      .update(updates)
      .eq('id', id)

    if (error) throw new Error(error.message)
    return true
  } catch (err) {
    console.error('updateAlertConfig error:', err)
    return false
  }
}

export async function createAlertConfig(config: Omit<AlertConfig, 'id'>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('alerts_config')
      .insert([config])

    if (error) throw new Error(error.message)
    return true
  } catch (err) {
    console.error('createAlertConfig error:', err)
    return false
  }
}
