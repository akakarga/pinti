import type {
  DatasetValidationCounts,
  DatasetValidationResult,
  ManualOverrides,
  PintiDataset,
} from '../../../src/types/index.ts'

export type { DatasetValidationCounts, DatasetValidationResult, ManualOverrides, PintiDataset }

export interface StoredDataset {
  datasetId: string
  sourceDatasetId: string
  uploadedAt: string
  fileName: string | null
  validation: DatasetValidationResult
  dataset: PintiDataset
}

export interface DatasetUploadResponse {
  ok: true
  datasetId: string
  sourceDatasetId: string
  uploadedAt: string
  validation: DatasetValidationResult
}
