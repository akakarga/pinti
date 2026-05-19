import type {
  Customer,
  ManualReviewReturn,
  Order,
  PaymentDispute,
  Product,
  ProductReturnResult,
  RecommendedReturnAction,
  ReturnHealthStatus,
  ReturnReasonInsight,
  ReturnRequest,
  ReturnRiskLevel,
  ReturnRiskResult,
} from '../types'

const clampScore = (score: number) => Math.min(100, Math.max(0, Math.round(score)))

const activeReturnStatuses = new Set<ReturnRequest['status']>(['requested', 'approved', 'review'])

function getDayDifference(startDate: string, endDate: string) {
  const start = new Date(`${startDate}T00:00:00`)
  const end = new Date(`${endDate}T00:00:00`)
  return Math.round((end.getTime() - start.getTime()) / 86_400_000)
}

function includesAny(value: string, keywords: string[]) {
  const normalized = value.toLocaleLowerCase('tr-TR')
  return keywords.some((keyword) => normalized.includes(keyword.toLocaleLowerCase('tr-TR')))
}

function getReasonAction(reason: string): RecommendedReturnAction {
  if (includesAny(reason, ['kargo', 'hasar', 'teslimat'])) {
    return 'check_delivery_process'
  }

  if (includesAny(reason, ['fermuar', 'kusurlu', 'eksik', 'kalite'])) {
    return 'review_quality_control'
  }

  if (includesAny(reason, ['beklenen', 'boyut', 'renk', 'görsel', 'olcu', 'ölçü'])) {
    return 'clarify_description'
  }

  return 'monitor'
}

export function calculateReturnLoss(returnRequest: ReturnRequest) {
  const estimatedRestockingLoss = returnRequest.refundAmount * (returnRequest.restockable ? 0.1 : 0.35)

  return {
    refundAmount: returnRequest.refundAmount,
    returnShippingCost: returnRequest.returnShippingCost,
    estimatedRestockingLoss,
    totalLoss:
      returnRequest.refundAmount + returnRequest.returnShippingCost + estimatedRestockingLoss,
  }
}

export function calculateReturnRate(productOrders: Order[], productReturns: ReturnRequest[]) {
  return productOrders.length > 0 ? productReturns.length / productOrders.length : 0
}

function calculateProductHealthScore(
  result: Omit<ProductReturnResult, 'riskLevel' | 'healthScore' | 'recommendedAction' | 'explanation'>,
  highRiskReturnCount: number,
) {
  let score = 80

  if (result.returnRate > 0.2) {
    score -= 30
  } else if (result.returnRate > 0.1) {
    score -= 15
  }

  if (result.totalReturnLoss > 2500) {
    score -= 15
  }

  if (highRiskReturnCount > 0) {
    score -= 15
  }

  const packagingReasonCount = result.mainReasons.filter((reason) =>
    includesAny(reason, ['kargo', 'hasar', 'paket']),
  ).length

  if (packagingReasonCount > 0) {
    score -= 10
  }

  return clampScore(score)
}

function getProductReturnHealthStatus(score: number): ReturnHealthStatus {
  if (score >= 75) {
    return 'healthy'
  }

  if (score >= 55) {
    return 'watch'
  }

  if (score >= 35) {
    return 'risky'
  }

  return 'critical'
}

export function generateReturnRecommendation(
  result: ProductReturnResult | ReturnRiskResult | ReturnReasonInsight,
): {
  action: RecommendedReturnAction
  explanation: string
} {
  if ('returnId' in result) {
    if (result.riskLevel === 'critical' || result.riskLevel === 'high') {
      return {
        action: 'manual_review',
        explanation:
          'Mevcut verilere göre bu iadede risk sinyali var. Bu çıktı kesin fraud tespiti değildir; manuel kontrol için karar desteğidir.',
      }
    }

    const action = getReasonAction(result.reason)
    return {
      action,
      explanation:
        'Bu kayıt mevcut demo verisinde izlenebilir görünüyor. İade nedeni ve müşteri mesajı birlikte değerlendirilebilir.',
    }
  }

  if ('productId' in result) {
    if (result.returnRate > 0.2) {
      return {
        action: 'review_product_page',
        explanation:
          'Bu ürünün iade oranı diğer ürünlere göre yüksek görünüyor. Ürün açıklaması, görseller ve beklenti yönetimi kontrol edilebilir.',
      }
    }

    if (result.mainReasons.some((reason) => includesAny(reason, ['kargo', 'hasar', 'paket']))) {
      return {
        action: 'improve_packaging',
        explanation:
          'İade nedenleri hasarlı teslimat veya paketleme sürecine işaret ediyor olabilir. Paketleme ve teslimat akışı gözden geçirilebilir.',
      }
    }

    if (result.mainReasons.some((reason) => includesAny(reason, ['kusurlu', 'fermuar', 'eksik']))) {
      return {
        action: 'review_quality_control',
        explanation:
          'İade nedenleri kalite kontrol sinyali taşıyor olabilir. Sevkiyat öncesi kontrol ve tedarikçi kalite süreci incelenebilir.',
      }
    }

    if (result.mainReasons.some((reason) => includesAny(reason, ['beklenen', 'renk', 'boyut']))) {
      return {
        action: 'clarify_description',
        explanation:
          'İade nedeni ürün açıklaması veya beklenti farkına işaret ediyor olabilir. Görsel, ölçü ve açıklama alanları netleştirilebilir.',
      }
    }
  }

  const action = 'reason' in result ? getReasonAction(result.reason) : 'monitor'

  return {
    action,
    explanation:
      'Bu iade sinyali düzenli takip edilebilir. Karar vermeden önce ürün, sipariş ve müşteri bağlamı birlikte incelenmeli.',
  }
}

