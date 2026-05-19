import type {
  BankTransaction,
  DeductionSummary,
  MarketplaceMessageDraft,
  ReconciliationDifferenceType,
  ReconciliationResult,
  ReconciliationRiskLevel,
  SettlementRecord,
} from '../types'

const MATCH_TOLERANCE = 50
const DAY_IN_MS = 86_400_000

function clampCurrency(value: number) {
  return Math.round(value)
}

function getDateDistanceInDays(firstDate: string, secondDate: string) {
  const first = new Date(`${firstDate}T00:00:00`)
  const second = new Date(`${secondDate}T00:00:00`)

  return Math.abs(Math.round((second.getTime() - first.getTime()) / DAY_IN_MS))
}

function isDeductionType(type: ReconciliationDifferenceType) {
  return [
    'commission_difference',
    'shipping_deduction',
    'return_deduction',
    'campaign_deduction',
    'service_fee',
  ].includes(type)
}

function getSuggestedAction(type: ReconciliationDifferenceType, riskLevel: ReconciliationRiskLevel) {
  if (type === 'matched') {
    return 'Kayıt izlenebilir; mevcut demo verisinde ödeme tolerans içinde görünüyor.'
  }

  if (type === 'delayed_payment') {
    return 'Ödeme tarihi, pazaryeri hakediş raporu ve banka hareketi manuel kontrol edilebilir.'
  }

  if (type === 'unexplained_difference') {
    return 'Açıklanamayan fark için pazaryeri kesinti raporu ve banka ödeme dekontu birlikte incelenebilir.'
  }

  if (type === 'overpayment') {
    return 'Beklenenden yüksek ödeme görüldüğü için kayıt eşleşmesi ve dönem bilgisi kontrol edilebilir.'
  }

  if (riskLevel === 'critical' || riskLevel === 'high') {
    return 'Kesinti kalemi yüksek göründüğü için manuel kontrol önerilir.'
  }

  return 'Kesinti kalemi takip edilebilir; karar vermeden önce dönem raporu ile karşılaştırılmalı.'
}

function getExplanation(
  settlement: SettlementRecord,
  type: ReconciliationDifferenceType,
  difference: number,
) {
  if (type === 'matched') {
    return 'Beklenen hakediş ile banka ödemesi tolerans içinde uyumlu görünüyor.'
  }

  if (type === 'delayed_payment') {
    return `${settlement.id} için eşleşen banka hareketi bulunamadı. Bu çıktı kesin muhasebesel tespit değildir; ödeme tarihi manuel kontrol edilebilir.`
  }

  if (type === 'campaign_deduction') {
    return 'Bu fark kampanya kesintisiyle kısmen ilişkili görünüyor. Kampanya raporu ve hakediş kalemleri birlikte kontrol edilebilir.'
  }

  if (type === 'return_deduction') {
    return 'Bu fark iade kesintisiyle kısmen ilişkili görünüyor. İade kaydı ve hakediş raporu birlikte incelenebilir.'
  }

  if (type === 'shipping_deduction') {
    return 'Bu fark kargo kesintisiyle kısmen açıklanabilir görünüyor. Kargo bedeli ve pazaryeri raporu kontrol edilebilir.'
  }

  if (type === 'service_fee') {
    return 'Bu fark hizmet bedeli kalemiyle kısmen ilişkili görünüyor. Hizmet bedeli açıklaması manuel kontrol edilebilir.'
  }

  if (type === 'commission_difference') {
    return 'Bu kayıtta komisyon kalemi beklenen tutarı etkiliyor olabilir. Komisyon oranı ve dönem raporu karşılaştırılabilir.'
  }

  if (type === 'overpayment') {
    return 'Banka ödemesi beklenen hakedişin üzerinde görünüyor. Kayıt eşleşmesi ve dönem bilgisi kontrol edilebilir.'
  }

  return `Mevcut verilere göre beklenen hakediş ile banka ödemesi arasında ${Math.abs(
    difference,
  ).toLocaleString('tr-TR')} TL açıklanamayan fark görünüyor. Manuel kontrol önerilir.`
}

