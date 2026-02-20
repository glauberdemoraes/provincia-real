import React from 'react'
import { Package } from 'lucide-react'

interface ProductCellProps {
  productName: string
  sku?: string
  showIcon?: boolean
}

/**
 * Renderiza nome de produto de forma otimizada para UX
 * Separa "Kit" do resto do nome e exibe conteúdo em destaque
 *
 * Exemplo:
 * "Kit Trio Doce de Leite Cremoso Artesanal Província Real (3 Potes 680g)"
 *
 * Renderiza como:
 * [Kit Badge] Doce de Leite Cremoso Artesanal Província Real
 * 3 Potes 680g
 */
export const ProductCell: React.FC<ProductCellProps> = ({
  productName,
  sku,
  showIcon = true,
}) => {
  // Regex para extrair tipo de kit e conteúdo
  const kitRegex = /^(Kit\s+\w+)\s+(.+?)\s*\((.+?)\)$/i
  const match = productName.match(kitRegex)

  if (match) {
    const [, kitType, productBase, content] = match
    const isKit = kitType.toLowerCase().startsWith('kit')

    return (
      <div className="flex items-start gap-2">
        {showIcon && <Package className="w-4 h-4 text-blue-500 dark:text-blue-400 flex-shrink-0 mt-0.5" />}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {isKit && (
              <span className="inline-block px-2 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded">
                {kitType}
              </span>
            )}
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50 truncate">
              {productBase}
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {content}
          </p>
          {sku && (
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
              SKU: {sku}
            </p>
          )}
        </div>
      </div>
    )
  }

  // Fallback para produtos que não são kit
  return (
    <div className="flex items-start gap-2">
      {showIcon && <Package className="w-4 h-4 text-zinc-400 dark:text-zinc-600 flex-shrink-0 mt-0.5" />}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 truncate">
          {productName}
        </p>
        {sku && (
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
            SKU: {sku}
          </p>
        )}
      </div>
    </div>
  )
}
