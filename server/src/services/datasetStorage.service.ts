import { randomUUID } from 'node:crypto'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { basename, join } from 'node:path'
import type { DatasetValidationResult, PintiDataset, StoredDataset } from '../types/dataset.types.ts'

const serverRoot = basename(process.cwd()) === 'server' ? process.cwd() : join(process.cwd(), 'server')
const dataRoot = process.env.PINTI_API_DATA_DIR ?? join(serverRoot, 'src/data')
const uploadsDir = join(dataRoot, 'uploads')
const analysesDir = join(dataRoot, 'analyses')

export const storagePaths = {
  dataRoot,
  uploadsDir,
  analysesDir,
}

async function ensureStorage() {
  await mkdir(uploadsDir, { recursive: true })
  await mkdir(analysesDir, { recursive: true })
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${randomUUID().slice(0, 8)}`
}

function datasetPath(datasetId: string) {
  return join(uploadsDir, `${datasetId}.json`)
}

export function analysisPath(analysisId: string) {
  return join(analysesDir, `${analysisId}.json`)
}

async function writeJsonAtomic(path: string, value: unknown) {
  await ensureStorage()
  const tempPath = `${path}.${randomUUID()}.tmp`
  await writeFile(tempPath, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
  await rename(tempPath, path)
}

export async function saveDatasetUpload(
  dataset: PintiDataset,
  validation: DatasetValidationResult,
  fileName: string | null,
) {
  const datasetId = createId('ds')
  const storedDataset: StoredDataset = {
    datasetId,
    sourceDatasetId: dataset.id,
    uploadedAt: new Date().toISOString(),
    fileName,
    validation,
    dataset,
  }

  await writeJsonAtomic(datasetPath(datasetId), storedDataset)

  return storedDataset
}

export async function getStoredDataset(datasetId: string): Promise<StoredDataset | null> {
  try {
    const content = await readFile(datasetPath(datasetId), 'utf8')
    return JSON.parse(content) as StoredDataset
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return null
    }

    throw error
  }
}

export async function saveAnalysisResult<TAnalysis extends { analysisId: string }>(
  analysis: TAnalysis,
) {
  await writeJsonAtomic(analysisPath(analysis.analysisId), analysis)
  return analysis
}

export async function getStoredAnalysis<TAnalysis>(analysisId: string): Promise<TAnalysis | null> {
  try {
    const content = await readFile(analysisPath(analysisId), 'utf8')
    return JSON.parse(content) as TAnalysis
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return null
    }

    throw error
  }
}
