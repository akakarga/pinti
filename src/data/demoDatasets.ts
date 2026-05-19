import {
  bankTransactions,
  campaignPerformance,
  campaignSimulationScenarios,
  campaigns,
  customers,
  orders,
  paymentDisputes,
  products,
  returnRequests,
  settlementRecords,
} from './mockData'
import type {
  BankTransaction,
  Campaign,
  CampaignPerformance,
  CampaignSimulationScenario,
  CompanyProfile,
  Customer,
  Order,
  PaymentDispute,
  PintiDataset,
  Product,
  ReturnRequest,
  SettlementRecord,
} from '../types'

type VariantConfig = {
  id: string
  companyProfile: CompanyProfile
  priceMultiplier: number
  costMultiplier: number
  shippingMultiplier: number
  adSpendMultiplier: number
  returnMultiplier: number
  settlementGapMultiplier: number
  discountDelta: number
}

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function round(value: number) {
  return Math.round(value)
}

function createProducts(config: VariantConfig): Product[] {
  return clone(products).map((product, index) => {
    const priceMultiplier = config.priceMultiplier + index * 0.01
    const costMultiplier = config.costMultiplier + (index % 2) * 0.015
    const shippingMultiplier = config.shippingMultiplier + (index % 3) * 0.02
    const adSpendMultiplier = config.adSpendMultiplier + (index % 2) * 0.08
    const returnMultiplier = config.returnMultiplier + (index % 3) * 0.04
    const salePrice = round(product.salePrice * priceMultiplier)
    const unitCost = round(product.unitCost * costMultiplier)
    const averageShippingCost = round(product.averageShippingCost * shippingMultiplier)
    const expectedAdCostPerUnit = round(product.expectedAdCostPerUnit * adSpendMultiplier)
    const expectedReturnCostPerUnit = round(product.expectedReturnCostPerUnit * returnMultiplier)
    const currentDiscountRate = clamp(
      product.currentDiscountRate + config.discountDelta + index * 0.005,
      0,
      0.32,
    )

    return {
      ...product,
      salePrice,
      currentPrice: salePrice,
      unitCost,
      averageShippingCost,
      expectedAdCostPerUnit,
      expectedReturnCostPerUnit,
      targetNetMargin: clamp(product.targetNetMargin + (index % 2 === 0 ? 0.01 : -0.005), 0.12, 0.28),
      competitorPriceMin: round(product.competitorPriceMin * priceMultiplier),
      competitorPriceMax: round(product.competitorPriceMax * (priceMultiplier + 0.02)),
      currentDiscountRate,
      stock: Math.max(4, round(product.stock * (config.id === 'mira-kozmetik' ? 0.78 : 1))),
      salesRevenue: round(product.salesRevenue * priceMultiplier),
      grossProfit: round(product.grossProfit * (priceMultiplier / costMultiplier)),
      netProfit: round(product.netProfit * (priceMultiplier / (costMultiplier + 0.08))),
      adSpend: round(product.adSpend * adSpendMultiplier),
      returnRate: clamp(product.returnRate * returnMultiplier, 0.01, 0.28),
    }
  })
}

function createOrders(datasetProducts: Product[], config: VariantConfig): Order[] {
  const priceByProductId = new Map(datasetProducts.map((product) => [product.id, product.salePrice]))

  return clone(orders).map((order, index) => ({
    ...order,
    unitPrice: round((priceByProductId.get(order.productId) ?? order.unitPrice) * (index % 4 === 0 ? 0.97 : 1)),
    quantity: index % 11 === 0 && config.id === 'nova-aksesuar' ? order.quantity + 1 : order.quantity,
    hasReturn:
      config.returnMultiplier > 1.15 && index % 9 === 0 ? true : order.hasReturn,
  }))
}

function createReturns(datasetProducts: Product[], config: VariantConfig): ReturnRequest[] {
  const priceByProductId = new Map(datasetProducts.map((product) => [product.id, product.salePrice]))

  return clone(returnRequests).map((returnRequest, index) => ({
    ...returnRequest,
    refundAmount: round((priceByProductId.get(returnRequest.productId) ?? returnRequest.refundAmount) * (index % 2 === 0 ? 0.92 : 1)),
    returnShippingCost: round(returnRequest.returnShippingCost * config.shippingMultiplier),
    restockable:
      config.id === 'mira-kozmetik' && index % 3 === 0 ? false : returnRequest.restockable,
    riskLevel:
      config.returnMultiplier > 1.2 && index % 3 === 0 ? 'critical' : returnRequest.riskLevel,
  }))
}