export function calculateExpectedSettlement(settlement: SettlementRecord) {
  return clampCurrency(
    settlement.grossAmount -
      settlement.commissionFee -
      settlement.shippingFee -
      settlement.returnDeduction -
      settlement.campaignDeduction -
      settlement.serviceFee,
  )
}

export function matchBankTransaction(
  settlement: SettlementRecord,
  bankTransactions: BankTransaction[],
) {
  const directMatch = bankTransactions.find(
    (transaction) => transaction.relatedSettlementId === settlement.id,
  )

  if (directMatch) {
    return directMatch
  }

  const expectedAmount = calculateExpectedSettlement(settlement)

  return bankTransactions.find((transaction) => {
    if (transaction.relatedSettlementId) {
      return false
    }

    const amountIsClose = Math.abs(transaction.amount - expectedAmount) <= MATCH_TOLERANCE
    const dateIsClose = getDateDistanceInDays(
      settlement.settlementDate,
      transaction.transactionDate,
    ) <= 5

    return amountIsClose && dateIsClose
  })
}

export function detectSettlementDifference(
  settlement: SettlementRecord,
  bankTransaction?: BankTransaction,
) {
  const expectedNetAmount = calculateExpectedSettlement(settlement)
  const actualPaidAmount = bankTransaction?.amount ?? 0

  return clampCurrency(actualPaidAmount - expectedNetAmount)
}

export function classifyDifference(
  settlement: SettlementRecord,
  bankTransaction: BankTransaction | undefined,
  difference: number,
): ReconciliationDifferenceType {
  const absoluteDifference = Math.abs(difference)

  if (bankTransaction && absoluteDifference <= MATCH_TOLERANCE) {
    return 'matched'
  }

  if (!bankTransaction) {
    return 'delayed_payment'
  }

  if (difference > MATCH_TOLERANCE) {
    return 'overpayment'
  }

  if (
    settlement.campaignDeduction > 0 &&
    settlement.campaignDeduction >= absoluteDifference * 0.5
  ) {
    return 'campaign_deduction'
  }

  if (
    settlement.returnDeduction > 0 &&
    settlement.returnDeduction >= absoluteDifference * 0.4
  ) {
    return 'return_deduction'
  }

  if (settlement.shippingFee > 1500 && settlement.shippingFee >= absoluteDifference * 0.4) {
    return 'shipping_deduction'
  }

  if (settlement.serviceFee > 350 && settlement.serviceFee >= absoluteDifference * 0.1) {
    return 'service_fee'
  }

  if (settlement.commissionFee / settlement.grossAmount > 0.16) {
    return 'commission_difference'
  }

  return 'unexplained_difference'
}

export function calculateReconciliationRisk(
  result: Pick<ReconciliationResult, 'absoluteDifference' | 'differenceType'>,
): ReconciliationRiskLevel {
  if (result.differenceType === 'matched') {
    return 'low'
  }

  if (result.absoluteDifference > 1500) {
    return 'critical'
  }

  if (
    result.differenceType === 'delayed_payment' ||
    result.differenceType === 'unexplained_difference'
  ) {
    return 'high'
  }

  if (result.absoluteDifference > 750) {
    return 'high'
  }

  if (result.absoluteDifference > 150) {
    return 'medium'
  }

  return 'low'
}

export function calculateAllReconciliationResults(
  settlements: SettlementRecord[],
  bankTransactions: BankTransaction[],
): ReconciliationResult[] {
  return settlements.map((settlement) => {
    const bankTransaction = matchBankTransaction(settlement, bankTransactions)
    const expectedAmount = calculateExpectedSettlement(settlement)
    const actualPaidAmount = bankTransaction?.amount ?? 0
    const difference = detectSettlementDifference(settlement, bankTransaction)
    const absoluteDifference = Math.abs(difference)
    const differenceType = classifyDifference(settlement, bankTransaction, difference)
    const riskLevel = calculateReconciliationRisk({
      absoluteDifference,
      differenceType,
    })
    const isDelayed = differenceType === 'delayed_payment'
    const manualReviewRecommended =
      isDelayed ||
      differenceType === 'unexplained_difference' ||
      riskLevel === 'high' ||
      riskLevel === 'critical'

    return {
      id: `rec-${settlement.id}`,
      settlementId: settlement.id,
      orderId: settlement.orderId,
      marketplace: settlement.marketplace,
      settlementDate: settlement.settlementDate,
      expectedAmount,
      actualPaidAmount,
      difference,
      absoluteDifference,
      differenceType,
      riskLevel,
      isDelayed,
      explanation: getExplanation(settlement, differenceType, difference),
      suggestedAction: getSuggestedAction(differenceType, riskLevel),
      manualReviewRecommended,
    }
  })
}

