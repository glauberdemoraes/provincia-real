/**
 * HTTP Client para integração com APIs reais
 * NuvemShop + Meta Ads
 */

const NUVEMSHOP_API_BASE = 'https://api.nuvemshop.com.br/v1'
const META_API_BASE = 'https://graph.instagram.com'

export interface HttpClientConfig {
  storeId?: string
  nuvemshopToken?: string
  metaToken?: string
}

class HttpClient {
  private storeId: string
  private nuvemshopToken: string
  private metaToken: string

  constructor(config?: HttpClientConfig) {
    this.storeId = config?.storeId || import.meta.env.VITE_NUVEMSHOP_STORE_ID || ''
    this.nuvemshopToken = config?.nuvemshopToken || import.meta.env.VITE_NUVEMSHOP_TOKEN || ''
    this.metaToken = config?.metaToken || import.meta.env.VITE_META_ACCESS_TOKEN || ''
  }

  /**
   * Fetch orders from NuvemShop API
   */
  async fetchNuvemShopOrders(startDate: string, endDate: string) {
    if (!this.storeId || !this.nuvemshopToken) {
      console.warn('NuvemShop credentials not configured')
      return { orders: [], error: 'NuvemShop credentials not configured' }
    }

    try {
      const url = new URL(
        `${NUVEMSHOP_API_BASE}/${this.storeId}/orders`,
      )
      url.searchParams.set('created_after', startDate)
      url.searchParams.set('created_before', endDate)
      url.searchParams.set('limit', '100')

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authentication': `bearer ${this.nuvemshopToken}`,
          'User-Agent': 'Provincia-Real/1.0',
        },
      })

      if (!response.ok) {
        throw new Error(`NuvemShop API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return { orders: data.result || [], error: null }
    } catch (error) {
      console.error('Error fetching NuvemShop orders:', error)
      return { orders: [], error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  /**
   * Fetch campaigns from Meta API
   */
  async fetchMetaCampaigns() {
    if (!this.metaToken) {
      console.warn('Meta token not configured')
      return { campaigns: [], error: 'Meta token not configured' }
    }

    try {
      const url = new URL(`${META_API_BASE}/me/adaccounts`)
      url.searchParams.set('access_token', this.metaToken)
      url.searchParams.set('fields', 'campaigns')

      // First get ad accounts
      const accountsResponse = await fetch(url.toString())
      if (!accountsResponse.ok) {
        throw new Error(`Meta API error: ${accountsResponse.status}`)
      }

      const accountsData = await accountsResponse.json()
      const campaigns = []

      // Then fetch campaigns from each account
      if (accountsData.data) {
        for (const account of accountsData.data) {
          const campaignUrl = new URL(`${META_API_BASE}/${account.id}/campaigns`)
          campaignUrl.searchParams.set('access_token', this.metaToken)
          campaignUrl.searchParams.set('fields', 'id,name,spend,impressions,clicks,cpc,ctr,actions,effective_status')
          campaignUrl.searchParams.set('limit', '100')

          const campaignResponse = await fetch(campaignUrl.toString())
          if (campaignResponse.ok) {
            const campaignData = await campaignResponse.json()
            if (campaignData.data) {
              campaigns.push(...campaignData.data)
            }
          }
        }
      }

      return { campaigns, error: null }
    } catch (error) {
      console.error('Error fetching Meta campaigns:', error)
      return { campaigns: [], error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}

export const httpClient = new HttpClient()