function createCampaigns(datasetProducts: Product[], config: VariantConfig): Campaign[] {
  const productById = new Map(datasetProducts.map((product) => [product.id, product]))

  return clone(campaigns).map((campaign, index) => {
    const product = campaign.productId ? productById.get(campaign.productId) : undefined
    const spendMultiplier = config.adSpendMultiplier + index * 0.07
    const revenueMultiplier =
      config.id === 'nova-aksesuar'
        ? 0.92 + index * 0.03
        : config.priceMultiplier + (index % 2) * 0.04
    const totalSpend = round(campaign.totalSpend * spendMultiplier)
    const attributedRevenue = round(campaign.attributedRevenue * revenueMultiplier)
    const roas = totalSpend > 0 ? attributedRevenue / totalSpend : 0

    return {
      ...campaign,
      totalSpend,
      attributedRevenue,
      spend: totalSpend,
      revenue: attributedRevenue,
      roas,
      netProfitAfterAds: round((campaign.netProfitAfterAds + (product?.salePrice ?? 0) * 0.08) * (revenueMultiplier - spendMultiplier * 0.22)),
      status: roas >= 5 ? 'healthy' : roas >= 2.5 ? 'watch' : 'critical',
    }
  })
}

function createCampaignPerformance(datasetCampaigns: Campaign[], config: VariantConfig): CampaignPerformance[] {
  const campaignById = new Map(datasetCampaigns.map((campaign) => [campaign.id, campaign]))
  const totals = new Map<string, { spend: number; revenue: number; rows: number }>()

  campaignPerformance.forEach((performance) => {
    const total = totals.get(performance.campaignId) ?? { spend: 0, revenue: 0, rows: 0 }
    total.spend += performance.adSpend
    total.revenue += performance.attributedRevenue
    total.rows += 1
    totals.set(performance.campaignId, total)
  })

  return clone(campaignPerformance).map((performance, index) => {
    const campaign = campaignById.get(performance.campaignId)
    const total = totals.get(performance.campaignId)
    const spendShare = total && total.spend > 0 ? performance.adSpend / total.spend : 1 / (total?.rows ?? 1)
    const revenueShare = total && total.revenue > 0 ? performance.attributedRevenue / total.revenue : spendShare

    return {
      ...performance,
      impressions: round(performance.impressions * (config.adSpendMultiplier + 0.15)),
      clicks: round(performance.clicks * (config.adSpendMultiplier + 0.08)),
      adSpend: round((campaign?.totalSpend ?? performance.adSpend) * spendShare),
      attributedRevenue: round((campaign?.attributedRevenue ?? performance.attributedRevenue) * revenueShare),
      attributedOrders:
        config.id === 'nova-aksesuar' && index % 3 === 0
          ? performance.attributedOrders + 1
          : performance.attributedOrders,
    }
  })
}

function createSettlements(config: VariantConfig): SettlementRecord[] {
  return clone(settlementRecords).map((settlement, index) => {
    const grossAmount = round(settlement.grossAmount * config.priceMultiplier)
    const commissionFee = round(settlement.commissionFee * config.costMultiplier)
    const shippingFee = round(settlement.shippingFee * config.shippingMultiplier)
    const returnDeduction = round(settlement.returnDeduction * config.returnMultiplier)
    const campaignDeduction = round(settlement.campaignDeduction * config.adSpendMultiplier)
    const serviceFee = round(settlement.serviceFee * (1 + index * 0.01))
    const expectedNetAmount =
      grossAmount - commissionFee - shippingFee - returnDeduction - campaignDeduction - serviceFee
    const gap = round(settlement.difference * config.settlementGapMultiplier)

    return {
      ...settlement,
      grossAmount,
      commissionFee,
      shippingFee,
      returnDeduction,
      campaignDeduction,
      serviceFee,
      expectedNetAmount,
      expectedAmount: expectedNetAmount,
      paidAmount: expectedNetAmount + gap,
      difference: gap,
      status: Math.abs(gap) > 1200 ? 'critical' : Math.abs(gap) > 250 ? 'watch' : 'healthy',
    }
  })
}

function createBankTransactions(
  datasetSettlements: SettlementRecord[],
  config: VariantConfig,
): BankTransaction[] {
  const settlementById = new Map(datasetSettlements.map((settlement) => [settlement.id, settlement]))

  return clone(bankTransactions).map((transaction, index) => {
    const settlement = transaction.relatedSettlementId
      ? settlementById.get(transaction.relatedSettlementId)
      : undefined
    const amount = settlement
      ? settlement.paidAmount
      : round(transaction.amount * (config.priceMultiplier - index * 0.01))

    return {
      ...transaction,
      amount,
      matched: settlement ? Math.abs(settlement.difference) <= 50 : transaction.matched,
      status:
        config.id === 'mira-kozmetik' && index === 3
          ? 'needs_review'
          : settlement && Math.abs(settlement.difference) > 500
            ? 'needs_review'
            : transaction.status,
    }
  })
}

function createCampaignSimulationScenarios(config: VariantConfig): CampaignSimulationScenario[] {
  return clone(campaignSimulationScenarios).map((scenario, index) => ({
    ...scenario,
    discountRate: clamp(scenario.discountRate + config.discountDelta + index * 0.005, 0, 0.35),
    couponAmount: round(scenario.couponAmount * (1 + config.discountDelta * 2)),
    freeShipping:
      config.shippingMultiplier > 1.15 && index % 2 === 0 ? true : scenario.freeShipping,
    expectedSalesLift: clamp(scenario.expectedSalesLift * (config.id === 'nova-aksesuar' ? 1.12 : 0.96), 0.02, 0.8),
    targetProfit: round(scenario.targetProfit * config.priceMultiplier),
  }))
}

