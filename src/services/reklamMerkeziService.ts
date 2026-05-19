import type {
  BudgetShiftRecommendation,
  Campaign,
  CampaignHealthStatus,
  CampaignPerformance,
  CampaignProfitResult,
  Order,
  Product,
  RecommendedCampaignAction,
  ReturnRequest,
} from '../types'

const clampScore = (score: number) => Math.min(100, Math.max(0, Math.round(score)))

const activeReturnStatuses = new Set<ReturnRequest['status']>(['requested', 'approved', 'review'])

function isCampaignLinkedToProduct(campaign: Campaign, productId: string) {
  return campaign.productId === productId || campaign.productIds?.includes(productId) === true
}

function getCampaignProducts(campaign: Campaign, products: Product[], campaignOrders: Order[]) {
  const productIds = new Set<string>()

  if (campaign.productId) {
    productIds.add(campaign.productId)
  }

  campaign.productIds?.forEach((productId) => productIds.add(productId))
  campaignOrders.forEach((order) => productIds.add(order.productId))

  return products.filter(
    (product) => productIds.has(product.id) || isCampaignLinkedToProduct(campaign, product.id),
  )
}

function getPerformanceTotals(campaignId: string, performances?: CampaignPerformance[]) {
  const rows = performances?.filter((performance) => performance.campaignId === campaignId) ?? []

  return {
    adSpend: rows.reduce((sum, performance) => sum + performance.adSpend, 0),
    attributedOrders: rows.reduce(
      (sum, performance) => sum + performance.attributedOrders,
      0,
    ),
    attributedRevenue: rows.reduce(
      (sum, performance) => sum + performance.attributedRevenue,
      0,
    ),
  }
}

export function calculateProfitBasedROAS(result: Pick<CampaignProfitResult, 'adSpend' | 'netProfitAfterAds'>) {
  return result.adSpend > 0 ? result.netProfitAfterAds / result.adSpend : 0
}

export function detectWastefulAdSpend(
  result: Pick<CampaignProfitResult, 'adSpend' | 'netProfitAfterAds' | 'netMarginAfterAds'>,
) {
  return result.adSpend > 0 && (result.netProfitAfterAds <= 0 || result.netMarginAfterAds < 0.05)
}

export function calculateCampaignHealthScore(result: CampaignProfitResult) {
  let score = 70

  if (result.roas >= 4) {
    score += 10
  } else if (result.roas >= 2) {
    score += 5
  } else if (result.roas < 1.5) {
    score -= 10
  }

  if (result.netProfitAfterAds > 0) {
    score += 10
  } else if (result.netProfitAfterAds < 0) {
    score -= 30
  }

  if (result.netMarginAfterAds >= 0.2) {
    score += 10
  } else if (result.netMarginAfterAds >= 0.1) {
    score += 5
  } else if (result.netMarginAfterAds < 0.05) {
    score -= 15
  }

  if (result.profitBasedROAS >= 1) {
    score += 10
  } else if (result.profitBasedROAS >= 0.3) {
    score += 5
  } else if (result.profitBasedROAS < 0) {
    score -= 20
  }

  const returnRatio =
    result.attributedRevenue > 0 ? result.returnImpact / result.attributedRevenue : 0

  if (returnRatio > 0.15) {
    score -= 15
  } else if (returnRatio > 0.08) {
    score -= 8
  }

  return clampScore(score)
}

export function getCampaignHealthStatus(
  score: number,
  netProfitAfterAds: number,
  netMarginAfterAds: number,
): CampaignHealthStatus {
  if (netProfitAfterAds < 0 || netMarginAfterAds < 0) {
    return 'loss'
  }

  if (score >= 78) {
    return 'healthy'
  }

  if (score >= 65) {
    return 'watch'
  }

  return 'risky'
}

export function recommendBudgetAction(result: CampaignProfitResult): {
  action: RecommendedCampaignAction
  explanation: string
} {
  const returnRatio =
    result.attributedRevenue > 0 ? result.returnImpact / result.attributedRevenue : 0

  if (result.netProfitAfterAds < 0) {
    return {
      action: 'pause_campaign',
      explanation:
        'Mevcut verilere göre bu kampanya reklam sonrası negatif bölgede görünüyor. Bütçe artırmadan önce ürün maliyeti, iade ve kargo etkisi manuel kontrol edilebilir.',
    }
  }

  if (returnRatio > 0.15) {
    return {
      action: 'review_returns',
      explanation:
        'Bu kampanyada iade etkisi net kârı baskılıyor olabilir. İade nedenleri ve ürün vaadi bütçe kararından önce incelenebilir.',
    }
  }

  if (result.wastedAdSpend || result.profitBasedROAS < 0.3) {
    return {
      action: 'reduce_budget',
      explanation:
        'Mevcut verilere göre ROAS iyi görünse de reklam sonrası net kâr zayıf. Bütçe artırmadan önce kargo ve iade etkisi kontrol edilmeli.',
    }
  }

  if (result.healthStatus === 'healthy' && result.netMarginAfterAds >= 0.18) {
    return {
      action: 'increase_budget',
      explanation:
        'Bu kampanya mevcut demo verisinde sağlıklı net marj üretiyor. Bütçe artışı ancak stok, iade ve marj sinyalleri izlenerek değerlendirilebilir.',
    }
  }

  if (result.healthStatus === 'watch') {
    return {
      action: 'monitor',
      explanation:
        'Bu kampanya satış getiriyor; kâr tarafı yeniden kontrol edilmeli. Pinti burada düzenli takip öneriyor.',
    }
  }

  return {
    action: 'shift_budget',
    explanation:
      'Bu kampanyada reklam harcaması net marjı baskılıyor olabilir. Daha sağlıklı net marj üreten kampanyalara kademeli bütçe kaydırma değerlendirilebilir.',
  }
}

