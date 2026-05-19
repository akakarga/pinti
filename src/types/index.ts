export type RiskLevel = 'healthy' | 'watch' | 'critical' | 'neutral'

export type ProductHealthStatus = 'healthy' | 'watch' | 'risky' | 'loss'

export type CampaignHealthStatus = 'healthy' | 'watch' | 'risky' | 'loss'

export type ReturnHealthStatus = 'healthy' | 'watch' | 'risky' | 'critical'

export type ReturnRiskLevel = 'low' | 'medium' | 'high' | 'critical'

export type ReconciliationRiskLevel = 'low' | 'medium' | 'high' | 'critical'

export type ReconciliationDifferenceType =
  | 'matched'
  | 'commission_difference'
  | 'shipping_deduction'
  | 'return_deduction'
  | 'campaign_deduction'
  | 'service_fee'
  | 'delayed_payment'
  | 'unexplained_difference'
  | 'overpayment'

export type PriceRiskLevel = 'safe' | 'watch' | 'risky' | 'critical'

export type CampaignSimulationType =
  | 'discount'
  | 'coupon'
  | 'free_shipping'
  | 'bundle'
  | 'cart_threshold'

export type CampaignSimulationRiskLevel = 'safe' | 'watch' | 'risky' | 'critical'

export type RecommendedProductAction =
  | 'increase_price'
  | 'reduce_ads'
  | 'monitor'
  | 'review_returns'
  | 'reorder_carefully'
  | 'pause_promotion'

export type OrderStatus = 'completed' | 'cancelled'

export type ReturnStatus = 'requested' | 'approved' | 'rejected' | 'review'

export type RecommendedCampaignAction =
  | 'increase_budget'
  | 'reduce_budget'
  | 'pause_campaign'
  | 'monitor'
  | 'review_returns'
  | 'shift_budget'

export type RecommendedReturnAction =
  | 'monitor'
  | 'review_product_page'
  | 'improve_packaging'
  | 'manual_review'
  | 'review_quality_control'
  | 'clarify_description'
  | 'check_delivery_process'

export type RecommendedPriceAction =
  | 'monitor'
  | 'review_price'
  | 'increase_price_carefully'
  | 'reduce_ad_cost'
  | 'create_bundle'
  | 'review_discount'
  | 'set_cart_threshold'

export type RecommendedCampaignSimulationAction =
  | 'monitor'
  | 'run_small_test'
  | 'reduce_discount'
  | 'avoid_campaign'
  | 'use_bundle'
  | 'set_cart_threshold'
  | 'review_free_shipping'
  | 'reduce_ad_cost'

export type ModuleKey =
  | 'karPusula'
  | 'reklamMerkezi'
  | 'iadeKalkan'
  | 'mutabakat'
  | 'fiyatKoruma'
  | 'kampanyaSim'
  | 'aiAksiyon'
  | 'demoVerisi'

export interface Product {
  id: string
  name: string
  sku: string
  category: string
  salePrice: number
  unitCost: number
  stock: number
  commissionRate: number
  averageShippingCost: number
  targetNetMargin: number
  expectedAdCostPerUnit: number
  expectedReturnCostPerUnit: number
  competitorPriceMin: number
  competitorPriceMax: number
  currentDiscountRate: number
  salesRevenue: number
  grossProfit: number
  netProfit: number
  adSpend: number
  returnRate: number
  currentPrice: number
  minHealthyPrice: number
  riskLevel: RiskLevel
}

export interface Order {
  id: string
  productId: string
  campaignId: string
  customerId: string
  quantity: number
  unitPrice: number
  orderDate: string
  status: OrderStatus
  hasReturn: boolean
}

export interface Campaign {
  id: string
  name: string
  channel: string
  objective: string
  totalSpend: number
  attributedRevenue: number
  startDate: string
  endDate: string
  productId?: string
  productIds?: string[]
  spend: number
  revenue: number
  roas: number
  netProfitAfterAds: number
  status: RiskLevel
}

export interface CampaignPerformance {
  id: string
  campaignId: string
  date: string
  impressions: number
  clicks: number
  adSpend: number
  attributedOrders: number
  attributedRevenue: number
}

export interface ReturnRequest {
  id: string
  orderId: string
  productId: string
  customerId: string
  refundAmount: number
  returnShippingCost: number
  reason: string
  customerMessage: string
  restockable: boolean
  requestDate: string
  riskLevel: RiskLevel
  status: ReturnStatus
}

export interface Customer {
  id: string
  name: string
  totalOrders: number
  totalReturns: number
  previousDisputes: number
}

export interface PaymentDispute {
  id: string
  orderId: string
  customerId: string
  amount: number
  reason: string
  status: 'open' | 'under_review' | 'resolved' | 'rejected'
  createdAt: string
}

export interface ReturnRecord {
  id: string
  orderId: string
  productName: string
  reason: string
  amount: number
  date: string
  riskLevel: RiskLevel
}

