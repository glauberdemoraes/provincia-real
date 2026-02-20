import React from 'react'
import type { ReactNode, ErrorInfo } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'

interface Props {
  children?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-200 p-4">
          <AlertTriangle className="w-12 h-12 text-rose-500 mb-4" />
          <h1 className="text-xl font-bold mb-2">Algo deu errado</h1>
          <pre className="text-xs bg-slate-200 dark:bg-slate-800 p-4 rounded max-w-lg overflow-auto mb-4 font-mono">
            {this.state.error?.toString()}
          </pre>
          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition"
          >
            <RotateCcw className="w-4 h-4" />
            Recarregar
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
