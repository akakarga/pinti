import { Router } from 'express'
import { analysisRunSchema } from '../schemas/dataset.schema.ts'
import { ApiError } from '../services/apiError.ts'
import { getAnalysis, getAnalysisModule, runAnalysis } from '../services/analysisRunner.service.ts'
import { moduleSlugs, type ModuleSlug } from '../types/analysis.types.ts'
import type { ManualOverrides } from '../types/dataset.types.ts'

export const analysisRoutes = Router()

analysisRoutes.post('/run', async (request, response, next) => {
  try {
    const parsed = analysisRunSchema.safeParse(request.body)

    if (!parsed.success) {
      response.status(400).json({
        ok: false,
        message: 'analysis/run isteği geçersiz.',
        errors: parsed.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      })
      return
    }

    const analysis = await runAnalysis(
      parsed.data.datasetId,
      parsed.data.manualOverrides as Partial<ManualOverrides> | undefined,
    )

    response.status(201).json({
      ok: true,
      analysisId: analysis.analysisId,
      datasetId: analysis.datasetId,
      createdAt: analysis.createdAt,
      status: analysis.status,
      dashboard: analysis.dashboard,
      topActions: analysis.actions.topActions,
      healthSummary: analysis.healthSummary,
      moduleSummaries: analysis.moduleSummaries,
    })
  } catch (error) {
    next(error)
  }
})

analysisRoutes.get('/:analysisId', async (request, response, next) => {
  try {
    const analysis = await getAnalysis(request.params.analysisId)

    if (!analysis) {
      throw new ApiError(404, `Analiz bulunamadı: ${request.params.analysisId}`)
    }

    response.json({
      ok: true,
      analysis,
    })
  } catch (error) {
    next(error)
  }
})

analysisRoutes.get('/:analysisId/dashboard', async (request, response, next) => {
  try {
    const analysis = await getAnalysis(request.params.analysisId)

    if (!analysis) {
      throw new ApiError(404, `Analiz bulunamadı: ${request.params.analysisId}`)
    }

    response.json({
      ok: true,
      analysisId: analysis.analysisId,
      dashboard: analysis.dashboard,
      healthSummary: analysis.healthSummary,
      moduleSummaries: analysis.moduleSummaries,
    })
  } catch (error) {
    next(error)
  }
})

analysisRoutes.get('/:analysisId/actions', async (request, response, next) => {
  try {
    const analysis = await getAnalysis(request.params.analysisId)

    if (!analysis) {
      throw new ApiError(404, `Analiz bulunamadı: ${request.params.analysisId}`)
    }

    response.json({
      ok: true,
      analysisId: analysis.analysisId,
      actions: analysis.actions,
    })
  } catch (error) {
    next(error)
  }
})

analysisRoutes.get('/:analysisId/modules/:moduleName', async (request, response, next) => {
  try {
    const moduleName = request.params.moduleName

    if (!moduleSlugs.includes(moduleName as ModuleSlug)) {
      response.status(400).json({
        ok: false,
        message: 'Geçersiz moduleName.',
        allowedModuleNames: moduleSlugs,
      })
      return
    }

    const analysis = await getAnalysis(request.params.analysisId)

    if (!analysis) {
      throw new ApiError(404, `Analiz bulunamadı: ${request.params.analysisId}`)
    }

    response.json({
      ok: true,
      analysisId: analysis.analysisId,
      moduleName,
      result: getAnalysisModule(analysis, moduleName as ModuleSlug),
    })
  } catch (error) {
    next(error)
  }
})