export function calculateDeductionSummary(
  settlements: SettlementRecord[],
  reconciliationResults: ReconciliationResult[],
): DeductionSummary {
  const totals = settlements.reduce(
    (summary, settlement) => ({
      commissionTotal: summary.commissionTotal + settlement.commissionFee,
      shippingTotal: summary.shippingTotal + settlement.shippingFee,
      returnTotal: summary.returnTotal + settlement.returnDeduction,
      campaignTotal: summary.campaignTotal + settlement.campaignDeduction,
      serviceFeeTotal: summary.serviceFeeTotal + settlement.serviceFee,
    }),
    {
      commissionTotal: 0,
      shippingTotal: 0,
      returnTotal: 0,
      campaignTotal: 0,
      serviceFeeTotal: 0,
    },
  )

  return {
    ...totals,
    explainedDifference: reconciliationResults
      .filter((result) => isDeductionType(result.differenceType))
      .reduce((sum, result) => sum + result.absoluteDifference, 0),
    unexplainedDifference: reconciliationResults
      .filter((result) => result.differenceType === 'unexplained_difference')
      .reduce((sum, result) => sum + result.absoluteDifference, 0),
  }
}

export function generateMarketplaceMessageDraft(
  reconciliationResults: ReconciliationResult[],
): MarketplaceMessageDraft {
  const referencedRecords = reconciliationResults
    .filter((result) => result.manualReviewRecommended)
    .map((result) => result.settlementId)

  const recordLines = reconciliationResults
    .filter((result) => result.manualReviewRecommended)
    .map(
      (result) =>
        `- ${result.settlementId} / ${result.orderId}: beklenen ${result.expectedAmount.toLocaleString(
          'tr-TR',
        )} TL, banka ödemesi ${result.actualPaidAmount.toLocaleString(
          'tr-TR',
        )} TL, fark ${result.difference.toLocaleString('tr-TR')} TL.`,
    )
    .join('\n')

  return {
    subject: 'Hakediş ve banka ödeme kayıtları için inceleme talebi',
    body: `Merhaba,\n\nAşağıdaki hakediş kayıtlarında mevcut raporlarımız ile banka hareketleri arasında kontrol edilmesi faydalı görünen farklar bulunmaktadır:\n\n${recordLines}\n\nİlgili kayıtların pazaryeri hakediş raporu ve banka ödeme kaydıyla birlikte incelenmesini rica ederiz.\n\nTeşekkürler.`,
    referencedRecords,
    tone: 'Profesyonel, nötr ve inceleme talep eden',
    disclaimer:
      'Bu taslak kesin hata iddiası içermez; mevcut demo verisine göre inceleme talebi oluşturmak için hazırlanmıştır.',
  }
}

export function generateReconciliationSummary(
  results: ReconciliationResult[],
  deductionSummary: DeductionSummary,
) {
  const expectedSettlement = results.reduce((sum, result) => sum + result.expectedAmount, 0)
  const totalDeductions =
    deductionSummary.commissionTotal +
    deductionSummary.shippingTotal +
    deductionSummary.returnTotal +
    deductionSummary.campaignTotal +
    deductionSummary.serviceFeeTotal

  return {
    totalGrossSales: expectedSettlement + totalDeductions,
    expectedSettlement,
    actualPaid: results.reduce((sum, result) => sum + result.actualPaidAmount, 0),
    totalDifference: results.reduce((sum, result) => sum + result.difference, 0),
    unexplainedDifference: deductionSummary.unexplainedDifference,
    manualReviewCount: results.filter((result) => result.manualReviewRecommended).length,
    delayedPaymentCount: results.filter((result) => result.isDelayed).length,
  }
}