export function calculateCampaignProfit(
  campaign: Campaign,
  products: Product[],
  orders: Order[],
  returns: ReturnRequest[],
  performances?: CampaignPerformance[],
): CampaignProfitResult {
  const campaignOrders = orders.filter(
    (order) => order.campaignId === campaign.id && order.status === 'completed',
  )
  const orderById = new Map(campaignOrders.map((order) => [order.id, order]))
  const productById = new Map(products.map((product) => [product.id, product]))
  const performanceTotals = getPerformanceTotals(campaign.id, performances)

  const productNames = getCampaignProducts(campaign, products, campaignOrders).map(
    (product) => product.name,
  )
  const orderRevenue = campaignOrders.reduce(
    (sum, order) => sum + order.unitPrice * order.quantity,
    0,
  )
  const attributedRevenue =
    performanceTotals.attributedRevenue || campaign.attributedRevenue || orderRevenue
  const adSpend = performanceTotals.adSpend || campaign.totalSpend
  const attributedOrders = performanceTotals.attributedOrders || campaignOrders.length

  const productCost = campaignOrders.reduce((sum, order) => {
    const product = productById.get(order.productId)
    return sum + (product?.unitCost ?? 0) * order.quantity
  }, 0)

  const commissionCost = campaignOrders.reduce((sum, order) => {
    const product = productById.get(order.productId)
    return sum + order.unitPrice * order.quantity * (product?.commissionRate ?? 0)
  }, 0)

  const shippingCost = campaignOrders.reduce((sum, order) => {
    const product = productById.get(order.productId)
    return sum + (product?.averageShippingCost ?? 0)
  }, 0)

  const returnImpact = returns
    .filter((returnRequest) => {
      const order = orderById.get(returnRequest.orderId)
      return order?.campaignId === campaign.id && activeReturnStatuses.has(returnRequest.status)
    })
    .reduce(
      (sum, returnRequest) =>
        sum + returnRequest.refundAmount + returnRequest.returnShippingCost,
      0,
    )

  const roas = adSpend > 0 ? attributedRevenue / adSpend : 0
  const netProfitAfterAds =
    attributedRevenue - productCost - commissionCost - shippingCost - returnImpact - adSpend
  const netMarginAfterAds = attributedRevenue > 0 ? netProfitAfterAds / attributedRevenue : 0
  const profitBasedROAS = calculateProfitBasedROAS({
    adSpend,
    netProfitAfterAds,
  })
  const wastedAdSpend = detectWastefulAdSpend({
    adSpend,
    netProfitAfterAds,
    netMarginAfterAds,
  })

  const baseResult: CampaignProfitResult = {
    campaignId: campaign.id,
    campaignName: campaign.name,
    channel: campaign.channel,
    objective: campaign.objective,
    productNames,
    adSpend,
    attributedRevenue,
    attributedOrders,
    roas,
    productCost,
    commissionCost,
    shippingCost,
    returnImpact,
    netProfitAfterAds,
    netMarginAfterAds,
    profitBasedROAS,
    wastedAdSpend,
    healthScore: 0,
    healthStatus: 'watch',
    recommendedAction: 'monitor',
    explanation: '',
  }

  const healthScore = calculateCampaignHealthScore(baseResult)
  const healthStatus = getCampaignHealthStatus(
    healthScore,
    netProfitAfterAds,
    netMarginAfterAds,
  )
  const recommendation = recommendBudgetAction({
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

export function calculateAllCampaignProfits(
  campaigns: Campaign[],
  products: Product[],
  orders: Order[],
  returns: ReturnRequest[],
  performances?: CampaignPerformance[],
) {
  return campaigns.map((campaign) =>
    calculateCampaignProfit(campaign, products, orders, returns, performances),
  )
}

export function recommendBudgetShift(
  results: CampaignProfitResult[],
): BudgetShiftRecommendation | null {
  const source = results
    .filter((result) => result.adSpend > 0 && result.healthStatus !== 'healthy')
    .toSorted(
      (first, second) =>
        first.netProfitAfterAds - second.netProfitAfterAds ||
        first.profitBasedROAS - second.profitBasedROAS,
    )[0]

  const target = results
    .filter((result) => result.healthStatus === 'healthy' && result.netProfitAfterAds > 0)
    .toSorted(
      (first, second) =>
        second.netMarginAfterAds - first.netMarginAfterAds ||
        second.profitBasedROAS - first.profitBasedROAS,
    )[0]

  if (!source || !target || source.campaignId === target.campaignId) {
    return null
  }

  const suggestedAmount = Math.max(
    100,
    Math.round(Math.min(source.adSpend * 0.25, target.adSpend * 0.5) / 50) * 50,
  )
  const scoreGap = Math.max(0, target.healthScore - source.healthScore)
  const confidence = Math.min(0.92, Math.max(0.52, scoreGap / 100 + 0.45))

  return {
    fromCampaignId: source.campaignId,
    fromCampaignName: source.campaignName,
    toCampaignId: target.campaignId,
    toCampaignName: target.campaignName,
    suggestedAmount,
    reason:
      'Mevcut verilere göre bütçenin küçük bir kısmı düşük net kârlı kampanyadan daha sağlıklı net marj üreten kampanyaya kaydırılarak test edilebilir.',
    confidence,
  }
}
