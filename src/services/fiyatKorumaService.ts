import type {
  Campaign,
  Order,
  PriceAlternativeSuggestion,
  PriceProtectionResult,
  PriceRiskLevel,
  Product,
  RecommendedPriceAction,
  ReturnRequest,
} from '../types'

const activeReturnStatuses = new Set<ReturnRequest['status']>(['requested', 'approved', 'review'])

function isCampaignLinkedToProduct(campaign: Campaign, productId: string) {
  return campaign.productId === productId || campaign.productIds?.includes(productId) === true
}

function roundCurrency(value: number) {
  return Math.round(Number.isFinite(value) ? value : 0)
}

function calculateAverageUnitPrice(product: Product, orders: Order[]) {
  if (product.currentPrice > 0) {
    return product.currentPrice
  }

  const productOrders = orders.filter(
    (order) => order.productId === product.id && order.status === 'completed',
  )
  const unitsSold = productOrders.reduce((sum, order) => sum + order.quantity, 0)
  const revenue = productOrders.reduce(
    (sum, order) => sum + order.unitPrice * order.quantity,
    0,
  )

  return unitsSold > 0 ? revenue / unitsSold : product.salePrice
}

function calculateAdCostPerUnit(product: Product, orders: Order[], campaigns: Campaign[]) {
  if (product.expectedAdCostPerUnit > 0) {
    return product.expectedAdCostPerUnit
  }

  const unitsSold = orders
    .filter((order) => order.productId === product.id && order.status === 'completed')
    .reduce((sum, order) => sum + order.quantity, 0)
  const campaignSpend = campaigns
    .filter((campaign) => isCampaignLinkedToProduct(campaign, product.id))
    .reduce((sum, campaign) => sum + campaign.totalSpend, 0)

  return unitsSold > 0 && campaignSpend > 0
    ? campaignSpend / unitsSold
    : product.expectedAdCostPerUnit
}

function calculateReturnCostPerUnit(product: Product, orders: Order[], returns: ReturnRequest[]) {
  if (product.expectedReturnCostPerUnit > 0) {
    return product.expectedReturnCostPerUnit
  }

  const unitsSold = orders
    .filter((order) => order.productId === product.id && order.status === 'completed')
    .reduce((sum, order) => sum + order.quantity, 0)
  const returnImpact = returns
    .filter(
      (returnRequest) =>
        returnRequest.productId === product.id && activeReturnStatuses.has(returnRequest.status),
    )
    .reduce(
      (sum, returnRequest) =>
        sum + returnRequest.refundAmount + returnRequest.returnShippingCost,
      0,
    )

  return unitsSold > 0 && returnImpact > 0
    ? returnImpact / unitsSold
    : product.expectedReturnCostPerUnit
}

export function calculateCurrentNetMargin(
  product: Product,
  orders: Order[],
  returns: ReturnRequest[],
  campaigns: Campaign[],
) {
  const currentPrice = calculateAverageUnitPrice(product, orders)
  const expectedAdCostPerUnit = calculateAdCostPerUnit(product, orders, campaigns)
  const expectedReturnCostPerUnit = calculateReturnCostPerUnit(product, orders, returns)
  const commissionCost = currentPrice * product.commissionRate
  const netProfitPerUnit =
    currentPrice -
    product.unitCost -
    product.averageShippingCost -
    expectedAdCostPerUnit -
    expectedReturnCostPerUnit -
    commissionCost

  return currentPrice > 0 ? netProfitPerUnit / currentPrice : 0
}

export function calculateMinimumHealthyPrice(product: Product, targetNetMargin: number) {
  const costBase =
    product.unitCost +
    product.averageShippingCost +
    product.expectedAdCostPerUnit +
    product.expectedReturnCostPerUnit
  const denominator =
    product.commissionRate + targetNetMargin >= 0.9
      ? 0.1
      : 1 - product.commissionRate - targetNetMargin

  if (denominator <= 0 || !Number.isFinite(denominator)) {
    return roundCurrency(costBase * 1.25)
  }

  return roundCurrency(costBase / denominator)
}

export function calculatePriceGap(currentPrice: number, minimumHealthyPrice: number) {
  return roundCurrency(Math.max(0, minimumHealthyPrice - currentPrice))
}