function createDataset(config: VariantConfig): PintiDataset {
  const datasetProducts = createProducts(config)
  const datasetOrders = createOrders(datasetProducts, config)
  const datasetReturns = createReturns(datasetProducts, config)
  const datasetCampaigns = createCampaigns(datasetProducts, config)
  const datasetCampaignPerformance = createCampaignPerformance(datasetCampaigns, config)
  const datasetSettlements = createSettlements(config)

  return {
    id: config.id,
    companyProfile: config.companyProfile,
    products: datasetProducts,
    orders: datasetOrders,
    returns: datasetReturns,
    customers: clone(customers) as Customer[],
    paymentDisputes: clone(paymentDisputes) as PaymentDispute[],
    campaigns: datasetCampaigns,
    campaignPerformance: datasetCampaignPerformance,
    settlements: datasetSettlements,
    bankTransactions: createBankTransactions(datasetSettlements, config),
    campaignSimulationScenarios: createCampaignSimulationScenarios(config),
  }
}

export const demoDatasets: PintiDataset[] = [
  createDataset({
    id: 'luna-ev-yasam',
    companyProfile: {
      id: 'luna-ev-yasam',
      name: 'Luna Ev & Yaşam',
      sector: 'Ev ve yaşam ürünleri',
      marketplace: 'Trendyol + pazaryeri reklamları',
      monthlyOrderVolume: 1280,
      riskProfile: 'Yüksek ciro, kargo ve iade etkisi yüksek.',
      description:
        'Çok satan ürünlerde kargo ve iade maliyeti net marjı baskılıyor. KârPusula, İadeKalkan ve FiyatKoruma güçlü demo verir.',
      strongestModules: ['KârPusula', 'İadeKalkan', 'FiyatKoruma'],
    },
    priceMultiplier: 1,
    costMultiplier: 1,
    shippingMultiplier: 1.18,
    adSpendMultiplier: 1.05,
    returnMultiplier: 1.22,
    settlementGapMultiplier: 1,
    discountDelta: 0.01,
  }),
  createDataset({
    id: 'nova-aksesuar',
    companyProfile: {
      id: 'nova-aksesuar',
      name: 'Nova Aksesuar',
      sector: 'Aksesuar ve ofis ürünleri',
      marketplace: 'Meta + marketplace ads',
      monthlyOrderVolume: 1640,
      riskProfile: 'Reklam harcaması yoğun, ROAS yanıltıcı.',
      description:
        'Bazı kampanyalar satış getiriyor ancak reklam sonrası net kâr baskılanıyor. ReklamMerkezi ve KampanyaSim öne çıkar.',
      strongestModules: ['ReklamMerkezi', 'KampanyaSim'],
    },
    priceMultiplier: 0.96,
    costMultiplier: 1.02,
    shippingMultiplier: 1.04,
    adSpendMultiplier: 1.72,
    returnMultiplier: 1.05,
    settlementGapMultiplier: 0.8,
    discountDelta: 0.02,
  }),
  createDataset({
    id: 'pera-bebek-anne',
    companyProfile: {
      id: 'pera-bebek-anne',
      name: 'Pera Bebek & Anne',
      sector: 'Anne, bebek ve bakım',
      marketplace: 'Hepsiburada + kupon kampanyaları',
      monthlyOrderVolume: 920,
      riskProfile: 'Fiyat riski ve kupon baskısı yüksek.',
      description:
        'Hedef net marj ile kampanya/kupon etkisi arasında gerilim var. FiyatKoruma ve KampanyaSim güçlü demo verir.',
      strongestModules: ['FiyatKoruma', 'KampanyaSim'],
    },
    priceMultiplier: 0.93,
    costMultiplier: 1.08,
    shippingMultiplier: 1.12,
    adSpendMultiplier: 1.18,
    returnMultiplier: 1.18,
    settlementGapMultiplier: 0.7,
    discountDelta: 0.055,
  }),
  createDataset({
    id: 'mira-kozmetik',
    companyProfile: {
      id: 'mira-kozmetik',
      name: 'Mira Kozmetik',
      sector: 'Kozmetik ve kişisel bakım',
      marketplace: 'N11 + banka mutabakatı',
      monthlyOrderVolume: 740,
      riskProfile: 'Hakediş farkı, ödeme gecikmesi ve iade kontrolü öne çıkıyor.',
      description:
        'Mutabakat farkları ve yeniden satılamayan iadeler manuel kontrol gerektiriyor. Mutabakat ve İadeKalkan güçlü demo verir.',
      strongestModules: ['Mutabakat', 'İadeKalkan'],
    },
    priceMultiplier: 1.04,
    costMultiplier: 1.03,
    shippingMultiplier: 1.08,
    adSpendMultiplier: 0.94,
    returnMultiplier: 1.35,
    settlementGapMultiplier: 1.85,
    discountDelta: 0.015,
  }),
]

export const defaultDatasetId = demoDatasets[0].id
