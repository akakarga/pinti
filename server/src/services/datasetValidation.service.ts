import { validateDataset as validateFrontendDataset } from '../../../src/utils/dataValidation.ts'
import type {
  DatasetValidationCounts,
  DatasetValidationResult,
  PintiDataset,
} from '../types/dataset.types.ts'
import { pintiDatasetSchema } from '../schemas/dataset.schema.ts'

type Row = Record<string, unknown>

const requiredArrayFields = [
  'products',
  'orders',
  'returns',
  'customers',
  'paymentDisputes',
  'campaigns',
  'campaignPerformance',
  'settlements',
  'bankTransactions',
  'campaignSimulationScenarios',
] as const

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

const requiredRowFields: Partial<Record<(typeof requiredArrayFields)[number], string[]>> = {
  products: ['id', 'name', 'salePrice', 'unitCost', 'commissionRate', 'averageShippingCost'],
  orders: ['id', 'productId', 'quantity', 'unitPrice', 'orderDate'],
  returns: ['id', 'orderId', 'productId', 'refundAmount', 'returnShippingCost', 'status'],
  customers: ['id', 'name'],
  paymentDisputes: ['id', 'orderId', 'customerId', 'amount'],
  campaigns: ['id', 'name', 'totalSpend', 'attributedRevenue'],
  campaignPerformance: ['id', 'campaignId', 'adSpend', 'attributedRevenue'],
  settlements: [
    'id',
    'grossAmount',
    'commissionFee',
    'shippingFee',
    'returnDeduction',
    'campaignDeduction',
    'serviceFee',
  ],
  bankTransactions: ['id', 'amount'],
  campaignSimulationScenarios: [
    'id',
    'productId',
    'name',
    'discountRate',
    'couponAmount',
    'freeShipping',
    'expectedSalesLift',
    'currentUnitsSold',
  ],
}

function hasValue(value: unknown) {
  return value !== undefined && value !== null && value !== ''
}

