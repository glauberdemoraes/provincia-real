/**
 * Timezone Selector Component
 * Allows users to select between Los Angeles (default) and Brasil timezones
 * Automatically adjusts all timestamps and metrics
 */

'use client'

import React, { FC } from 'react'
import { Timezone, getAvailableTimezones } from '@/lib/timezoneConverter'

interface TimezoneSelectorProps {
  value: Timezone
  onChange: (timezone: Timezone) => void
  className?: string
}

export const TimezoneSelector: FC<TimezoneSelectorProps> = ({
  value,
  onChange,
  className = '',
}) => {
  const timezones = getAvailableTimezones()

  return (
    <div className={`timezone-selector ${className}`}>
      <label htmlFor="timezone-select" className="timezone-label">
        🕐 Timezone:
      </label>
      <select
        id="timezone-select"
        value={value}
        onChange={(e) => onChange(e.target.value as Timezone)}
        className="timezone-select"
      >
        {timezones.map((tz) => (
          <option key={tz.value} value={tz.value}>
            {tz.label}
          </option>
        ))}
      </select>
    </div>
  )
}

/**
 * Inline Timezone Badge Component
 * Shows current timezone selection as a badge
 */
export const TimezoneBadge: FC<{ timezone: Timezone }> = ({ timezone }) => {
  const label = timezone === 'LA' ? '🌎 Los Angeles' : '🇧🇷 Brasil'
  const color = timezone === 'LA' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${color}`}>
      {label}
    </span>
  )
}

/**
 * Timezone Info Component
 * Shows helpful information about timezone conversion
 */
export const TimezoneInfo: FC<{ timezone: Timezone }> = ({ timezone }) => {
  const info =
    timezone === 'LA'
      ? {
          title: 'Los Angeles (Padrão)',
          description:
            'NuvemShop timestamps convertidos de Brasília (UTC-3) para Los Angeles (UTC-8)',
          offset: '-5 horas',
        }
      : {
          title: 'Brasil - Brasília',
          description:
            'Meta Ads timestamps convertidos de Los Angeles (UTC-8) para Brasília (UTC-3)',
          offset: '+5 horas',
        }

  return (
    <div className="timezone-info bg-gray-50 p-3 rounded-lg text-sm">
      <p className="font-semibold text-gray-900">{info.title}</p>
      <p className="text-gray-700">{info.description}</p>
      <p className="text-gray-600 mt-1">Diferença: {info.offset}</p>
    </div>
  )
}

export default TimezoneSelector
