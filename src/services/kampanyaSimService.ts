import type {
  CampaignAlternative,
  CampaignSimulationResult,
  CampaignSimulationRiskLevel,
  CampaignSimulationScenario,
  Product,
  RecommendedCampaignSimulationAction,
} from '../types'

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function roundCurrency(value: number) {
  return Math.round(Number.isFinite(value) ? value : 0)
}

function getSafePrice(value: number) {
  return Math.max(0, roundCurrency(value))
}

export function calculateCurrentUnitNetProfit(product: Product) {
  const commissionCost = product.salePrice * product.commissionRate

  return roundCurrency(
    product.salePrice -
      product.unitCost -
      commissionCost -
      product.averageShippingCost -
      product.expectedAdCostPerUnit -
      product.expectedReturnCostPerUnit,
  )
}

export function calculateFreeShippingImpact(
  product: Product,
  scenario: CampaignSimulationScenario,
) {
  return scenario.freeShipping ? product.averageShippingCost : 0
}

export function simulateDiscountCampaign(
  product: Product,
  scenario: CampaignSimulationScenario,
) {
  const campaignPrice = getSafePrice(
    product.salePrice * (1 - scenario.discountRate) - scenario.couponAmount,
  )
  const campaignCommissionCost = campaignPrice * product.commissionRate
  const freeShippingImpact = calculateFreeShippingImpact(product, scenario)
  const shippingImpact = product.averageShippingCost + freeShippingImpact
  const campaignUnitNetProfit = roundCurrency(
    campaignPrice -
      product.unitCost -
      campaignCommissionCost -
      shippingImpact -
      product.expectedAdCostPerUnit -
      product.expectedReturnCostPerUnit,
  )

  return {
    campaignPrice,
    campaignUnitNetProfit,
    campaignNetMargin: campaignPrice > 0 ? campaignUnitNetProfit / campaignPrice : 0,
    freeShippingImpact,
  }
}

export function calculateBreakEvenUnits(
  currentTotalProfit: number,
  campaignUnitNetProfit: number,
) {
  if (campaignUnitNetProfit <= 0 || currentTotalProfit <= 0) {
    return null
  }

  return Math.ceil(currentTotalProfit / campaignUnitNetProfit)
}

export function calculateRequiredSalesLift(
  currentUnitsSold: number,
  breakEvenUnits: number | null,
) {
  if (breakEvenUnits === null || currentUnitsSold <= 0) {
    return null
  }

  return (breakEvenUnits - currentUnitsSold) / currentUnitsSold
}

export function detectCampaignRisk(
  result: Pick<
    CampaignSimulationResult,
    | 'campaignNetMargin'
    | 'campaignPrice'
    | 'campaignUnitNetProfit'
    | 'currentUnitNetProfit'
    | 'expectedSalesLift'
    | 'freeShippingImpact'
    | 'profitDropPerUnit'
    | 'requiredSalesLift'
  > & {
    targetNetMargin: number
  },
): CampaignSimulationRiskLevel {
  if (result.campaignUnitNetProfit <= 0 || result.campaignNetMargin < 0.05) {
    return 'critical'
  }

  if (result.requiredSalesLift === null) {
    return 'critical'
  }

  if (result.requiredSalesLift > result.expectedSalesLift * 2.3) {
    return 'critical'
  }

  const profitDropRatio =
    result.currentUnitNetProfit > 0
      ? result.profitDropPerUnit / result.currentUnitNetProfit
      : 0
  const freeShippingRatio =
    result.campaignPrice > 0 ? result.freeShippingImpact / result.campaignPrice : 0

  if (
    result.requiredSalesLift > result.expectedSalesLift * 1.8 ||
    profitDropRatio > 0.7 ||
    result.campaignNetMargin < result.targetNetMargin - 0.1
  ) {
    return 'risky'
  }

  if (
    profitDropRatio > 0.35 ||
    freeShippingRatio > 0.12 ||
    result.campaignNetMargin < result.targetNetMargin ||
    result.requiredSalesLift > result.expectedSalesLift
  ) {
    return 'watch'
  }

  return 'safe'
}