export function calculateProductReturnAnalysis(
  product: Product,
  orders: Order[],
  returns: ReturnRequest[],
): ProductReturnResult {
  const productOrders = orders.filter(
    (order) => order.productId === product.id && order.status === 'completed',
  )
  const productReturns = returns.filter(
    (returnRequest) =>
      returnRequest.productId === product.id && activeReturnStatuses.has(returnRequest.status),
  )
  const losses = productReturns.map(calculateReturnLoss)
  const reasonCounts = new Map<string, number>()

  productReturns.forEach((returnRequest) => {
    reasonCounts.set(returnRequest.reason, (reasonCounts.get(returnRequest.reason) ?? 0) + 1)
  })

  const mainReasons = [...reasonCounts.entries()]
    .toSorted((first, second) => second[1] - first[1])
    .slice(0, 3)
    .map(([reason]) => reason)

  const baseResult = {
    productId: product.id,
    productName: product.name,
    category: product.category,
    totalOrders: productOrders.length,
    totalReturns: productReturns.length,
    returnRate: calculateReturnRate(productOrders, productReturns),
    refundAmount: losses.reduce((sum, loss) => sum + loss.refundAmount, 0),
    returnShippingCost: losses.reduce((sum, loss) => sum + loss.returnShippingCost, 0),
    estimatedRestockingLoss: losses.reduce(
      (sum, loss) => sum + loss.estimatedRestockingLoss,
      0,
    ),
    totalReturnLoss: losses.reduce((sum, loss) => sum + loss.totalLoss, 0),
    mainReasons,
  }

  const highRiskReturnCount = productReturns.filter(
    (returnRequest) => returnRequest.riskLevel === 'critical',
  ).length
  const healthScore = calculateProductHealthScore(baseResult, highRiskReturnCount)
  const riskLevel = getProductReturnHealthStatus(healthScore)
  const recommendation = generateReturnRecommendation({
    ...baseResult,
    riskLevel,
    healthScore,
    recommendedAction: 'monitor',
    explanation: '',
  })

  return {
    ...baseResult,
    riskLevel,
    healthScore,
    recommendedAction: recommendation.action,
    explanation: recommendation.explanation,
  }
}

export function calculateAllProductReturnAnalysis(
  products: Product[],
  orders: Order[],
  returns: ReturnRequest[],
) {
  return products.map((product) => calculateProductReturnAnalysis(product, orders, returns))
}

export function detectReturnRiskSignals(
  returnRequest: ReturnRequest,
  orders: Order[],
  customers: Customer[],
  disputes: PaymentDispute[],
) {
  const signals: string[] = []
  const customer = customers.find((item) => item.id === returnRequest.customerId)
  const order = orders.find((item) => item.id === returnRequest.orderId)
  const customerHasDispute = disputes.some(
    (dispute) => dispute.customerId === returnRequest.customerId,
  )
  const orderHasDispute = disputes.some((dispute) => dispute.orderId === returnRequest.orderId)
  const productOrders = orders.filter(
    (item) => item.productId === returnRequest.productId && item.status === 'completed',
  )
  const productReturnedOrders = productOrders.filter((item) => item.hasReturn)
  const productReturnRate =
    productOrders.length > 0 ? productReturnedOrders.length / productOrders.length : 0

  if ((customer?.totalReturns ?? 0) >= 3) {
    signals.push('Aynı müşteride 3+ iade')
  }

  if ((customer?.previousDisputes ?? 0) > 0) {
    signals.push('Geçmiş ödeme itirazı')
  }

  if (returnRequest.refundAmount > 750) {
    signals.push('Yüksek refund tutarı')
  }

  if (order && getDayDifference(order.orderDate, returnRequest.requestDate) <= 1) {
    signals.push('Çok kısa sürede iade talebi')
  }

  if (!returnRequest.restockable) {
    signals.push('Yeniden satılamama riski')
  }

  if (
    includesAny(returnRequest.customerMessage, ['emin değilim', 'belli değil', 'sanırım']) ||
    (includesAny(returnRequest.reason, ['fikir']) &&
      includesAny(returnRequest.customerMessage, ['hasar', 'kusur', 'eksik']))
  ) {
    signals.push('Açıklama ve mesaj belirsiz/çelişkili')
  }

  if (productReturnRate > 0.2) {
    signals.push('Ürün iade oranı yüksek')
  }

  if (customerHasDispute || orderHasDispute) {
    signals.push('Ödeme anlaşmazlığı kaydı')
  }

  return signals
}

