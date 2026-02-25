import React, { useState } from 'react'
import { Download, Share2, Mail, Copy, Check } from 'lucide-react'

interface ExportPanelProps {
  onExport?: (format: 'pdf' | 'csv' | 'excel') => void
  onShare?: () => void
  onEmail?: () => void
  fileName?: string
}

export const ExportPanel: React.FC<ExportPanelProps> = ({
  onExport,
  onShare,
  onEmail,
  fileName = 'Provincia Real Report',
}) => {
  const [copied, setCopied] = useState(false)
  const [shareLink] = useState(`https://provincia.app/s/abc123def456`)

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
      {/* Header */}
      <h2 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">
        Export & Share
      </h2>

      {/* Export Options */}
      <div className="mb-6">
        <h3 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
          Export Format
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <ExportButton
            icon={Download}
            label="PDF"
            description="With branding"
            onClick={() => onExport?.('pdf')}
          />
          <ExportButton
            icon={Download}
            label="CSV"
            description="Raw data"
            onClick={() => onExport?.('csv')}
          />
          <ExportButton
            icon={Download}
            label="Excel"
            description="Multi-sheet"
            onClick={() => onExport?.('excel')}
          />
        </div>
      </div>

      {/* Sharing Options */}
      <div className="mb-6 border-t border-gray-200 pt-6 dark:border-gray-800">
        <h3 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
          Share Report
        </h3>

        {/* Shareable Link */}
        <div className="mb-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
          <p className="mb-2 text-xs text-gray-600 dark:text-gray-400">
            Shareable Link (7 days expiry)
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={shareLink}
              readOnly
              className="flex-1 rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
            />
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="flex flex-wrap gap-2">
          <ShareButton
            icon={Share2}
            label="Share Link"
            onClick={onShare}
          />
          <ShareButton
            icon={Mail}
            label="Email Report"
            onClick={onEmail}
          />
        </div>
      </div>

      {/* File name preview */}
      <div className="border-t border-gray-200 pt-4 dark:border-gray-800">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          File name: <span className="font-medium">{fileName}.pdf</span>
        </p>
      </div>
    </div>
  )
}

interface ExportButtonProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  description: string
  onClick: () => void
}

const ExportButton: React.FC<ExportButtonProps> = ({
  icon: Icon,
  label,
  description,
  onClick,
}) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center gap-2 rounded-lg border-2 border-gray-200 bg-gray-50 p-3 transition-all hover:border-blue-400 hover:bg-blue-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-blue-500 dark:hover:bg-blue-950"
  >
    <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
    <div className="text-center">
      <p className="text-sm font-medium text-gray-900 dark:text-white">
        {label}
      </p>
      <p className="text-xs text-gray-600 dark:text-gray-400">
        {description}
      </p>
    </div>
  </button>
)

interface ShareButtonProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  onClick?: () => void
}

const ShareButton: React.FC<ShareButtonProps> = ({
  icon: Icon,
  label,
  onClick,
}) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
  >
    <Icon className="h-4 w-4" />
    {label}
  </button>
)
