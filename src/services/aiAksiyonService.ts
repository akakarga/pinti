import type {
  CampaignProfitResult,
  CampaignSimulationResult,
  ModuleSummary,
  PriceProtectionResult,
  ProductProfitResult,
  ProductReturnResult,
  ReconciliationResult,
  ReturnRiskResult,
  UnifiedAction,
  UnifiedActionPriority,
  UnifiedHealthSummary,
} from '../types'

export interface AIModuleResults {
  productProfitResults: ProductProfitResult[]
  campaignProfitResults: CampaignProfitResult[]
  returnRiskResults: ReturnRiskResult[]
  productReturnResults: ProductReturnResult[]
  reconciliationResults: ReconciliationResult[]
  priceProtectionResults: PriceProtectionResult[]
  campaignSimulationResults: CampaignSimulationResult[]
}

export interface UnifiedAIInsight {
  overallSummary: string
  topActions: UnifiedAction[]
  moduleSummaries: ModuleSummary[]
  riskWarnings: string[]
  disclaimer: string
  actions: UnifiedAction[]
  healthSummary: UnifiedHealthSummary
}

const ROUTES = {
  profit: '/app/kar-pusula',
  ads: '/app/reklam-merkezi',
  returns: '/app/iade-kalkan',
  reconciliation: '/app/mutabakat',
  pricing: '/app/fiyat-koruma',
  campaign: '/app/kampanya-sim',
}

const MODULE_TITLES = {
  profit: 'KârPusula',
  ads: 'ReklamMerkezi',
  returns: 'İadeKalkan',
  reconciliation: 'Mutabakat',
  pricing: 'FiyatKoruma',
  campaign: 'KampanyaSim',
}

const DISCLAIMER =
  'Bu çıktı finansal, hukuki, muhasebesel, reklam veya fiyatlandırma tavsiyesi değildir; mevcut demo verisine göre karar desteği sunar.'

const priorityWeights: Record<UnifiedActionPriority, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
}

function clampScore(score: number) {
  return Math.min(100, Math.max(0, Math.round(score)))
}

function roundAmount(value: number) {
  return Math.max(0, Math.round(Number.isFinite(value) ? value : 0))
}