export function calculateReturnRiskScore(returnRequest: ReturnRequest, riskSignals: string[]) {
  let score = 20

  if (riskSignals.includes('Aynı müşteride 3+ iade')) {
    score += 20
  }

  if (riskSignals.includes('Geçmiş ödeme itirazı')) {
    score += 25
  }

  if (riskSignals.includes('Yüksek refund tutarı')) {
    score += 15
  }

  if (riskSignals.includes('Çok kısa sürede iade talebi')) {
    score += 10
  }

  if (!returnRequest.restockable || riskSignals.includes('Yeniden satılamama riski')) {
    score += 15
  }

  if (riskSignals.includes('Açıklama ve mesaj belirsiz/çelişkili')) {
    score += 10
  }

  if (riskSignals.includes('Ürün iade oranı yüksek')) {
    score += 15
  }

  if (riskSignals.includes('Ödeme anlaşmazlığı kaydı')) {
    score += 25
  }

  return clampScore(score)
}

export function getReturnRiskLevel(score: number): ReturnRiskLevel {
  if (score <= 30) {
    return 'low'
  }

  if (score <= 60) {
    return 'medium'
  }

  if (score <= 80) {
    return 'high'
  }

  return 'critical'
}

export function calculateReturnRiskResults(
  returns: ReturnRequest[],
  products: Product[],
  orders: Order[],
  customers: Customer[],
  disputes: PaymentDispute[],
): ReturnRiskResult[] {
  const productById = new Map(products.map((product) => [product.id, product]))
  const customerById = new Map(customers.map((customer) => [customer.id, customer]))

  return returns
    .filter((returnRequest) => activeReturnStatuses.has(returnRequest.status))
    .map((returnRequest) => {
      const product = productById.get(returnRequest.productId)
      const customer = customerById.get(returnRequest.customerId)
      const riskSignals = detectReturnRiskSignals(returnRequest, orders, customers, disputes)
      const riskScore = calculateReturnRiskScore(returnRequest, riskSignals)
      const riskLevel = getReturnRiskLevel(riskScore)
      const manualReviewRecommended = riskLevel === 'high' || riskLevel === 'critical'
      const recommendation = generateReturnRecommendation({
        returnId: returnRequest.id,
        orderId: returnRequest.orderId,
        productId: returnRequest.productId,
        productName: product?.name ?? 'Bilinmeyen ürün',
        customerId: returnRequest.customerId,
        customerName: customer?.name ?? returnRequest.customerId,
        refundAmount: returnRequest.refundAmount,
        returnShippingCost: returnRequest.returnShippingCost,
        reason: returnRequest.reason,
        customerMessage: returnRequest.customerMessage,
        riskScore,
        riskLevel,
        riskSignals,
        manualReviewRecommended,
        suggestedAction: 'monitor',
        explanation: '',
      })

      return {
        returnId: returnRequest.id,
        orderId: returnRequest.orderId,
        productId: returnRequest.productId,
        productName: product?.name ?? 'Bilinmeyen ürün',
        customerId: returnRequest.customerId,
        customerName: customer?.name ?? returnRequest.customerId,
        refundAmount: returnRequest.refundAmount,
        returnShippingCost: returnRequest.returnShippingCost,
        reason: returnRequest.reason,
        customerMessage: returnRequest.customerMessage,
        riskScore,
        riskLevel,
        riskSignals,
        manualReviewRecommended,
        suggestedAction: recommendation.action,
        explanation: recommendation.explanation,
      }
    })
}

export function analyzeReturnReasons(returns: ReturnRequest[]): ReturnReasonInsight[] {
  const grouped = new Map<string, ReturnRequest[]>()

  returns
    .filter((returnRequest) => activeReturnStatuses.has(returnRequest.status))
    .forEach((returnRequest) => {
      grouped.set(returnRequest.reason, [...(grouped.get(returnRequest.reason) ?? []), returnRequest])
    })

  return [...grouped.entries()]
    .map(([reason, reasonReturns]) => {
      const estimatedLoss = reasonReturns.reduce(
        (sum, returnRequest) => sum + calculateReturnLoss(returnRequest).totalLoss,
        0,
      )
      const recommendation = generateReturnRecommendation({
        reason,
        count: reasonReturns.length,
        estimatedLoss,
        explanation: '',
        suggestedAction: getReasonAction(reason),
      })

      return {
        reason,
        count: reasonReturns.length,
        estimatedLoss,
        explanation: recommendation.explanation,
        suggestedAction: recommendation.action,
      }
    })
    .toSorted(
      (first, second) =>
        second.count - first.count || second.estimatedLoss - first.estimatedLoss,
    )
}

export function getManualReviewReturns(
  returnRiskResults: ReturnRiskResult[],
): ManualReviewReturn[] {
  return returnRiskResults
    .filter((result) => result.manualReviewRecommended)
    .map((result) => ({
      returnId: result.returnId,
      orderId: result.orderId,
      customerName: result.customerName,
      productName: result.productName,
      riskScore: result.riskScore,
      riskLevel: result.riskLevel,
      reason: result.reason,
      suggestedAction: result.suggestedAction,
    }))
}