export interface SettlementRecord {
  id: string
  orderId: string
  marketplace: string
  settlementDate: string
  grossAmount: number
  commissionFee: number
  shippingFee: number
  returnDeduction: number
  campaignDeduction: number
  serviceFee: number
  expectedNetAmount: number
  period: string
  expectedAmount: number
  paidAmount: number
  difference: number
  status: RiskLevel
}

export type Settlement = SettlementRecord

export interface ProductProfitResult {
  productId: string
  productName: string
  category: string
  unitsSold: number
  revenue: number
  productCost: number
  commissionCost: number
  shippingCost: number
  adSpend: number
  returnImpact: number
  grossProfit: number
  netProfit: number
  netMargin: number
  returnRate: number
  stock: number
  healthScore: number
  healthStatus: ProductHealthStatus
  recommendedAction: RecommendedProductAction
  explanation: string
}

export interface CampaignProfitResult {
  campaignId: string
  campaignName: string
  channel: string
  objective: string
  productNames: string[]
  adSpend: number
  attributedRevenue: number
  attributedOrders: number
  roas: number
  productCost: number
  commissionCost: number
  shippingCost: number
  returnImpact: number
  netProfitAfterAds: number
  netMarginAfterAds: number
  profitBasedROAS: number
  wastedAdSpend: boolean
  healthScore: number
  healthStatus: CampaignHealthStatus
  recommendedAction: RecommendedCampaignAction
  explanation: string
}

export interface BudgetShiftRecommendation {
  fromCampaignId: string
  fromCampaignName: string
  toCampaignId: string
  toCampaignName: string
  suggestedAmount: number
  reason: string
  confidence: number
}

export interface ProductReturnResult {
  productId: string
  productName: string
  category: string
  totalOrders: number
  totalReturns: number
  returnRate: number
  refundAmount: number
  returnShippingCost: number
  estimatedRestockingLoss: number
  totalReturnLoss: number
  mainReasons: string[]
  riskLevel: ReturnHealthStatus
  healthScore: number
  recommendedAction: RecommendedReturnAction
  explanation: string
}

export interface ReturnRiskResult {
  returnId: string
  orderId: string
  productId: string
  productName: string
  customerId: string
  customerName: string
  refundAmount: number
  returnShippingCost: number
  reason: string
  customerMessage: string
  riskScore: number
  riskLevel: ReturnRiskLevel
  riskSignals: string[]
  manualReviewRecommended: boolean
  suggestedAction: RecommendedReturnAction
  explanation: string
}

export interface ReturnReasonInsight {
  reason: string
  count: number
  estimatedLoss: number
  explanation: string
  suggestedAction: RecommendedReturnAction
}

export interface ManualReviewReturn {
  returnId: string
  orderId: string
  customerName: string
  productName: string
  riskScore: number
  riskLevel: ReturnRiskLevel
  reason: string
  suggestedAction: RecommendedReturnAction
}

export interface BankTransaction {
  id: string
  relatedSettlementId?: string
  transactionDate: string
  bank: string
  date: string
  description: string
  amount: number
  matched: boolean
  status: 'matched' | 'pending' | 'needs_review' | 'unmatched'
}

export interface ReconciliationResult {
  id: string
  settlementId: string
  orderId: string
  marketplace: string
  settlementDate: string
  expectedAmount: number
  actualPaidAmount: number
  difference: number
  absoluteDifference: number
  differenceType: ReconciliationDifferenceType
  riskLevel: ReconciliationRiskLevel
  isDelayed: boolean
  explanation: string
  suggestedAction: string
  manualReviewRecommended: boolean
}

export interface DeductionSummary {
  commissionTotal: number
  shippingTotal: number
  returnTotal: number
  campaignTotal: number
  serviceFeeTotal: number
  explainedDifference: number
  unexplainedDifference: number
}

export interface MarketplaceMessageDraft {
  subject: string
  body: string
  referencedRecords: string[]
  tone: string
  disclaimer: string
}

export interface PriceAlternativeSuggestion {
  type: string
  title: string
  explanation: string
  estimatedEffect: string
  priority: 'high' | 'medium' | 'low'
}

export interface PriceProtectionResult {
  productId: string
  productName: string
  category: string
  currentPrice: number
  unitCost: number
  commissionRate: number
  averageShippingCost: number
  expectedAdCostPerUnit: number
  expectedReturnCostPerUnit: number
  targetNetMargin: number
  currentNetMargin: number
  minimumHealthyPrice: number
  priceGap: number
  riskLevel: PriceRiskLevel
  recommendedAction: RecommendedPriceAction
  alternatives: PriceAlternativeSuggestion[]
  explanation: string
}

export interface CampaignSimulationScenario {
  id: string
  productId: string
  name: string
  campaignType: CampaignSimulationType
  discountRate: number
  couponAmount: number
  freeShipping: boolean
  expectedSalesLift: number
  currentUnitsSold: number
  targetProfit: number
  notes: string
}

