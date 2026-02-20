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
  <div className={`hidden lg:block rounded-lg border overflow-hidden ${theme === 'dark' ? 'border-slate-800/50' : 'border-slate-200/50'}`}>
    <div className={`overflow-x-auto`}>
      <table className="w-full text-sm">
        <thead>
          <tr
            className={`${theme === 'dark' ? 'bg-slate-800/30 border-b border-slate-800/50' : 'bg-slate-100/50 border-b border-slate-200/50'}`}
          >
            <th className="px-6 py-4 text-left font-bold text-slate-700 dark:text-slate-300">
              Campanha
            </th>
            <th className="px-6 py-4 text-right font-bold text-slate-700 dark:text-slate-300">
              Pedidos
            </th>
            <th className="px-6 py-4 text-right font-bold text-slate-700 dark:text-slate-300">
              Vendas
            </th>
            <th className="px-6 py-4 text-right font-bold text-slate-700 dark:text-slate-300">
              Gasto
            </th>
            <th className="px-6 py-4 text-right font-bold text-slate-700 dark:text-slate-300">
              ROAS
            </th>
            <th className="px-6 py-4 text-right font-bold text-slate-700 dark:text-slate-300">
              ROI
            </th>
            <th className="px-6 py-4 text-right font-bold text-slate-700 dark:text-slate-300">
              Lucro
            </th>
          </tr>
        </thead>
        <tbody>
          {campaigns.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                className={`px-6 py-8 text-center ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}
              >
                Nenhuma campanha para este período
              </td>
            </tr>
          ) : (
            campaigns.map((campaign, idx) => (
              <tr
                key={campaign.campaign_id}
                className={`border-b ${theme === 'dark' ? 'border-slate-800/30 hover:bg-slate-900/20' : 'border-slate-200/30 hover:bg-slate-50/50'} transition-colors`}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                      {idx + 1}
                    </div>
                    <span className="font-semibold">{campaign.campaign_name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-semibold">{campaign.orders}</td>
                <td className="px-6 py-4 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                  {formatBRL(campaign.sales)}
                </td>
                <td className="px-6 py-4 text-right font-semibold text-blue-600 dark:text-blue-400">
                  {formatBRL(campaign.spend)}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className={`inline-block px-3 py-1 rounded-lg font-bold ${getRoasColor(campaign.roas)} ${getRoasBgColor(campaign.roas)}`}>
                    {campaign.roas.toFixed(2)}x
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg font-bold ${getRoiColor(campaign.roi)} ${getRoiBgColor(campaign.roi)}`}>
                    {campaign.roi > 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {formatPercent(campaign.roi)}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className={campaign.profit > 0 ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-red-600 dark:text-red-400 font-semibold'}>
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
        className={`px-6 py-8 text-center rounded-lg ${theme === 'dark' ? 'bg-slate-900/30 text-slate-400' : 'bg-slate-50 text-slate-600'}`}
      >
        Nenhuma campanha para este período
      </div>
    ) : (
      campaigns.map((campaign, idx) => (
        <div
          key={campaign.campaign_id}
          className={`p-5 rounded-lg border backdrop-blur ${theme === 'dark' ? 'bg-slate-900/40 border-slate-800/50 hover:bg-slate-900/60' : 'bg-white/50 border-slate-200/50 hover:bg-white/70'} transition-all`}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                  {idx + 1}
                </div>
                <h4 className="font-bold text-base">{campaign.campaign_name}</h4>
              </div>
              <p className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>
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
              <span className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                Vendas
              </span>
              <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {formatBRL(campaign.sales)}
              </p>
            </div>
            <div>
              <span className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                Gasto
              </span>
              <p className="font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                {formatBRL(campaign.spend)}
              </p>
            </div>
            <div>
              <span className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                Custo Prod.
              </span>
              <p className="font-bold text-slate-700 dark:text-slate-300 mt-0.5">
                {formatBRL(campaign.productCost)}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div
              className={`flex-1 px-3 py-2 rounded-lg font-bold text-center text-sm ${getRoasColor(campaign.roas)} ${getRoasBgColor(campaign.roas)}`}
            >
              <div className="text-xs opacity-75">ROAS</div>
              <div>{campaign.roas.toFixed(2)}x</div>
            </div>
            <div
              className={`flex-1 px-3 py-2 rounded-lg font-bold text-center text-sm ${getRoiColor(campaign.roi)} ${getRoiBgColor(campaign.roi)}`}
            >
              <div className="text-xs opacity-75">ROI</div>
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
