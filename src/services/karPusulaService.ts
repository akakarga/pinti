import type {
  Campaign,
  Order,
  Product,
  ProductHealthStatus,
  ProductProfitResult,
  RecommendedProductAction,
  ReturnRequest,
} from '../types'

const clampScore = (score: number) => Math.min(100, Math.max(0, Math.round(score)))

const activeReturnStatuses = new Set<ReturnRequest['status']>(['requested', 'approved', 'review'])

function isCampaignLinkedToProduct(campaign: Campaign, productId: string) {
  return campaign.productId === productId || campaign.productIds?.includes(productId) === true
}

export function calculateProductHealthScore(result: ProductProfitResult) {
  let score = 70

  if (result.netMargin >= 0.25) {
    score += 15
  } else if (result.netMargin >= 0.15) {
    score += 8
  } else if (result.netMargin >= 0.05) {
    score += 0
  } else if (result.netMargin < 0) {
    score -= 35
  } else {
    score -= 15
  }

  if (result.returnRate > 0.2) {
    score -= 20
  } else if (result.returnRate > 0.1) {
    score -= 10
  }

  const adRatio = result.revenue > 0 ? result.adSpend / result.revenue : 0

  if (adRatio > 0.25) {
    score -= 15
  } else if (adRatio > 0.15) {
    score -= 8
  }

  if (result.stock < 10) {
    score -= 5
  }

  if (result.netProfit < 0) {
    score -= 20
  }

  return clampScore(score)
}

export function getProductHealthStatus(
  score: number,
  netProfit: number,
  netMargin: number,
): ProductHealthStatus {
  if (netProfit < 0 || netMargin < 0) {
    return 'loss'
  }

  if (score >= 78) {
    return 'healthy'
  }

  if (score >= 58) {
    return 'watch'
  }

  return 'risky'
}

export function generateProductRecommendation(result: ProductProfitResult): {
  action: RecommendedProductAction
  explanation: string
} {
  const adRatio = result.revenue > 0 ? result.adSpend / result.revenue : 0

  if (result.netProfit < 0) {
    return {
      action: 'pause_promotion',
      explanation:
        'Mevcut verilere göre net kâr negatif görünüyor. Kampanya etkisi, fiyat ve iade maliyeti birlikte manuel kontrol edilebilir.',
    }
  }

  if (result.returnRate > 0.2) {
    return {
      action: 'review_returns',
      explanation:
        'Bu ürün için iade etkisi yüksek görünüyor. Ürün açıklaması, paketleme ve kalite sinyalleri yeniden değerlendirilebilir.',
    }
  }

  if (adRatio > 0.22) {
    return {
      action: 'reduce_ads',
      explanation:
        'Reklam maliyeti net kârı baskılıyor olabilir. Reklam artırmadan önce kargo ve iade etkisi kontrol edilmeli.',
    }
  }

  if (result.netMargin < 0.08) {
    return {
      action: 'increase_price',
      explanation:
        'Mevcut verilere göre bu ürünün net marjı düşük görünüyor. Fiyat, komisyon ve kargo etkisi birlikte gözden geçirilebilir.',
    }
  }

  if (result.stock < 10 && result.netMargin >= 0.12) {
    return {
      action: 'reorder_carefully',
      explanation:
        'Bu ürün makul kârlılık bırakıyor; stok seviyesi düşük olduğu için yeniden sipariş kararı dikkatli planlanabilir.',
    }
  }

  return {
    action: 'monitor',
    explanation:
      'Bu ürün mevcut demo verisinde dengeli görünüyor. Marj, iade ve reklam oranı periyodik olarak izlenebilir.',
  }
}

export function calculateProductProfit(
  product: Product,
  orders: Order[],
  returns: ReturnRequest[],
  campaigns: Campaign[],
): ProductProfitResult {
  const productOrders = orders.filter(
    (order) => order.productId === product.id && order.status === 'completed',
  )
  const productReturns = returns.filter(
    (returnRequest) =>
      returnRequest.productId === product.id && activeReturnStatuses.has(returnRequest.status),
  )
  const productCampaigns = campaigns.filter((campaign) =>
    isCampaignLinkedToProduct(campaign, product.id),
  )

  const unitsSold = productOrders.reduce((sum, order) => sum + order.quantity, 0)
  const revenue = productOrders.reduce(
    (sum, order) => sum + order.unitPrice * order.quantity,
    0,
  )
  const productCost = unitsSold * product.unitCost
  const commissionCost = revenue * product.commissionRate
  const shippingCost = productOrders.length * product.averageShippingCost
  const grossProfit = revenue - productCost
  const returnImpact = productReturns.reduce(
    (sum, returnRequest) =>
      sum + returnRequest.refundAmount + returnRequest.returnShippingCost,
    0,
  )
  const adSpend = productCampaigns.reduce(
    (sum, campaign) => sum + campaign.totalSpend,
    0,
  )
  const netProfit =
    revenue - productCost - commissionCost - shippingCost - adSpend - returnImpact
  const netMargin = revenue > 0 ? netProfit / revenue : 0
  const returnRate = productOrders.length > 0 ? productReturns.length / productOrders.length : 0

  const baseResult: ProductProfitResult = {
    productId: product.id,
    productName: product.name,
    category: product.category,
    unitsSold,
    revenue,
    productCost,
    commissionCost,
    shippingCost,
    adSpend,
    returnImpact,
    grossProfit,
    netProfit,
    netMargin,
    returnRate,
    stock: product.stock,
    healthScore: 0,
    healthStatus: 'watch',
    recommendedAction: 'monitor',
    explanation: '',
  }

  const healthScore = calculateProductHealthScore(baseResult)
  const healthStatus = getProductHealthStatus(healthScore, netProfit, netMargin)
  const recommendation = generateProductRecommendation({
    ...baseResult,
    healthScore,
    healthStatus,
  })

  return {
    ...baseResult,
    healthScore,
    healthStatus,
    recommendedAction: recommendation.action,
    explanation: recommendation.explanation,
  }
}

export function calculateAllProductProfits(
  products: Product[],
  orders: Order[],
  returns: ReturnRequest[],
  campaigns: Campaign[],
) {
  return products.map((product) =>
    calculateProductProfit(product, orders, returns, campaigns),
  )
}