export interface CampaignAlternative {
  type: string
  title: string
  explanation: string
  estimatedEffect: string
  priority: 'high' | 'medium' | 'low'
}

export interface CampaignSimulationResult {
  scenarioId: string
  productId: string
  productName: string
  campaignName: string
  campaignType: CampaignSimulationType
  currentPrice: number
  campaignPrice: number
  currentUnitNetProfit: number
  campaignUnitNetProfit: number
  currentNetMargin: number
  campaignNetMargin: number
  profitDropPerUnit: number
  breakEvenUnits: number | null
  requiredSalesLift: number | null
  expectedSalesLift: number
  freeShippingImpact: number
  totalProfitBeforeCampaign: number
  estimatedTotalProfitAfterCampaign: number
  riskLevel: CampaignSimulationRiskLevel
  recommendedAction: RecommendedCampaignSimulationAction
  alternatives: CampaignAlternative[]
  explanation: string
}

export type UnifiedActionPriority = 'low' | 'medium' | 'high' | 'critical'

export type UnifiedActionCategory =
  | 'profit'
  | 'ads'
  | 'returns'
  | 'reconciliation'
  | 'pricing'
  | 'campaign'
  | 'cashflow'
  | 'general'

export type UnifiedActionStatus = 'open' | 'review' | 'monitor'

export interface UnifiedAction {
  id: string
  module: string
  category: UnifiedActionCategory
  title: string
  summary: string
  reason: string
  priority: UnifiedActionPriority
  status: UnifiedActionStatus
  impactLabel: string
  estimatedImpactAmount: number
  relatedEntityName: string
  relatedEntityId: string
  recommendedNextStep: string
  route: string
  disclaimer: string
}

export interface UnifiedHealthSummary {
  overallScore: number
  riskLevel: UnifiedActionPriority
  totalCriticalActions: number
  totalHighActions: number
  totalEstimatedImpact: number
  topModule: string
  summaryText: string
}

export interface ModuleSummary {
  module: string
  title: string
  score: number
  riskLevel: UnifiedActionPriority
  mainFinding: string
  actionCount: number
  route: string
}

export interface DashboardSummary {
  totalSales: number
  realNetProfit: number
  netProfitAfterAds: number
  totalReturnLoss: number
  unexplainedSettlementGap: number
  riskyOrderCount: number
  healthScore: number
}

export interface AIInsight {
  id: string
  moduleName: string
  title: string
  description: string
  severity: RiskLevel
}

export interface ModuleStat {
  label: string
  value: string
  tone: RiskLevel
}

export interface ModuleMeta {
  key: ModuleKey
  title: string
  shortTitle: string
  path: string
  description: string
  stats: ModuleStat[]
}

export interface CompanyProfile {
  id: string
  name: string
  sector: string
  marketplace: string
  monthlyOrderVolume: number
  riskProfile: string
  description: string
  strongestModules: string[]
}

export interface PintiDataset {
  id: string
  companyProfile: CompanyProfile
  products: Product[]
  orders: Order[]
  returns: ReturnRequest[]
  customers: Customer[]
  paymentDisputes: PaymentDispute[]
  campaigns: Campaign[]
  campaignPerformance: CampaignPerformance[]
  settlements: SettlementRecord[]
  bankTransactions: BankTransaction[]
  campaignSimulationScenarios: CampaignSimulationScenario[]
}

export type DataSourceType = 'demo' | 'uploaded' | 'empty'

export type AnalysisStatus = 'idle' | 'ready' | 'running' | 'completed' | 'error'

export interface ProductManualOverride {
  targetNetMargin?: number
  commissionRate?: number
  averageShippingCost?: number
  unitCost?: number
  expectedAdCostPerUnit?: number
  expectedReturnCostPerUnit?: number
}

export interface CampaignManualOverride {
  totalSpend?: number
  attributedRevenue?: number
  attributedOrders?: number
}

export interface ReturnManualOverride {
  restockable?: boolean
  riskLevel?: RiskLevel
  manualReviewRecommended?: boolean
}

export interface ReconciliationManualOverride {
  toleranceAmount?: number
  delayedPaymentDaysThreshold?: number
}

export interface CampaignSimulationManualOverride {
  discountRate?: number
  couponAmount?: number
  freeShipping?: boolean
  expectedSalesLift?: number
}

export interface ManualOverrides {
  productOverrides: Record<string, ProductManualOverride>
  campaignOverrides: Record<string, CampaignManualOverride>
  returnOverrides: Record<string, ReturnManualOverride>
  reconciliationOverrides: ReconciliationManualOverride
  campaignSimulationOverrides: Record<string, CampaignSimulationManualOverride>
}

export interface DatasetValidationCounts {
  products: number
  orders: number
  returns: number
  customers: number
  paymentDisputes: number
  campaigns: number
  campaignPerformance: number
  settlements: number
  bankTransactions: number
  campaignSimulationScenarios: number
}

export interface DatasetValidationResult {
  isValid: boolean
  warnings: string[]
  errors: string[]
  counts: DatasetValidationCounts
}
