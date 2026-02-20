import { Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { TimezoneProvider } from '@/contexts/TimezoneContext'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import Dashboard from '@/pages/Dashboard'
import Realtime from '@/pages/Realtime'
import History from '@/pages/History'
import Settings from '@/pages/Settings'

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <TimezoneProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/realtime" element={<Realtime />} />
            <Route path="/history" element={<History />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </TimezoneProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