export function suggestCampaignAlternatives(
  result: Pick<
    CampaignSimulationResult,
    | 'campaignType'
    | 'campaignUnitNetProfit'
    | 'expectedSalesLift'
    | 'freeShippingImpact'
    | 'profitDropPerUnit'
    | 'requiredSalesLift'
    | 'riskLevel'
  >,
): CampaignAlternative[] {
  const alternatives: CampaignAlternative[] = []

  if (result.campaignType === 'discount' || result.profitDropPerUnit > 60) {
    alternatives.push({
      type: 'reduce_discount',
      title: 'İndirim oranını düşür',
      explanation:
        'Kampanya sonrası birim net kâr belirgin düşüyorsa daha küçük indirimle kontrollü test yapılabilir.',
      estimatedEffect: 'Birim net kâr kaybını azaltabilir',
      priority: result.riskLevel === 'critical' ? 'high' : 'medium',
    })
  }

  if (result.campaignType === 'coupon') {
    alternatives.push({
      type: 'coupon_limit',
      title: 'Kuponu segmentle',
      explanation:
        'Kuponu tüm ürünlere yaymak yerine sepet tutarı veya müşteri segmentiyle sınırlandırmak değerlendirilebilir.',
      estimatedEffect: 'Kupon maliyetini daha kontrollü hale getirebilir',
      priority: 'high',
    })
  }

  if (result.freeShippingImpact > 0) {
    alternatives.push({
      type: 'cart_threshold',
      title: 'Kargo eşiği koy',
      explanation:
        'Ücretsiz kargo düşük fiyatlı ürünlerde marjı baskılıyorsa sepet alt limiti veya ürün grubu eşiği denenebilir.',
      estimatedEffect: 'Kargo etkisini sepet başına yayabilir',
      priority: 'high',
    })
  }

  if (
    result.requiredSalesLift === null ||
    result.requiredSalesLift > result.expectedSalesLift * 1.4
  ) {
    alternatives.push({
      type: 'bundle',
      title: 'Bundle oluştur',
      explanation:
        'Aynı toplam kârı korumak için gereken satış artışı yüksekse tek ürün indirimi yerine paket teklif test edilebilir.',
      estimatedEffect: 'Sepet değerini ve kampanya tamponunu artırabilir',
      priority: 'high',
    })
  }

  if (result.campaignUnitNetProfit <= 0 || result.riskLevel === 'critical') {
    alternatives.push({
      type: 'ad_cost',
      title: 'Reklam maliyetini azalt',
      explanation:
        'Kampanya genişletilmeden önce ürün bazlı reklam maliyeti ve hedefleme yeniden değerlendirilebilir.',
      estimatedEffect: 'Kampanya sonrası net marjı toparlamaya yardımcı olabilir',
      priority: 'high',
    })
  }

  if (alternatives.length === 0) {
    alternatives.push({
      type: 'small_test',
      title: 'Küçük test çalıştır',
      explanation:
        'Mevcut demo verisinde kampanya daha kontrollü görünüyor. Yine de kısa süreli ve sınırlı bütçeli test uygun olabilir.',
      estimatedEffect: 'Risk büyümeden gerçek talep sinyali verir',
      priority: 'low',
    })
  }

  return alternatives
}

export function generateCampaignSimulationRecommendation(result: CampaignSimulationResult): {
  action: RecommendedCampaignSimulationAction
  explanation: string
} {
  if (result.riskLevel === 'critical') {
    if (result.campaignUnitNetProfit <= 0) {
      return {
        action: 'avoid_campaign',
        explanation:
          'Mevcut verilere göre bu kampanya senaryosu birim net kârı sıfırın altına indiriyor. Bu çıktı kampanya performansı garantisi değildir; kampanya genişletilmeden önce manuel kontrol önerilir.',
      }
    }

    if (result.freeShippingImpact > 0) {
      return {
        action: 'review_free_shipping',
        explanation:
          'Ücretsiz kargo etkisi kampanya sonrası net marjı belirgin şekilde baskılıyor. Sepet eşiği veya daha dar ürün kapsamı değerlendirilebilir.',
      }
    }

    return {
      action: 'reduce_discount',
      explanation:
        'Mevcut verilere göre bu indirim net marjı belirgin şekilde düşürüyor. Daha düşük indirim veya bundle seçeneği kontrollü şekilde test edilebilir.',
    }
  }

  if (result.riskLevel === 'risky') {
    if (result.requiredSalesLift !== null && result.requiredSalesLift > result.expectedSalesLift) {
      return {
        action: 'run_small_test',
        explanation:
          'Aynı toplam kârı korumak için beklenen satış artışının üzerinde performans gerekir. Kampanya küçük kapsamlı testle izlenebilir.',
      }
    }

    return {
      action: 'use_bundle',
      explanation:
        'Kampanya sonrası kâr tamponu sınırlı görünüyor. Tek ürün indirimi yerine bundle veya sepet eşiği değerlendirilebilir.',
    }
  }

  if (result.riskLevel === 'watch') {
    return {
      action: 'run_small_test',
      explanation:
        'Mevcut verilere göre senaryo izlenebilir görünüyor; yine de kampanya süresi, ürün kapsamı ve satış artışı küçük testle takip edilmeli.',
    }
  }

  return {
    action: 'monitor',
    explanation:
      'Mevcut demo verisinde kampanya sonrası net kâr daha sağlıklı görünüyor. Bu çıktı kampanya performansı garantisi değildir; sonuçlar izlenerek ilerlenebilir.',
  }
}

