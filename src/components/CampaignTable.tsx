import type { AdCampaignMetrics } from '@/types'
import { useTheme } from '@/contexts/ThemeContext'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface CampaignTableProps {
  campaigns: AdCampaignMetrics[]
}

/**
 * Retorna classe de cor baseado no valor de ROAS
 * Verde ≥3x | Amarelo 1-3x | Vermelho <1x
 */
const getRoasColor = (roas: number): string => {
  if (roas >= 3) return 'text-emerald-500'
  if (roas >= 1) return 'text-amber-500'
  return 'text-red-500'
}

const getRoasBgColor = (roas: number): string => {
  if (roas >= 3) return 'bg-emerald-500/10'
  if (roas >= 1) return 'bg-amber-500/10'
  return 'bg-red-500/10'
}

/**
 * Retorna classe de cor baseado no valor de ROI
 * Verde >30% | Amarelo 0-30% | Vermelho negativo
 */
const getRoiColor = (roi: number): string => {
  if (roi > 30) return 'text-emerald-500'
  if (roi >= 0) return 'text-amber-500'
  return 'text-red-500'
}

const getRoiBgColor = (roi: number): string => {
  if (roi > 30) return 'bg-emerald-500/10'
  if (roi >= 0) return 'bg-amber-500/10'
  return 'bg-red-500/10'
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
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
}

// Layout Desktop Component
const DesktopTable = ({ campaigns, theme }: { campaigns: AdCampaignMetrics[]; theme: 'light' | 'dark' }) => (
  <div className={`hidden lg:block rounded-lg border overflow-hidden ${theme === 'dark' ? 'border-zinc-800' : 'border-zinc-200'}`}>
    <div className={`overflow-x-auto`}>
      <table className="w-full text-sm">
        <thead>
          <tr
            className={`${theme === 'dark' ? 'bg-zinc-900 border-b border-zinc-800' : 'bg-zinc-50 border-b border-zinc-200'}`}
          >
            <th className="px-5 py-3.5 text-left font-bold text-zinc-700 dark:text-zinc-300">
              Campanha
            </th>
            <th className="px-5 py-3.5 text-right font-bold text-zinc-700 dark:text-zinc-300 tabular-nums">
              Pedidos
            </th>
            <th className="px-5 py-3.5 text-right font-bold text-zinc-700 dark:text-zinc-300 tabular-nums">
              Vendas
            </th>
            <th className="px-5 py-3.5 text-right font-bold text-zinc-700 dark:text-zinc-300 tabular-nums">
              Gasto
            </th>
            <th className="px-5 py-3.5 text-right font-bold text-zinc-700 dark:text-zinc-300 tabular-nums">
              ROAS
            </th>
            <th className="px-5 py-3.5 text-right font-bold text-zinc-700 dark:text-zinc-300 tabular-nums">
              ROI
            </th>
            <th className="px-5 py-3.5 text-right font-bold text-zinc-700 dark:text-zinc-300 tabular-nums">
              Lucro
            </th>
          </tr>
        </thead>
        <tbody>
          {campaigns.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                className={`px-5 py-8 text-center ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}
              >
                Nenhuma campanha para este período
              </td>
            </tr>
          ) : (
            campaigns.map((campaign, idx) => (
              <tr
                key={campaign.campaign_id}
                className={`border-b ${theme === 'dark' ? 'border-zinc-800 hover:bg-zinc-900/50' : 'border-zinc-200 hover:bg-zinc-50'} transition-colors`}
              >
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${theme === 'dark' ? 'bg-zinc-800 text-zinc-500' : 'bg-zinc-100 text-zinc-500'}`}>
                      {idx + 1}
                    </div>
                    <span className="font-semibold">{campaign.campaign_name}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-right font-semibold tabular-nums">{campaign.orders}</td>
                <td className="px-5 py-3.5 text-right font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {formatBRL(campaign.sales)}
                </td>
                <td className="px-5 py-3.5 text-right font-semibold text-blue-600 dark:text-blue-400 tabular-nums">
                  {formatBRL(campaign.spend)}
                </td>
                <td className="px-5 py-3.5 text-right tabular-nums">
                  <div className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${getRoasColor(campaign.roas)} ${getRoasBgColor(campaign.roas)}`}>
                    {campaign.roas.toFixed(2)}x
                  </div>
                </td>
                <td className="px-5 py-3.5 text-right tabular-nums">
                  <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${getRoiColor(campaign.roi)} ${getRoiBgColor(campaign.roi)}`}>
                    {campaign.roi > 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {formatPercent(campaign.roi)}
                  </div>
                </td>
                <td className="px-5 py-3.5 text-right font-semibold tabular-nums">
                  <span className={campaign.profit > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
                    {formatBRL(campaign.profit)}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
)

// Layout Mobile Component
const MobileCards = ({ campaigns, theme }: { campaigns: AdCampaignMetrics[]; theme: 'light' | 'dark' }) => (
  <div className="lg:hidden space-y-4">
    {campaigns.length === 0 ? (
      <div
        className={`px-6 py-8 text-center rounded-lg border ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-zinc-50 border-zinc-200 text-zinc-600'}`}
      >
        Nenhuma campanha para este período
      </div>
    ) : (
      campaigns.map((campaign, idx) => (
        <div
          key={campaign.campaign_id}
          className={`p-5 rounded-lg border transition-all ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700' : 'bg-white border-zinc-200 hover:border-zinc-300'}`}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${theme === 'dark' ? 'bg-zinc-800 text-zinc-500' : 'bg-zinc-100 text-zinc-500'}`}>
                  {idx + 1}
                </div>
                <h4 className="font-bold text-base">{campaign.campaign_name}</h4>
              </div>
              <p className={`text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-600'}`}>
                {campaign.orders} pedido{campaign.orders !== 1 ? 's' : ''}
              </p>
            </div>
            <div className={`text-right ${campaign.profit > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              <p className="text-sm font-bold">{formatBRL(campaign.profit)}</p>
              <p className="text-xs">lucro</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-sm mb-4">
            <div>
              <span className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>
                Vendas
              </span>
              <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 tabular-nums">
                {formatBRL(campaign.sales)}
              </p>
            </div>
            <div>
              <span className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>
                Gasto
              </span>
              <p className="font-bold text-blue-600 dark:text-blue-400 mt-0.5 tabular-nums">
                {formatBRL(campaign.spend)}
              </p>
            </div>
            <div>
              <span className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>
                Custo Prod.
              </span>
              <p className="font-bold text-zinc-700 dark:text-zinc-300 mt-0.5 tabular-nums">
                {formatBRL(campaign.productCost)}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div
              className={`flex-1 px-3 py-2 rounded-full font-bold text-center text-xs ${getRoasColor(campaign.roas)} ${getRoasBgColor(campaign.roas)}`}
            >
              <div className="opacity-75">ROAS</div>
              <div>{campaign.roas.toFixed(2)}x</div>
            </div>
            <div
              className={`flex-1 px-3 py-2 rounded-full font-bold text-center text-xs ${getRoiColor(campaign.roi)} ${getRoiBgColor(campaign.roi)}`}
            >
              <div className="opacity-75">ROI</div>
              <div>{formatPercent(campaign.roi)}</div>
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
