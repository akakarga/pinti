import { z } from 'zod'

const looseRecord = z.record(z.string(), z.unknown())

export const pintiDatasetSchema = z
  .object({
    id: z.string().optional(),
    companyProfile: looseRecord,
    products: z.array(looseRecord),
    orders: z.array(looseRecord),
    returns: z.array(looseRecord),
    customers: z.array(looseRecord),
    paymentDisputes: z.array(looseRecord),
    campaigns: z.array(looseRecord),
    campaignPerformance: z.array(looseRecord),
    settlements: z.array(looseRecord),
    bankTransactions: z.array(looseRecord),
    campaignSimulationScenarios: z.array(looseRecord),
  })
  .passthrough()

export const datasetUploadSchema = z
  .object({
    dataset: pintiDatasetSchema.optional(),
    fileName: z.string().trim().min(1).optional(),
  })
  .passthrough()

export const analysisRunSchema = z
  .object({
    datasetId: z.string().trim().min(1),
    manualOverrides: z
      .object({
        productOverrides: z.record(z.string(), looseRecord).optional(),
        campaignOverrides: z.record(z.string(), looseRecord).optional(),
        returnOverrides: z.record(z.string(), looseRecord).optional(),
        reconciliationOverrides: looseRecord.optional(),
        campaignSimulationOverrides: z.record(z.string(), looseRecord).optional(),
      })
      .partial()
      .optional(),
  })
  .passthrough()

export function extractDatasetPayload(body: unknown) {
  const uploadParse = datasetUploadSchema.safeParse(body)

  if (uploadParse.success && uploadParse.data.dataset) {
    return {
      dataset: uploadParse.data.dataset,
      fileName: uploadParse.data.fileName ?? null,
    }
  }

  return {
    dataset: body,
    fileName: uploadParse.success ? uploadParse.data.fileName ?? null : null,
  }
}