function isObjectRecord(value: unknown): value is Row {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function getArrayRows(input: unknown, field: (typeof requiredArrayFields)[number]): Row[] {
  if (!isObjectRecord(input)) {
    return []
  }

  const value = input[field]
  return Array.isArray(value) ? value.filter(isObjectRecord) : []
}

function getCounts(input: unknown): DatasetValidationCounts {
  if (!isObjectRecord(input)) {
    return emptyCounts
  }

  return {
    products: Array.isArray(input.products) ? input.products.length : 0,
    orders: Array.isArray(input.orders) ? input.orders.length : 0,
    returns: Array.isArray(input.returns) ? input.returns.length : 0,
    customers: Array.isArray(input.customers) ? input.customers.length : 0,
    paymentDisputes: Array.isArray(input.paymentDisputes) ? input.paymentDisputes.length : 0,
    campaigns: Array.isArray(input.campaigns) ? input.campaigns.length : 0,
    campaignPerformance: Array.isArray(input.campaignPerformance)
      ? input.campaignPerformance.length
      : 0,
    settlements: Array.isArray(input.settlements) ? input.settlements.length : 0,
    bankTransactions: Array.isArray(input.bankTransactions) ? input.bankTransactions.length : 0,
    campaignSimulationScenarios: Array.isArray(input.campaignSimulationScenarios)
      ? input.campaignSimulationScenarios.length
      : 0,
  }
}

function countMissingRequiredFields(rows: Row[], fields: string[]) {
  return rows.reduce((count, row) => {
    const hasMissing = fields.some((field) => !hasValue(row[field]))
    return hasMissing ? count + 1 : count
  }, 0)
}

function toIdSet(rows: Row[]) {
  return new Set(
    rows
      .map((row) => row.id)
      .filter((value): value is string => typeof value === 'string' && value.length > 0),
  )
}

function pushUnique(target: string[], messages: string[]) {
  const existing = new Set(target)
  messages.forEach((message) => {
    if (!existing.has(message)) {
      target.push(message)
      existing.add(message)
    }
  })
}

function numberOr(value: unknown, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function stringOr(value: unknown, fallback: string) {
  return typeof value === 'string' && value.length > 0 ? value : fallback
}

function normalizeUploadDataset(input: Row): Row {
  const rawProducts = getArrayRows(input, 'products')
  const rawOrders = getArrayRows(input, 'orders')
  const rawReturns = getArrayRows(input, 'returns')
  const rawCustomers = getArrayRows(input, 'customers')
  const rawDisputes = getArrayRows(input, 'paymentDisputes')
  const rawCampaigns = getArrayRows(input, 'campaigns')
  const rawCampaignPerformance = getArrayRows(input, 'campaignPerformance')
  const rawSettlements = getArrayRows(input, 'settlements')
  const rawBankTransactions = getArrayRows(input, 'bankTransactions')
  const rawScenarios = getArrayRows(input, 'campaignSimulationScenarios')
  const returnOrderIds = new Set(
    rawReturns
      .map((returnRequest) => returnRequest.orderId)
      .filter((orderId): orderId is string => typeof orderId === 'string'),
  )
  const companyProfile = isObjectRecord(input.companyProfile) ? input.companyProfile : {}
  const fallbackDatasetId = stringOr(companyProfile.id, `uploaded-${Date.now()}`)

  return {
    ...input,
    id: stringOr(input.id, fallbackDatasetId),
    companyProfile: {
      id: fallbackDatasetId,
      name: stringOr(companyProfile.name, 'Yüklenen Veri Seti'),
      sector: stringOr(companyProfile.sector, 'Yüklenen veri'),
      marketplace: stringOr(companyProfile.marketplace, 'Local API upload'),
      monthlyOrderVolume: numberOr(companyProfile.monthlyOrderVolume, rawOrders.length),
      riskProfile: stringOr(companyProfile.riskProfile, 'Yüklenen veri doğrulanıyor.'),
      description: stringOr(
        companyProfile.description,
        'Bu veri seti local API upload akışıyla yüklenmiştir.',
      ),
      strongestModules: Array.isArray(companyProfile.strongestModules)
        ? companyProfile.strongestModules
        : ['KârPusula', 'ReklamMerkezi', 'AI Aksiyon Merkezi'],
    },
    products: rawProducts.map((product) => {
      const salePrice = numberOr(product.salePrice, numberOr(product.currentPrice, 0))

      return {
        ...product,
        id: stringOr(product.id, `product-${Date.now()}`),
        name: stringOr(product.name, stringOr(product.id, 'Ürün')),
        sku: stringOr(product.sku, stringOr(product.id, 'SKU')),
        category: stringOr(product.category, 'Genel'),
        salePrice,
        unitCost: numberOr(product.unitCost, 0),
        stock: numberOr(product.stock, 0),
        commissionRate: numberOr(product.commissionRate, 0),
        averageShippingCost: numberOr(product.averageShippingCost, 0),
        targetNetMargin: numberOr(product.targetNetMargin, 0.18),
        expectedAdCostPerUnit: numberOr(product.expectedAdCostPerUnit, 0),
        expectedReturnCostPerUnit: numberOr(product.expectedReturnCostPerUnit, 0),
        competitorPriceMin: numberOr(product.competitorPriceMin, salePrice),
        competitorPriceMax: numberOr(product.competitorPriceMax, salePrice),
        currentDiscountRate: numberOr(product.currentDiscountRate, 0),
        salesRevenue: numberOr(product.salesRevenue, 0),
        grossProfit: numberOr(product.grossProfit, 0),
        netProfit: numberOr(product.netProfit, 0),
        adSpend: numberOr(product.adSpend, 0),
        returnRate: numberOr(product.returnRate, 0),
        currentPrice: numberOr(product.currentPrice, salePrice),
        minHealthyPrice: numberOr(product.minHealthyPrice, 0),
        riskLevel: stringOr(product.riskLevel, 'neutral'),
      }
    }),
    orders: rawOrders.map((order) => ({
      ...order,
      campaignId: stringOr(order.campaignId, ''),
      status: stringOr(order.status, 'completed'),
      hasReturn:
        typeof order.hasReturn === 'boolean'
          ? order.hasReturn
          : typeof order.id === 'string' && returnOrderIds.has(order.id),
    })),
    returns: rawReturns.map((returnRequest) => ({
      ...returnRequest,
      requestDate: stringOr(returnRequest.requestDate, stringOr(returnRequest.returnDate, '')),
      riskLevel: stringOr(returnRequest.riskLevel, 'neutral'),
      status: stringOr(returnRequest.status, 'requested'),
      customerMessage: stringOr(returnRequest.customerMessage, stringOr(returnRequest.reason, '')),
      restockable:
        typeof returnRequest.restockable === 'boolean' ? returnRequest.restockable : true,
    })),
    customers: rawCustomers.map((customer) => ({
      ...customer,
      totalOrders: numberOr(customer.totalOrders, 0),
      totalReturns: numberOr(customer.totalReturns, 0),
      previousDisputes: numberOr(customer.previousDisputes, 0),
    })),
    paymentDisputes: rawDisputes.map((dispute) => ({
      ...dispute,
      status: stringOr(dispute.status, 'open'),
      createdAt: stringOr(dispute.createdAt, ''),
    })),
    campaigns: rawCampaigns.map((campaign) => {
      const totalSpend = numberOr(campaign.totalSpend, numberOr(campaign.spend, 0))
      const attributedRevenue = numberOr(
        campaign.attributedRevenue,
        numberOr(campaign.revenue, 0),
      )

      return {
        ...campaign,
        channel: stringOr(campaign.channel, stringOr(campaign.platform, 'Pazaryeri reklam')),
        objective: stringOr(campaign.objective, 'sales'),
        totalSpend,
        attributedRevenue,
        spend: numberOr(campaign.spend, totalSpend),
        revenue: numberOr(campaign.revenue, attributedRevenue),
        roas: numberOr(
          campaign.roas,
          totalSpend > 0 ? attributedRevenue / totalSpend : 0,
        ),
        netProfitAfterAds: numberOr(campaign.netProfitAfterAds, 0),
        status: stringOr(campaign.status, 'neutral'),
      }
    }),
    campaignPerformance: rawCampaignPerformance.map((performance) => ({
      ...performance,
      adSpend: numberOr(performance.adSpend, numberOr(performance.spend, 0)),
      attributedOrders: numberOr(performance.attributedOrders, numberOr(performance.orders, 0)),
      attributedRevenue: numberOr(performance.attributedRevenue, numberOr(performance.revenue, 0)),
    })),
    settlements: rawSettlements.map((settlement) => {
      const settlementDate = stringOr(
        settlement.settlementDate,
        stringOr(settlement.payoutDate, stringOr(settlement.periodEnd, '')),
      )
      const expectedNetAmount = numberOr(
        settlement.expectedNetAmount,
        numberOr(settlement.expectedAmount, 0),
      )
      const paidAmount = numberOr(settlement.paidAmount, expectedNetAmount)

      return {
        ...settlement,
        settlementDate,
        period: stringOr(settlement.period, stringOr(settlement.periodEnd, settlementDate)),
        expectedAmount: numberOr(settlement.expectedAmount, expectedNetAmount),
        paidAmount,
        difference: numberOr(settlement.difference, paidAmount - expectedNetAmount),
        status: stringOr(settlement.status, 'neutral'),
      }
    }),
    bankTransactions: rawBankTransactions.map((transaction) => ({
      ...transaction,
      transactionDate: stringOr(transaction.transactionDate, stringOr(transaction.date, '')),
      bank: stringOr(transaction.bank, 'Local demo bankası'),
      date: stringOr(transaction.date, stringOr(transaction.transactionDate, '')),
      matched: typeof transaction.matched === 'boolean' ? transaction.matched : false,
      status: stringOr(transaction.status, 'pending'),
    })),
    campaignSimulationScenarios: rawScenarios,
  }
}

export function validatePintiDatasetPayload(input: unknown): {
  dataset: PintiDataset | null
  validation: DatasetValidationResult
} {
  const errors: string[] = []
  const warnings: string[] = []
  const counts = getCounts(input)

  if (!isObjectRecord(input)) {
    errors.push('Dataset JSON bir obje olmalı.')

    return {
      dataset: null,
      validation: {
        isValid: false,
        errors,
        warnings,
        counts,
      },
    }
  }

  const normalizedInput = normalizeUploadDataset(input)

  if (!isObjectRecord(normalizedInput.companyProfile)) {
    errors.push('companyProfile alanı zorunlu ve obje olmalı.')
  }

  requiredArrayFields.forEach((field) => {
    if (!Array.isArray(normalizedInput[field])) {
      errors.push(`${field} alanı zorunlu ve dizi olmalı.`)
    }
  })

  requiredArrayFields.forEach((field) => {
    const missingCount = countMissingRequiredFields(
      getArrayRows(normalizedInput, field),
      requiredRowFields[field] ?? [],
    )

    if (missingCount > 0) {
      errors.push(`${field} içinde ${missingCount} kayıtta zorunlu alan eksik.`)
    }
  })

  const products = getArrayRows(normalizedInput, 'products')
  const orders = getArrayRows(normalizedInput, 'orders')
  const returns = getArrayRows(normalizedInput, 'returns')
  const settlements = getArrayRows(normalizedInput, 'settlements')
  const bankTransactions = getArrayRows(normalizedInput, 'bankTransactions')
  const productIds = toIdSet(products)
  const orderIds = toIdSet(orders)
  const settlementIds = toIdSet(settlements)

  const ordersWithUnknownProduct = orders.filter(
    (order) => typeof order.productId === 'string' && !productIds.has(order.productId),
  )
  if (ordersWithUnknownProduct.length > 0) {
    errors.push(
      `${ordersWithUnknownProduct.length} sipariş kaydı ürün listesinde olmayan productId içeriyor.`,
    )
  }

  const returnsWithUnknownOrder = returns.filter(
    (returnRequest) =>
      typeof returnRequest.orderId === 'string' && !orderIds.has(returnRequest.orderId),
  )
  if (returnsWithUnknownOrder.length > 0) {
    errors.push(
      `${returnsWithUnknownOrder.length} iade kaydı sipariş listesinde olmayan orderId içeriyor.`,
    )
  }

  const returnsWithUnknownProduct = returns.filter(
    (returnRequest) =>
      typeof returnRequest.productId === 'string' && !productIds.has(returnRequest.productId),
  )
  if (returnsWithUnknownProduct.length > 0) {
    errors.push(
      `${returnsWithUnknownProduct.length} iade kaydı ürün listesinde olmayan productId içeriyor.`,
    )
  }

  const settlementsWithUnknownOrder = settlements.filter(
    (settlement) => typeof settlement.orderId === 'string' && !orderIds.has(settlement.orderId),
  )
  if (settlementsWithUnknownOrder.length > 0) {
    errors.push(
      `${settlementsWithUnknownOrder.length} hakediş kaydı sipariş listesinde olmayan orderId içeriyor.`,
    )
  }

  const bankTransactionsWithUnknownSettlement = bankTransactions.filter(
    (transaction) =>
      typeof transaction.relatedSettlementId === 'string' &&
      transaction.relatedSettlementId.length > 0 &&
      !settlementIds.has(transaction.relatedSettlementId),
  )
  if (bankTransactionsWithUnknownSettlement.length > 0) {
    errors.push(
      `${bankTransactionsWithUnknownSettlement.length} banka hareketi hakediş listesinde olmayan relatedSettlementId içeriyor.`,
    )
  }

  const parsed = pintiDatasetSchema.safeParse(normalizedInput)

  if (parsed.success) {
    const frontendValidation = validateFrontendDataset(
      parsed.data as unknown as Partial<PintiDataset>,
    )
    pushUnique(errors, frontendValidation.errors)
    pushUnique(warnings, frontendValidation.warnings)
  } else {
    pushUnique(
      errors,
      parsed.error.issues.map((issue) => {
        const path = issue.path.length > 0 ? issue.path.join('.') : 'dataset'
        return `${path}: ${issue.message}`
      }),
    )
  }

  return {
    dataset: parsed.success ? (parsed.data as unknown as PintiDataset) : null,
    validation: {
      isValid: errors.length === 0,
      errors,
      warnings,
      counts,
    },
  }
}