export function detectPriceRisk(
  result: Pick<
    PriceProtectionResult,
    'currentPrice' | 'currentNetMargin' | 'minimumHealthyPrice' | 'priceGap' | 'targetNetMargin'
  >,
): PriceRiskLevel {
  if (result.currentNetMargin < 0 || result.currentNetMargin < result.targetNetMargin - 0.12) {
    return 'critical'
  }

  if (result.currentPrice >= result.minimumHealthyPrice && result.currentNetMargin >= result.targetNetMargin) {
    return 'safe'
  }

  const gapRatio =
    result.minimumHealthyPrice > 0 ? result.priceGap / result.minimumHealthyPrice : 0

  if (gapRatio > 0.2) {
    return 'critical'
  }

  if (gapRatio > 0.08 || result.currentNetMargin < result.targetNetMargin - 0.06) {
    return 'risky'
  }

  if (gapRatio > 0 || result.currentNetMargin < result.targetNetMargin) {
    return 'watch'
  }

  return 'safe'
}

export function suggestPriceAlternatives(
  result: Pick<
    PriceProtectionResult,
    | 'averageShippingCost'
    | 'currentNetMargin'
    | 'expectedAdCostPerUnit'
    | 'expectedReturnCostPerUnit'
    | 'priceGap'
    | 'targetNetMargin'
  > & {
    currentDiscountRate: number
  },
): PriceAlternativeSuggestion[] {
  const alternatives: PriceAlternativeSuggestion[] = []

  if (result.priceGap > 0) {
    alternatives.push({
      type: 'bundle',
      title: 'Bundle oluştur',
      explanation:
        'Tek ürün fiyatını doğrudan artırmadan sepet değerini yükseltecek tamamlayıcı ürün paketi test edilebilir.',
      estimatedEffect: 'Sepet başına net katkıyı artırabilir',
      priority: result.priceGap > 80 ? 'high' : 'medium',
    })
  }

  if (result.averageShippingCost > 55) {
    alternatives.push({
      type: 'cart_threshold',
      title: 'Sepet eşiği belirle',
      explanation:
        'Kargo maliyeti net marjı baskılıyorsa ücretsiz kargo veya indirim eşiği daha kontrollü kurgulanabilir.',
      estimatedEffect: 'Kargo maliyetinin marj üzerindeki baskısını azaltabilir',
      priority: 'high',
    })
  }

  if (result.expectedAdCostPerUnit > 55) {
    alternatives.push({
      type: 'ad_cost',
      title: 'Reklam maliyetini azalt',
      explanation:
        'Ürün fiyatına dokunmadan önce ürün bazlı reklam harcaması ve kampanya hedeflemesi yeniden değerlendirilebilir.',
      estimatedEffect: 'Birim başına reklam etkisini düşürebilir',
      priority: 'high',
    })
  }

  if (result.currentDiscountRate > 0.1) {
    alternatives.push({
      type: 'discount',
      title: 'İndirim oranını gözden geçir',
      explanation:
        'Kampanya indirimi hedef net marjı aşağı çekiyorsa indirim süresi veya oranı daha kontrollü test edilebilir.',
      estimatedEffect: 'İndirim sonrası net marjı toparlayabilir',
      priority: 'high',
    })
  }

  if (result.expectedReturnCostPerUnit > 45) {
    alternatives.push({
      type: 'return_cost',
      title: 'İade etkisini azalt',
      explanation:
        'Ürün açıklaması, görsel beklenti ve kalite kontrol akışı güçlendirilerek iade kaynaklı fiyat baskısı azaltılabilir.',
      estimatedEffect: 'İade maliyetinin fiyat tabanına etkisini düşürebilir',
      priority: 'medium',
    })
  }

  if (result.currentNetMargin < result.targetNetMargin) {
    alternatives.push({
      type: 'value_perception',
      title: 'Değer algısını güçlendir',
      explanation:
        'Fiyatı artırmadan önce ürün açıklaması, karşılaştırma mesajı ve görsel fayda dili netleştirilebilir.',
      estimatedEffect: 'Fiyat hassasiyetini azaltmaya yardımcı olabilir',
      priority: 'medium',
    })
  }

  return alternatives.length > 0
    ? alternatives
    : [
        {
          type: 'monitor',
          title: 'Düzenli takip',
          explanation:
            'Mevcut fiyat seviyesi demo verisinde sağlıklı görünüyor. Rakip fiyatı, stok ve kampanya etkisi izlenebilir.',
          estimatedEffect: 'Fiyat riskinin erken yakalanmasını sağlar',
          priority: 'low',
        },
      ]
}

