import React, { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

type TimezoneMode = 'LA' | 'BR'

interface TimezoneContextType {
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

export const useTimezone = () => {
  const context = useContext(TimezoneContext)
  if (!context) {
    throw new Error('useTimezone must be used within TimezoneProvider')
  }
  return context
}