export function calculateAllCampaignSimulations(
  products: Product[],
  scenarios: CampaignSimulationScenario[],
): CampaignSimulationResult[] {
  const productById = new Map(products.map((product) => [product.id, product]))

  return scenarios.flatMap((scenario) => {
    const product = productById.get(scenario.productId)

    if (!product) {
      return []
    }

    const currentUnitNetProfit = calculateCurrentUnitNetProfit(product)
    const currentNetMargin =
      product.salePrice > 0 ? currentUnitNetProfit / product.salePrice : 0
    const campaign = simulateDiscountCampaign(product, scenario)
    const profitDropPerUnit = roundCurrency(
      currentUnitNetProfit - campaign.campaignUnitNetProfit,
    )
    const totalProfitBeforeCampaign = roundCurrency(
      currentUnitNetProfit * scenario.currentUnitsSold,
    )
    const breakEvenUnits = calculateBreakEvenUnits(
      totalProfitBeforeCampaign,
      campaign.campaignUnitNetProfit,
    )
    const requiredSalesLift = calculateRequiredSalesLift(
      scenario.currentUnitsSold,
      breakEvenUnits,
    )
    const estimatedUnitsAfterCampaign = Math.ceil(
      scenario.currentUnitsSold * (1 + clamp(scenario.expectedSalesLift, 0, 5)),
    )
    const estimatedTotalProfitAfterCampaign = roundCurrency(
      estimatedUnitsAfterCampaign * campaign.campaignUnitNetProfit,
    )

    const baseResult: Omit<
      CampaignSimulationResult,
      'alternatives' | 'explanation' | 'recommendedAction' | 'riskLevel'
    > = {
      scenarioId: scenario.id,
      productId: product.id,
      productName: product.name,
      campaignName: scenario.name,
      campaignType: scenario.campaignType,
      currentPrice: product.salePrice,
      campaignPrice: campaign.campaignPrice,
      currentUnitNetProfit,
      campaignUnitNetProfit: campaign.campaignUnitNetProfit,
      currentNetMargin,
      campaignNetMargin: campaign.campaignNetMargin,
      profitDropPerUnit,
      breakEvenUnits,
      requiredSalesLift,
      expectedSalesLift: scenario.expectedSalesLift,
      freeShippingImpact: campaign.freeShippingImpact,
      totalProfitBeforeCampaign,
      estimatedTotalProfitAfterCampaign,
    }

    const riskLevel = detectCampaignRisk({
      ...baseResult,
      targetNetMargin: product.targetNetMargin,
    })
    const resultWithoutRecommendation: CampaignSimulationResult = {
      ...baseResult,
      riskLevel,
      alternatives: [],
      recommendedAction: 'monitor',
      explanation: '',
    }
    const alternatives = suggestCampaignAlternatives(resultWithoutRecommendation)
    const recommendation =
      generateCampaignSimulationRecommendation(resultWithoutRecommendation)

    return [
      {
        ...resultWithoutRecommendation,
        alternatives,
        recommendedAction: recommendation.action,
        explanation: recommendation.explanation,
      },
    ]
  })
}
