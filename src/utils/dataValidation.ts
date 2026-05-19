import type {
  DatasetValidationCounts,
  DatasetValidationResult,
  PintiDataset,
} from '../types'

const emptyCounts: DatasetValidationCounts = {
  products: 0,
  orders: 0,
  returns: 0,
  customers: 0,
  paymentDisputes: 0,
  campaigns: 0,
  campaignPerformance: 0,
  settlements: 0,
  bankTransactions: 0,
  campaignSimulationScenarios: 0,
}

function hasValue(value: unknown) {
  return value !== undefined && value !== null && value !== ''
}

function countMissingRequiredFields<T extends Record<string, unknown>>(
  rows: T[],
  fields: string[],
) {
  return rows.reduce((count, row) => {
    const hasMissing = fields.some((field) => !hasValue(row[field]))
    return hasMissing ? count + 1 : count
  }, 0)
}

export function getDatasetCounts(dataset?: Partial<PintiDataset> | null): DatasetValidationCounts {
  if (!dataset) {
    return emptyCounts
  }

  return {
    products: dataset.products?.length ?? 0,
    orders: dataset.orders?.length ?? 0,
    returns: dataset.returns?.length ?? 0,
    customers: dataset.customers?.length ?? 0,
    paymentDisputes: dataset.paymentDisputes?.length ?? 0,
    campaigns: dataset.campaigns?.length ?? 0,
    campaignPerformance: dataset.campaignPerformance?.length ?? 0,
    settlements: dataset.settlements?.length ?? 0,
    bankTransactions: dataset.bankTransactions?.length ?? 0,
    campaignSimulationScenarios: dataset.campaignSimulationScenarios?.length ?? 0,
  }
}

export function validateDataset(dataset?: Partial<PintiDataset> | null): DatasetValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const counts = getDatasetCounts(dataset)

  if (!dataset?.companyProfile?.name) {
    warnings.push('Şirket profili eksik veya şirket adı tanımlı değil.')
  }

  if (!dataset?.products?.length) {
    errors.push('En az bir ürün kaydı gerekli.')
  }

  if (!dataset?.orders?.length) {
    errors.push('En az bir sipariş kaydı gerekli.')
  }

  if (!dataset?.campaigns?.length) {
    warnings.push('Kampanya kaydı yok; ReklamMerkezi sınırlı çıktı üretebilir.')
  }

  if (!dataset?.settlements?.length) {
    warnings.push('Hakediş kaydı yok; Mutabakat modülü sınırlı çıktı üretebilir.')
  }

  if (!dataset?.bankTransactions?.length) {
    warnings.push('Banka hareketi yok; Mutabakat eşleşmesi sınırlı olabilir.')
  }

  const products = dataset?.products ?? []
  const orders = dataset?.orders ?? []
  const returns = dataset?.returns ?? []
  const settlements = dataset?.settlements ?? []
  const bankTransactions = dataset?.bankTransactions ?? []
  const campaigns = dataset?.campaigns ?? []
  const scenarios = dataset?.campaignSimulationScenarios ?? []

  const productIds = new Set(products.map((product) => product.id))
  const orderIds = new Set(orders.map((order) => order.id))
  const settlementIds = new Set(settlements.map((settlement) => settlement.id))
  const campaignIds = new Set(campaigns.map((campaign) => campaign.id))

  const missingProductFields = countMissingRequiredFields(
    products as unknown as Record<string, unknown>[],
    ['id', 'name', 'salePrice', 'unitCost', 'commissionRate', 'averageShippingCost'],
  )
  if (missingProductFields > 0) {
    errors.push(`${missingProductFields} ürün kaydında zorunlu alan eksik.`)
  }

  const missingOrderFields = countMissingRequiredFields(
    orders as unknown as Record<string, unknown>[],
    ['id', 'productId', 'quantity', 'unitPrice', 'orderDate'],
  )
  if (missingOrderFields > 0) {
    errors.push(`${missingOrderFields} sipariş kaydında zorunlu alan eksik.`)
  }

  const ordersWithUnknownProduct = orders.filter((order) => !productIds.has(order.productId))
  if (ordersWithUnknownProduct.length > 0) {
    errors.push(
      `${ordersWithUnknownProduct.length} sipariş kaydı ürün listesinde olmayan productId içeriyor.`,
    )
  }

  const returnsWithUnknownOrder = returns.filter((returnRequest) => !orderIds.has(returnRequest.orderId))
  if (returnsWithUnknownOrder.length > 0) {
    warnings.push(
      `${returnsWithUnknownOrder.length} iade kaydı sipariş listesinde olmayan orderId içeriyor.`,
    )
  }

  const returnsWithUnknownProduct = returns.filter(
    (returnRequest) => !productIds.has(returnRequest.productId),
  )
  if (returnsWithUnknownProduct.length > 0) {
    warnings.push(
      `${returnsWithUnknownProduct.length} iade kaydı ürün listesinde olmayan productId içeriyor.`,
    )
  }

  const settlementsWithUnknownOrder = settlements.filter(
    (settlement) => !orderIds.has(settlement.orderId),
  )
  if (settlementsWithUnknownOrder.length > 0) {
    warnings.push(
      `${settlementsWithUnknownOrder.length} hakediş kaydı sipariş listesinde olmayan orderId içeriyor.`,
    )
  }

  const bankTransactionsWithUnknownSettlement = bankTransactions.filter(
    (transaction) =>
      transaction.relatedSettlementId && !settlementIds.has(transaction.relatedSettlementId),
  )
  if (bankTransactionsWithUnknownSettlement.length > 0) {
    warnings.push(
      `${bankTransactionsWithUnknownSettlement.length} banka hareketi hakediş listesinde olmayan relatedSettlementId içeriyor.`,
    )
  }

  const campaignsWithoutProduct = campaigns.filter(
    (campaign) =>
      campaign.productId && !productIds.has(campaign.productId) &&
      !campaign.productIds?.some((productId) => productIds.has(productId)),
  )
  if (campaignsWithoutProduct.length > 0) {
    warnings.push(`${campaignsWithoutProduct.length} kampanya ürün eşleşmesi kontrol edilmeli.`)
  }

  const scenariosWithoutProduct = scenarios.filter((scenario) => !productIds.has(scenario.productId))
  if (scenariosWithoutProduct.length > 0) {
    warnings.push(
      `${scenariosWithoutProduct.length} kampanya simülasyonu ürün listesinde olmayan productId içeriyor.`,
    )
  }

  const performancesWithUnknownCampaign = (dataset?.campaignPerformance ?? []).filter(
    (performance) => !campaignIds.has(performance.campaignId),
  )
  if (performancesWithUnknownCampaign.length > 0) {
    warnings.push(
      `${performancesWithUnknownCampaign.length} reklam performansı kampanya listesinde olmayan campaignId içeriyor.`,
    )
  }

  return {
    isValid: errors.length === 0,
    warnings,
    errors,
    counts,
  }
}
