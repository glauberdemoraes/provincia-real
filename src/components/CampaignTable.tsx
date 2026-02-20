import type { AdCampaignMetrics } from '@/types'
import { useTheme } from '@/contexts/ThemeContext'

interface CampaignTableProps {
  campaigns: AdCampaignMetrics[]
}

/**
 * Retorna classe de cor baseado no valor de ROAS
 * Verde ≥3x | Amarelo 1-3x | Vermelho <1x
 */
const getRoasColor = (roas: number): string => {
  if (roas >= 3) return 'text-emerald-500 font-bold'
  if (roas >= 1) return 'text-amber-500 font-bold'
  return 'text-red-500 font-bold'
}

/**
 * Retorna classe de cor baseado no valor de ROI
 * Verde >30% | Amarelo 0-30% | Vermelho negativo
 */
const getRoiColor = (roi: number): string => {
  if (roi > 30) return 'text-emerald-500 font-bold'
  if (roi >= 0) return 'text-amber-500 font-bold'
  return 'text-red-500 font-bold'
}

/**
 * Formatar moeda BRL
 */
const formatBRL = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

/**
 * Formatar percentual
 */
const formatPercent = (value: number): string => {
  return `${value.toFixed(1)}%`
}

// Layout Desktop Component
const DesktopTable = ({ campaigns, theme }: { campaigns: AdCampaignMetrics[]; theme: 'light' | 'dark' }) => (
    <div className="hidden lg:block overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
      <table className="w-full text-sm">
        <thead>
          <tr
            className={`${theme === 'dark' ? 'bg-slate-900/50 border-b border-slate-800' : 'bg-slate-50 border-b border-slate-200'}`}
          >
            <th className="px-4 py-3 text-left font-bold text-slate-700 dark:text-slate-300">
              Campanha
            </th>
            <th className="px-4 py-3 text-right font-bold text-slate-700 dark:text-slate-300">
              Pedidos
            </th>
            <th className="px-4 py-3 text-right font-bold text-slate-700 dark:text-slate-300">
              Vendas
            </th>
            <th className="px-4 py-3 text-right font-bold text-slate-700 dark:text-slate-300">
              Gasto Ads
            </th>
            <th className="px-4 py-3 text-right font-bold text-slate-700 dark:text-slate-300">
              ROAS
            </th>
            <th className="px-4 py-3 text-right font-bold text-slate-700 dark:text-slate-300">
              ROI
            </th>
            <th className="px-4 py-3 text-right font-bold text-slate-700 dark:text-slate-300">
              Lucro
            </th>
          </tr>
        </thead>
        <tbody>
          {campaigns.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                className={`px-4 py-6 text-center ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}
              >
                Sem campanhas para o período
              </td>
            </tr>
          ) : (
            campaigns.map((campaign) => (
              <tr
                key={campaign.campaign_id}
                className={`border-b ${theme === 'dark' ? 'border-slate-800 hover:bg-slate-900/30' : 'border-slate-200 hover:bg-slate-50'} transition-colors`}
              >
                <td className="px-4 py-3 font-medium">{campaign.campaign_name}</td>
                <td className="px-4 py-3 text-right">{campaign.orders}</td>
                <td className="px-4 py-3 text-right">{formatBRL(campaign.sales)}</td>
                <td className="px-4 py-3 text-right">{formatBRL(campaign.spend)}</td>
                <td className={`px-4 py-3 text-right ${getRoasColor(campaign.roas)}`}>
                  {campaign.roas.toFixed(2)}x
                </td>
                <td className={`px-4 py-3 text-right ${getRoiColor(campaign.roi)}`}>
                  {formatPercent(campaign.roi)}
                </td>
                <td className="px-4 py-3 text-right">{formatBRL(campaign.profit)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
)

// Layout Mobile Component
const MobileCards = ({ campaigns, theme }: { campaigns: AdCampaignMetrics[]; theme: 'light' | 'dark' }) => (
    <div className="lg:hidden space-y-3">
      {campaigns.length === 0 ? (
        <div
          className={`px-4 py-6 text-center rounded-lg ${theme === 'dark' ? 'bg-slate-900/50 text-slate-400' : 'bg-slate-50 text-slate-600'}`}
        >
          Sem campanhas para o período
        </div>
      ) : (
        campaigns.map((campaign) => (
          <div
            key={campaign.campaign_id}
            className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-slate-900/30 border-slate-800' : 'bg-white border-slate-200'}`}
          >
            <h4 className="font-bold mb-3">{campaign.campaign_name}</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>
                  Pedidos
                </span>
                <p className="font-bold mt-1">{campaign.orders}</p>
              </div>
              <div>
                <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>
                  Vendas
                </span>
                <p className="font-bold mt-1">{formatBRL(campaign.sales)}</p>
              </div>
              <div>
                <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>
                  Gasto
                </span>
                <p className="font-bold mt-1">{formatBRL(campaign.spend)}</p>
              </div>
              <div>
                <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>
                  ROAS
                </span>
                <p className={`font-bold mt-1 ${getRoasColor(campaign.roas)}`}>
                  {campaign.roas.toFixed(2)}x
                </p>
              </div>
              <div>
                <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>
                  ROI
                </span>
                <p className={`font-bold mt-1 ${getRoiColor(campaign.roi)}`}>
                  {formatPercent(campaign.roi)}
                </p>
              </div>
              <div>
                <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>
                  Lucro
                </span>
                <p className="font-bold mt-1">{formatBRL(campaign.profit)}</p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
)

export const CampaignTable = ({ campaigns }: CampaignTableProps) => {
  const { theme } = useTheme()

  return (
    <>
      <DesktopTable campaigns={campaigns} theme={theme as 'light' | 'dark'} />
      <MobileCards campaigns={campaigns} theme={theme as 'light' | 'dark'} />
    </>
  )
}
