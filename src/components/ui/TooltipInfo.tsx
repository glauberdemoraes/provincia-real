import React, { useState } from 'react'
import { HelpCircle } from 'lucide-react'

interface TooltipInfoProps {
  content: string
  children?: React.ReactNode
  position?: 'top' | 'right' | 'bottom' | 'left'
}

export const TooltipInfo: React.FC<TooltipInfoProps> = ({
  content,
  children,
  position = 'top',
}) => {
  const [isVisible, setIsVisible] = useState(false)

  const positionClass = {
    top: 'bottom-full mb-2 left-1/2 transform -translate-x-1/2',
    right: 'left-full ml-2 top-1/2 transform -translate-y-1/2',
    bottom: 'top-full mt-2 left-1/2 transform -translate-x-1/2',
    left: 'right-full mr-2 top-1/2 transform -translate-y-1/2',
  }[position]

  const arrowClass = {
    top: 'top-full border-t-zinc-800 dark:border-t-zinc-300 border-l-transparent border-r-transparent border-b-transparent',
    right: 'right-full border-r-zinc-800 dark:border-r-zinc-300 border-t-transparent border-b-transparent border-l-transparent',
    bottom: 'bottom-full border-b-zinc-800 dark:border-b-zinc-300 border-l-transparent border-r-transparent border-t-transparent',
    left: 'left-full border-l-zinc-800 dark:border-l-zinc-300 border-t-transparent border-b-transparent border-r-transparent',
  }[position]

  return (
    <div className="relative inline-block">
      <div
        className="inline-flex items-center justify-center cursor-help"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        role="button"
        tabIndex={0}
      >
        {children || <HelpCircle className="w-4 h-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors" />}
      </div>

      {isVisible && (
        <div
          className={`absolute z-50 px-3 py-2 text-sm font-medium text-white bg-zinc-800 dark:bg-zinc-200 dark:text-zinc-900 rounded-lg shadow-lg whitespace-nowrap pointer-events-none ${positionClass}`}
        >
          {content}
          <div
            className={`absolute w-0 h-0 border-4 ${arrowClass}`}
            style={{
              [position === 'top' ? 'top' : position === 'bottom' ? 'bottom' : position === 'left' ? 'left' : 'right']: '-4px',
            }}
          />
        </div>
      )}
    </div>
  )
}