function average(values: number[], fallback = 75) {
  if (values.length === 0) {
    return fallback
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function scoreToPriority(score: number): UnifiedActionPriority {
  if (score < 45) {
    return 'critical'
  }

  if (score < 65) {
    return 'high'
  }

  if (score < 80) {
    return 'medium'
  }

  return 'low'
}

function createAction(action: Omit<UnifiedAction, 'disclaimer'>): UnifiedAction {
  return {
    ...action,
    estimatedImpactAmount: roundAmount(action.estimatedImpactAmount),
    disclaimer: DISCLAIMER,
  }
}

export function generateProfitActions(
  productProfitResults: ProductProfitResult[],
): UnifiedAction[] {
  return productProfitResults
    .filter((result) => {
      const adRatio = result.revenue > 0 ? result.adSpend / result.revenue : 0

      return (
        result.healthStatus !== 'healthy' ||
        result.netMargin < 0.08 ||
        result.returnRate > 0.12 ||
        adRatio > 0.18
      )
    })
    .map((result) => {
      const adRatio = result.revenue > 0 ? result.adSpend / result.revenue : 0
      const priority: UnifiedActionPriority =
        result.netProfit < 0 || result.healthStatus === 'loss'
          ? 'critical'
          : result.healthStatus === 'risky' || result.netMargin < 0.05
            ? 'high'
            : result.returnRate > 0.12 || adRatio > 0.18
              ? 'medium'
              : 'low'
      const impact =
        Math.max(0, -result.netProfit) +
        result.returnImpact +
        Math.max(0, result.adSpend - result.revenue * 0.15)

      return createAction({
        id: `profit-${result.productId}`,
        module: MODULE_TITLES.profit,
        category: 'profit',
        title:
          result.netProfit < 0
            ? `${result.productName} net kâr tarafında baskı oluşturuyor`
            : `${result.productName} için marj kontrolü öne çıkıyor`,
        summary:
          'Mevcut verilere göre ürün bazlı komisyon, kargo, reklam ve iade etkisi net kârı baskılıyor olabilir.',
        reason: result.explanation,
        priority,
        status: priority === 'low' ? 'monitor' : 'review',
        impactLabel: 'Kâr baskısı',
        estimatedImpactAmount: impact || result.revenue * 0.04,
        relatedEntityName: result.productName,
        relatedEntityId: result.productId,
        recommendedNextStep:
          'Ürün maliyeti, reklam harcaması ve iade etkisi birlikte manuel kontrol edilebilir.',
        route: ROUTES.profit,
      })
    })
}

export function generateAdActions(
  campaignProfitResults: CampaignProfitResult[],
): UnifiedAction[] {
  const campaignActions = campaignProfitResults
    .filter(
      (result) =>
        result.healthStatus !== 'healthy' ||
        result.wastedAdSpend ||
        (result.roas >= 2.5 && result.netMarginAfterAds < 0.08) ||
        result.profitBasedROAS < 0.3,
    )
    .map((result) => {
      const priority: UnifiedActionPriority =
        result.netProfitAfterAds < 0 || result.healthStatus === 'loss'
          ? 'critical'
          : result.wastedAdSpend || result.profitBasedROAS < 0.15
            ? 'high'
            : result.netMarginAfterAds < 0.08
              ? 'medium'
              : 'low'

      return createAction({
        id: `ads-${result.campaignId}`,
        module: MODULE_TITLES.ads,
        category: 'ads',
        title:
          result.roas >= 2.5 && result.netMarginAfterAds < 0.08
            ? `${result.campaignName} ROAS iyi görünse de net kâr zayıf`
            : `${result.campaignName} reklam sonrası kâr için izlenmeli`,
        summary:
          'Reklam harcaması, ürün maliyeti, kargo ve iade etkisi sonrası net kâr tarafında baskı görünüyor.',
        reason: result.explanation,
        priority,
        status: priority === 'low' ? 'monitor' : 'review',
        impactLabel: 'Reklam sonrası kâr etkisi',
        estimatedImpactAmount:
          Math.max(0, -result.netProfitAfterAds) ||
          result.adSpend ||
          result.returnImpact,
        relatedEntityName: result.campaignName,
        relatedEntityId: result.campaignId,
        recommendedNextStep:
          'Bütçe artırmadan önce kampanya kârı, kargo ve iade etkisi yeniden değerlendirilebilir.',
        route: ROUTES.ads,
      })
    })

  const source = campaignProfitResults
    .filter((result) => result.adSpend > 0 && result.healthStatus !== 'healthy')
    .toSorted(
      (first, second) =>
        first.netProfitAfterAds - second.netProfitAfterAds ||
        first.profitBasedROAS - second.profitBasedROAS,
    )[0]
  const target = campaignProfitResults
    .filter((result) => result.healthStatus === 'healthy' && result.netProfitAfterAds > 0)
    .toSorted(
      (first, second) =>
        second.netMarginAfterAds - first.netMarginAfterAds ||
        second.profitBasedROAS - first.profitBasedROAS,
    )[0]

  if (!source || !target || source.campaignId === target.campaignId) {
    return campaignActions
  }

  return [
    ...campaignActions,
    createAction({
      id: `ads-shift-${source.campaignId}-${target.campaignId}`,
      module: MODULE_TITLES.ads,
      category: 'ads',
      title: 'Küçük bütçe kaydırma testi değerlendirilebilir',
      summary: `${source.campaignName} kampanyasından ${target.campaignName} kampanyasına sınırlı bütçe testi öne çıkıyor.`,
      reason:
        'Mevcut verilere göre düşük net kârlı kampanyadan daha sağlıklı net marj üreten kampanyaya küçük bir bütçe kaydırma testi değerlendirilebilir.',
      priority: source.netProfitAfterAds < 0 ? 'high' : 'medium',
      status: 'review',
      impactLabel: 'Test bütçesi',
      estimatedImpactAmount: Math.min(source.adSpend * 0.25, target.adSpend * 0.5),
      relatedEntityName: source.campaignName,
      relatedEntityId: source.campaignId,
      recommendedNextStep:
        'Bütçe değişikliği genişletilmeden önce küçük kapsamlı test ve günlük net kâr takibi yapılabilir.',
      route: ROUTES.ads,
    }),
  ]
}

export function generateReturnActions(
  returnRiskResults: ReturnRiskResult[],
  productReturnResults: ProductReturnResult[],
): UnifiedAction[] {
  const returnRecordActions = returnRiskResults
    .filter((result) => result.manualReviewRecommended || result.riskLevel !== 'low')
    .map((result) => {
      const priority: UnifiedActionPriority =
        result.riskLevel === 'critical'
          ? 'critical'
          : result.riskLevel === 'high'
            ? 'high'
            : result.riskLevel === 'medium'
              ? 'medium'
              : 'low'

      return createAction({
        id: `return-${result.returnId}`,
        module: MODULE_TITLES.returns,
        category: 'returns',
        title: `${result.returnId} manuel kontrol için öne çıkıyor`,
        summary:
          'Mevcut verilere göre bu iade kaydında manuel inceleme gerektirebilecek risk sinyalleri bulunuyor.',
        reason: result.riskSignals.join(', ') || result.explanation,
        priority,
        status: result.manualReviewRecommended ? 'review' : 'monitor',
        impactLabel: 'İade kaybı',
        estimatedImpactAmount: result.refundAmount + result.returnShippingCost,
        relatedEntityName: result.productName,
        relatedEntityId: result.returnId,
        recommendedNextStep:
          'İade nedeni, müşteri mesajı, sipariş geçmişi ve ödeme itirazı sinyalleri birlikte kontrol edilebilir.',
        route: ROUTES.returns,
      })
    })

  const productActions = productReturnResults
    .filter((result) => result.riskLevel !== 'healthy' || result.returnRate > 0.1)
    .map((result) => {
      const priority: UnifiedActionPriority =
        result.riskLevel === 'critical'
          ? 'critical'
          : result.riskLevel === 'risky'
            ? 'high'
            : result.riskLevel === 'watch'
              ? 'medium'
              : 'low'

      return createAction({
        id: `return-product-${result.productId}`,
        module: MODULE_TITLES.returns,
        category: 'returns',
        title: `${result.productName} için iade oranı kontrol edilmeli`,
        summary:
          'Ürün bazlı iade oranı ve tahmini iade kaybı diğer ürünlere göre daha dikkatli izlenebilir.',
        reason: result.explanation,
        priority,
        status: priority === 'low' ? 'monitor' : 'review',
        impactLabel: 'Tahmini iade kaybı',
        estimatedImpactAmount: result.totalReturnLoss,
        relatedEntityName: result.productName,
        relatedEntityId: result.productId,
        recommendedNextStep:
          'Ürün açıklaması, görsel beklentisi, paketleme ve kalite kontrol akışı gözden geçirilebilir.',
        route: ROUTES.returns,
      })
    })

  return [...returnRecordActions, ...productActions]
}

export function generateReconciliationActions(
  reconciliationResults: ReconciliationResult[],
): UnifiedAction[] {
  return reconciliationResults
    .filter((result) => result.manualReviewRecommended || result.differenceType !== 'matched')
    .map((result) => {
      const priority: UnifiedActionPriority =
        result.riskLevel === 'critical'
          ? 'critical'
          : result.riskLevel === 'high'
            ? 'high'
            : result.riskLevel === 'medium'
              ? 'medium'
              : 'low'

      return createAction({
        id: `reconciliation-${result.settlementId}`,
        module: MODULE_TITLES.reconciliation,
        category: 'reconciliation',
        title: result.isDelayed
          ? `${result.settlementId} için ödeme eşleşmesi bulunamadı`
          : `${result.settlementId} hakedişinde fark kontrolü gerekiyor`,
        summary:
          'Hakediş ve banka hareketi arasında mevcut demo verisinde açıklama gerektiren fark görünüyor.',
        reason: result.explanation,
        priority,
        status: result.manualReviewRecommended ? 'review' : 'monitor',
        impactLabel: result.isDelayed ? 'Geciken ödeme' : 'Hakediş farkı',
        estimatedImpactAmount: result.absoluteDifference,
        relatedEntityName: result.settlementId,
        relatedEntityId: result.settlementId,
        recommendedNextStep:
          'Pazaryeri hakediş raporu ve banka ödeme kaydı birlikte manuel kontrol edilebilir.',
        route: ROUTES.reconciliation,
      })
    })
}

export function generatePricingActions(
  priceProtectionResults: PriceProtectionResult[],
): UnifiedAction[] {
  return priceProtectionResults
    .filter((result) => result.riskLevel !== 'safe' || result.priceGap > 0)
    .map((result) => {
      const priority: UnifiedActionPriority =
        result.riskLevel === 'critical'
          ? 'critical'
          : result.riskLevel === 'risky'
            ? 'high'
            : result.riskLevel === 'watch'
              ? 'medium'
              : 'low'

      return createAction({
        id: `pricing-${result.productId}`,
        module: MODULE_TITLES.pricing,
        category: 'pricing',
        title: `${result.productName} hedef marj altında görünüyor`,
        summary:
          'Mevcut fiyat; komisyon, kargo, reklam, iade ve hedef net marj etkisiyle yeniden kontrol edilebilir.',
        reason: result.explanation,
        priority,
        status: priority === 'low' ? 'monitor' : 'review',
        impactLabel: 'Fiyat farkı riski',
        estimatedImpactAmount: result.priceGap,
        relatedEntityName: result.productName,
        relatedEntityId: result.productId,
        recommendedNextStep:
          'Fiyat değişikliği düşünülmeden önce bundle, sepet eşiği, reklam maliyeti ve indirim oranı birlikte değerlendirilebilir.',
        route: ROUTES.pricing,
      })
    })
}

export function generateCampaignSimulationActions(
  campaignSimulationResults: CampaignSimulationResult[],
): UnifiedAction[] {
  return campaignSimulationResults
    .filter(
      (result) =>
        result.riskLevel !== 'safe' ||
        result.campaignUnitNetProfit <= 0 ||
        result.requiredSalesLift === null,
    )
    .map((result) => {
      const priority: UnifiedActionPriority =
        result.riskLevel === 'critical'
          ? 'critical'
          : result.riskLevel === 'risky'
            ? 'high'
            : result.riskLevel === 'watch'
              ? 'medium'
              : 'low'
      const liftGap =
        result.requiredSalesLift === null
          ? 1
          : Math.max(0, result.requiredSalesLift - result.expectedSalesLift)

      return createAction({
        id: `campaign-sim-${result.scenarioId}`,
        module: MODULE_TITLES.campaign,
        category: 'campaign',
        title: `${result.campaignName} kampanya kârını baskılayabilir`,
        summary:
          'Kampanya sonrası birim net kâr, gerekli satış artışı ve beklenen satış artışı birlikte kontrol edilmeli.',
        reason: result.explanation,
        priority,
        status: priority === 'low' ? 'monitor' : 'review',
        impactLabel: 'Kampanya kâr etkisi',
        estimatedImpactAmount:
          Math.max(0, result.totalProfitBeforeCampaign - result.estimatedTotalProfitAfterCampaign) ||
          liftGap * result.totalProfitBeforeCampaign,
        relatedEntityName: result.campaignName,
        relatedEntityId: result.scenarioId,
        recommendedNextStep:
          'Kampanya genişletilmeden önce indirim oranı, ücretsiz kargo ve bundle alternatifi küçük testle değerlendirilebilir.',
        route: ROUTES.campaign,
      })
    })
}

export function prioritizeUnifiedActions(actions: UnifiedAction[]): UnifiedAction[] {
  const priorities: UnifiedActionPriority[] = ['critical', 'high', 'medium', 'low']

  return priorities.flatMap((priority) => {
    const bucket = actions
      .filter((action) => action.priority === priority)
      .toSorted((first, second) => {
        const reviewDiff =
          Number(second.status === 'review') - Number(first.status === 'review')

        if (reviewDiff !== 0) {
          return reviewDiff
        }

        return second.estimatedImpactAmount - first.estimatedImpactAmount
      })
    const moduleCounts = new Map<string, number>()
    const preferred: UnifiedAction[] = []
    const overflow: UnifiedAction[] = []

    bucket.forEach((action) => {
      const count = moduleCounts.get(action.module) ?? 0
      moduleCounts.set(action.module, count + 1)

      if (count < 3) {
        preferred.push(action)
      } else {
        overflow.push(action)
      }
    })

    return [...preferred, ...overflow]
  })
}

export function generateUnifiedHealthSummary(
  actions: UnifiedAction[],
  moduleSummaries: ModuleSummary[],
): UnifiedHealthSummary {
  const totalCriticalActions = actions.filter((action) => action.priority === 'critical').length
  const totalHighActions = actions.filter((action) => action.priority === 'high').length
  const totalEstimatedImpact = actions.reduce(
    (sum, action) => sum + action.estimatedImpactAmount,
    0,
  )
  const moduleImpact = actions.reduce((map, action) => {
    map.set(
      action.module,
      (map.get(action.module) ?? 0) +
        action.estimatedImpactAmount +
        priorityWeights[action.priority] * 10_000,
    )
    return map
  }, new Map<string, number>())
  const topModule =
    [...moduleImpact.entries()].toSorted((first, second) => second[1] - first[1])[0]?.[0] ??
    moduleSummaries.toSorted((first, second) => first.score - second.score)[0]?.title ??
    'Genel'

  // Primary signal: weighted average of individual module scores.
  // Module scores are already bounded 0-100 and reflect per-area health.
  const moduleScores = moduleSummaries.map((summary) => summary.score)
  const moduleBaseScore = average(moduleScores, 65)

  // Secondary adjustments: small capped penalties based on action severity ratio.
  // Use proportional severity (ratio of critical+high to total) rather than raw counts,
  // so the penalty stays bounded regardless of dataset size.
  const totalActions = actions.length || 1
  const severityRatio = (totalCriticalActions + totalHighActions) / totalActions
  const severityPenalty = Math.min(12, Math.round(severityRatio * 18))

  // Small penalty if critical actions span many different modules (broad risk)
  const uniqueRiskyModules = new Set(
    actions
      .filter((action) => action.priority === 'critical' || action.priority === 'high')
      .map((action) => action.module),
  )
  const breadthPenalty = uniqueRiskyModules.size >= 4 ? 5 : uniqueRiskyModules.size >= 2 ? 3 : 0

  const overallScore = clampScore(moduleBaseScore - severityPenalty - breadthPenalty)
  const riskLevel: UnifiedActionPriority =
    overallScore <= 35
      ? 'critical'
      : overallScore <= 55
        ? 'high'
        : overallScore <= 75
          ? 'medium'
          : 'low'

  return {
    overallScore,
    riskLevel,
    totalCriticalActions,
    totalHighActions,
    totalEstimatedImpact: roundAmount(totalEstimatedImpact),
    topModule,
    summaryText:
      totalCriticalActions > 0
        ? `Mevcut demo verisinde ${topModule} öncelikli kontrol alanı olarak öne çıkıyor. Kritik aksiyonlar önce manuel incelenebilir.`
        : `Mevcut demo verisinde ${topModule} en dikkat çeken alan. Yüksek öncelikli kayıtlar düzenli takip edilebilir.`,
  }
}

export function generateModuleSummaries(allModuleResults: AIModuleResults): ModuleSummary[] {
  const actions = [
    ...generateProfitActions(allModuleResults.productProfitResults),
    ...generateAdActions(allModuleResults.campaignProfitResults),
    ...generateReturnActions(
      allModuleResults.returnRiskResults,
      allModuleResults.productReturnResults,
    ),
    ...generateReconciliationActions(allModuleResults.reconciliationResults),
    ...generatePricingActions(allModuleResults.priceProtectionResults),
    ...generateCampaignSimulationActions(allModuleResults.campaignSimulationResults),
  ]
  const actionCountByModule = actions.reduce((map, action) => {
    map.set(action.module, (map.get(action.module) ?? 0) + 1)
    return map
  }, new Map<string, number>())

  const worstProfit = allModuleResults.productProfitResults.toSorted(
    (first, second) => first.healthScore - second.healthScore,
  )[0]
  const worstAd = allModuleResults.campaignProfitResults.toSorted(
    (first, second) => first.healthScore - second.healthScore,
  )[0]
  const riskiestReturn = allModuleResults.returnRiskResults.toSorted(
    (first, second) => second.riskScore - first.riskScore,
  )[0]
  const riskiestReconciliation = allModuleResults.reconciliationResults.toSorted(
    (first, second) => second.absoluteDifference - first.absoluteDifference,
  )[0]
  const riskiestPrice = allModuleResults.priceProtectionResults.toSorted(
    (first, second) => second.priceGap - first.priceGap,
  )[0]
  const riskiestCampaign = allModuleResults.campaignSimulationResults.toSorted(
    (first, second) =>
      (second.requiredSalesLift ?? 9) - (first.requiredSalesLift ?? 9) ||
      second.profitDropPerUnit - first.profitDropPerUnit,
  )[0]

  const returnScore = clampScore(
    average(
      allModuleResults.productReturnResults.map((result) => result.healthScore),
      82,
    ) -
      allModuleResults.returnRiskResults.filter((result) => result.manualReviewRecommended)
        .length *
        3,
  )
  const reconciliationTotal = allModuleResults.reconciliationResults.length || 1
  const reconciliationCritical = allModuleResults.reconciliationResults.filter(
    (result) => result.riskLevel === 'critical',
  ).length
  const reconciliationHigh = allModuleResults.reconciliationResults.filter(
    (result) => result.riskLevel === 'high',
  ).length
  const reconciliationDelayed = allModuleResults.reconciliationResults.filter(
    (result) => result.isDelayed,
  ).length
  const reconciliationScore = clampScore(
    90 -
      Math.min(30, (reconciliationCritical / reconciliationTotal) * 45) -
      Math.min(18, (reconciliationHigh / reconciliationTotal) * 25) -
      Math.min(12, (reconciliationDelayed / reconciliationTotal) * 20),
  )
  const priceTotal = allModuleResults.priceProtectionResults.length || 1
  const priceCritical = allModuleResults.priceProtectionResults.filter(
    (result) => result.riskLevel === 'critical',
  ).length
  const priceRisky = allModuleResults.priceProtectionResults.filter(
    (result) => result.riskLevel === 'risky',
  ).length
  const priceWatch = allModuleResults.priceProtectionResults.filter(
    (result) => result.riskLevel === 'watch',
  ).length
  const priceScore = clampScore(
    90 -
      Math.min(30, (priceCritical / priceTotal) * 45) -
      Math.min(18, (priceRisky / priceTotal) * 25) -
      Math.min(10, (priceWatch / priceTotal) * 12),
  )
  const simTotal = allModuleResults.campaignSimulationResults.length || 1
  const simCritical = allModuleResults.campaignSimulationResults.filter(
    (result) => result.riskLevel === 'critical',
  ).length
  const simRisky = allModuleResults.campaignSimulationResults.filter(
    (result) => result.riskLevel === 'risky',
  ).length
  const simWatch = allModuleResults.campaignSimulationResults.filter(
    (result) => result.riskLevel === 'watch',
  ).length
  const simulationScore = clampScore(
    90 -
      Math.min(30, (simCritical / simTotal) * 45) -
      Math.min(18, (simRisky / simTotal) * 25) -
      Math.min(10, (simWatch / simTotal) * 12),
  )
  const profitScore = clampScore(
    average(
      allModuleResults.productProfitResults.map((result) => result.healthScore),
      82,
    ),
  )
  const adScore = clampScore(
    average(
      allModuleResults.campaignProfitResults.map((result) => result.healthScore),
      82,
    ),
  )

  const summaries: Omit<ModuleSummary, 'actionCount'>[] = [
    {
      module: 'profit',
      title: MODULE_TITLES.profit,
      score: profitScore,
      riskLevel: scoreToPriority(profitScore),
      mainFinding: worstProfit
        ? `${worstProfit.productName} net marj ve kâr etkisiyle öne çıkıyor.`
        : 'Ürün kârı için kritik sinyal bulunmuyor.',
      route: ROUTES.profit,
    },
    {
      module: 'ads',
      title: MODULE_TITLES.ads,
      score: adScore,
      riskLevel: scoreToPriority(adScore),
      mainFinding: worstAd
        ? `${worstAd.campaignName} reklam sonrası net kâr açısından izlenmeli.`
        : 'Kampanya kârlılığı için kritik sinyal bulunmuyor.',
      route: ROUTES.ads,
    },
    {
      module: 'returns',
      title: MODULE_TITLES.returns,
      score: returnScore,
      riskLevel: scoreToPriority(returnScore),
      mainFinding: riskiestReturn
        ? `${riskiestReturn.returnId} manuel kontrol için öne çıkıyor.`
        : 'İade kayıtları genel olarak izlenebilir görünüyor.',
      route: ROUTES.returns,
    },
    {
      module: 'reconciliation',
      title: MODULE_TITLES.reconciliation,
      score: reconciliationScore,
      riskLevel: scoreToPriority(reconciliationScore),
      mainFinding: riskiestReconciliation
        ? `${riskiestReconciliation.settlementId} için ${riskiestReconciliation.absoluteDifference.toLocaleString(
            'tr-TR',
          )} TL fark görünüyor.`
        : 'Hakediş ve banka hareketleri uyumlu görünüyor.',
      route: ROUTES.reconciliation,
    },
    {
      module: 'pricing',
      title: MODULE_TITLES.pricing,
      score: priceScore,
      riskLevel: scoreToPriority(priceScore),
      mainFinding: riskiestPrice
        ? `${riskiestPrice.productName} minimum sağlıklı fiyatın altında kalabilir.`
        : 'Fiyat seviyesi genel olarak sağlıklı görünüyor.',
      route: ROUTES.pricing,
    },
    {
      module: 'campaign',
      title: MODULE_TITLES.campaign,
      score: simulationScore,
      riskLevel: scoreToPriority(simulationScore),
      mainFinding: riskiestCampaign
        ? `${riskiestCampaign.campaignName} kampanya sonrası kârı baskılayabilir.`
        : 'Kampanya senaryoları genel olarak izlenebilir görünüyor.',
      route: ROUTES.campaign,
    },
  ]

  return summaries.map((summary) => ({
    ...summary,
    actionCount: actionCountByModule.get(summary.title) ?? 0,
  }))
}

export function generateUnifiedAIInsight(allModuleResults: AIModuleResults): UnifiedAIInsight {
  const actions = prioritizeUnifiedActions([
    ...generateProfitActions(allModuleResults.productProfitResults),
    ...generateAdActions(allModuleResults.campaignProfitResults),
    ...generateReturnActions(
      allModuleResults.returnRiskResults,
      allModuleResults.productReturnResults,
    ),
    ...generateReconciliationActions(allModuleResults.reconciliationResults),
    ...generatePricingActions(allModuleResults.priceProtectionResults),
    ...generateCampaignSimulationActions(allModuleResults.campaignSimulationResults),
  ])
  const moduleSummaries = generateModuleSummaries(allModuleResults)
  const healthSummary = generateUnifiedHealthSummary(actions, moduleSummaries)
  const topActions = actions.slice(0, 3)
  const riskWarnings = topActions.map(
    (action) => `${action.module}: ${action.title} (${action.impactLabel})`,
  )

  return {
    overallSummary: healthSummary.summaryText,
    topActions,
    moduleSummaries,
    riskWarnings,
    disclaimer: DISCLAIMER,
    actions,
    healthSummary,
  }
}