export function generatePriceRecommendation(result: PriceProtectionResult): {
  action: RecommendedPriceAction
  explanation: string
} {
  if (result.riskLevel === 'critical') {
    if (result.expectedAdCostPerUnit > 70) {
      return {
        action: 'reduce_ad_cost',
        explanation:
          'Mevcut verilere göre reklam etkisi minimum sağlıklı fiyatı yukarı çekiyor. Fiyat artırmadan önce reklam maliyeti ve kampanya stratejisi yeniden değerlendirilebilir.',
      }
    }

    if (result.expectedReturnCostPerUnit > 55) {
      return {
        action: 'create_bundle',
        explanation:
          'Bu fiyat seviyesinde iade etkisi hedef net marjı baskılıyor. Bundle veya sepet eşiği gibi alternatifler değerlendirilebilir.',
      }
    }

    return {
      action: 'increase_price_carefully',
      explanation:
        'Mevcut verilere göre bu ürünün fiyatı hedef net marjın altında kalıyor. Bu çıktı fiyatlandırma tavsiyesi değildir; karar desteği olarak manuel kontrol önerilir.',
    }
  }

  if (result.riskLevel === 'risky') {
    if (result.expectedAdCostPerUnit > 50) {
      return {
        action: 'reduce_ad_cost',
        explanation:
          'Bu fiyat seviyesinde reklam maliyeti net marjı baskılıyor olabilir. Reklam harcaması azaltma veya hedefleme kontrolü değerlendirilebilir.',
      }
    }

    return {
      action: 'review_price',
      explanation:
        'Mevcut verilere göre ürün hedef net marjın altında görünüyor. Fiyat, kargo ve kampanya etkisi birlikte kontrol edilebilir.',
    }
  }

  if (result.riskLevel === 'watch') {
    if (result.priceGap > 0) {
      return {
        action: 'set_cart_threshold',
        explanation:
          'Minimum sağlıklı fiyat mevcut fiyata yakın görünüyor. Fiyat artırmak yerine sepet eşiği veya bundle testi değerlendirilebilir.',
      }
    }

    return {
      action: 'monitor',
      explanation:
        'Bu ürün hedef marja yakın seyrediyor. İndirim ve reklam etkisi düzenli takip edilebilir.',
    }
  }

  return {
    action: 'monitor',
    explanation:
      'Bu ürün mevcut demo verisinde sağlıklı fiyat aralığında görünüyor. Rakip fiyat, stok ve kampanya etkisi izlenebilir.',
  }
}

export function calculateAllPriceProtection(
  products: Product[],
  orders: Order[],
  returns: ReturnRequest[],
  campaigns: Campaign[],
): PriceProtectionResult[] {
  return products.map((product) => {
    const currentNetMargin = calculateCurrentNetMargin(product, orders, returns, campaigns)
    const minimumHealthyPrice = calculateMinimumHealthyPrice(
      product,
      product.targetNetMargin,
    )
    const priceGap = calculatePriceGap(product.currentPrice, minimumHealthyPrice)
    const baseResult: PriceProtectionResult = {
      productId: product.id,
      productName: product.name,
      category: product.category,
      currentPrice: product.currentPrice,
      unitCost: product.unitCost,
      commissionRate: product.commissionRate,
      averageShippingCost: product.averageShippingCost,
      expectedAdCostPerUnit: product.expectedAdCostPerUnit,
      expectedReturnCostPerUnit: product.expectedReturnCostPerUnit,
      targetNetMargin: product.targetNetMargin,
      currentNetMargin,
      minimumHealthyPrice,
      priceGap,
      riskLevel: 'watch',
      recommendedAction: 'monitor',
      alternatives: [],
      explanation: '',
    }
    const riskLevel = detectPriceRisk(baseResult)
    const alternatives = suggestPriceAlternatives({
      ...baseResult,
      currentDiscountRate: product.currentDiscountRate,
    })
    const recommendation = generatePriceRecommendation({
      ...baseResult,
      riskLevel,
      alternatives,
    })

    return {
      ...baseResult,
      riskLevel,
      alternatives,
      recommendedAction: recommendation.action,
      explanation: recommendation.explanation,
    }
  })
}
