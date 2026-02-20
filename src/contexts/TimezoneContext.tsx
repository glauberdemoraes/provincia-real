/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

export type TimezoneMode = 'LA' | 'BR'

export interface TimezoneContextType {
  timeZoneMode: TimezoneMode
  setTimeZoneMode: (mode: TimezoneMode) => void
}

const TimezoneContext = createContext<TimezoneContextType | undefined>(undefined)

export const TimezoneProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [timeZoneMode, setTimeZoneMode] = useState<TimezoneMode>('LA')

  return (
    <TimezoneContext.Provider value={{ timeZoneMode, setTimeZoneMode }}>
      {children}
    </TimezoneContext.Provider>
  )
}

export function useTimezone() {
  const context = useContext(TimezoneContext)
  if (!context) {
    throw new Error('useTimezone must be used within TimezoneProvider')
  }
  return context
}
